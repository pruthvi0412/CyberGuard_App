const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { AppError } = require('../middleware/errorHandler');
const mlService = require('../services/mlService');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ocrService = require('../services/ocrService');
const emailAgentService = require('../services/emailAgentService');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'evidence');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `evidence-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed.`, 400), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
}).array('evidence', 5);

// @desc    Submit new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { title, description, victimDetails, suspectInfo, location, isAnonymous } = req.body;

    // Call ML service for classification
    let mlPrediction = null;
    try {
      const fullText = title + ' ' + description;
      const prediction = await mlService.predict(fullText);
      
      // Keyword Boosters for Backend
      const lowVal = fullText.toLowerCase();
      const isPhishing = /phishing|spoof|fake|credentials|password|login|verify|link|email/i.test(lowVal);
      const isHacking = /hack|exploit|vulnerability|unauthorized|root|admin|sql|injection|breach/i.test(lowVal);
      const isFraud = /upi|bank|money|fund|transfer|drain|atm|card|payment|fraud|financial/i.test(lowVal);
      const isBullying = /bully|harass|threat|abuse|hate|stalk/i.test(lowVal);

      let category = prediction.category;
      if (isFraud && !isHacking) category = 'financial_fraud';
      else if (isPhishing && prediction.confidence < 0.6) category = 'phishing';
      else if (isBullying && prediction.confidence < 0.4) category = 'cyberbullying';

      mlPrediction = {
        category: category,
        confidence: prediction.confidence,
        scores: prediction.scores,
        modelVersion: prediction.model_version,
        predictedAt: new Date(),
      };
      logger.info(`ML prediction: ${category} (${(prediction.confidence * 100).toFixed(1)}%)`);
    } catch (mlError) {
      logger.warn(`ML service unavailable, using default category: ${mlError.message}`);
    }

    // Process uploaded evidence
    const evidence = (req.files || []).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/evidence/${file.filename}`,
    }));

    // Parse nested fields if sent as strings (mobile/form-data)
    const parsedVictimDetails = typeof victimDetails === 'string' ? JSON.parse(victimDetails) : victimDetails;
    const parsedSuspectInfo = typeof suspectInfo === 'string' ? JSON.parse(suspectInfo) : suspectInfo;
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    // Determine severity based on category rules or ML confidence
    let severity = 'low';
    if (['financial_fraud', 'hacking', 'ransomware', 'child_exploitation'].includes(mlPrediction?.category)) {
      severity = 'high';
    } else if (mlPrediction?.category === 'phishing') {
      severity = 'low';
    } else {
      severity = mlPrediction?.confidence > 0.8 ? 'high'
        : mlPrediction?.confidence > 0.6 ? 'medium' : 'low';
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      title,
      description,
      category: mlPrediction?.category || 'other',
      mlPrediction,
      severity,
      victimDetails: parsedVictimDetails,
      suspectInfo: parsedSuspectInfo,
      location: parsedLocation,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      evidence,
      source: req.body.source || 'web',
      timeline: [{
        status: 'pending',
        message: 'Complaint submitted successfully. Under review.',
        timestamp: new Date(),
      }],
    });

    await complaint.populate('userId', 'name email phone');

    // Emit real-time update
    const io = req.app.get('io');
    io.to('admin-room').emit('new-complaint', {
      complaintId: complaint.complaintId,
      category: complaint.category,
      severity: complaint.severity,
      title: complaint.title,
    });
    io.to(`user-${req.user._id}`).emit('complaint-submitted', {
      complaintId: complaint.complaintId,
      status: complaint.status,
    });

    logger.info(`Complaint created: ${complaint.complaintId} by user ${req.user._id}`);

    // Trigger OCR Background Analysis
    if (req.files && req.files.length > 0) {
      processOCR(complaint._id, req.files);
    }

    res.status(201).json({
      status: 'success',
      message: 'Complaint submitted successfully.',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to process OCR on uploaded images in the background
 */
async function processOCR(complaintId, files) {
  try {
    let allExtracted = { phones: [], upis: [], accounts: [] };
    let allRawText = "";
    
    for (const file of files) {
      // Only process images
      if (file.mimetype.startsWith('image/')) {
        const result = await ocrService.extractDataFromImage(file.path);
        if (result) {
          allRawText += `--- From ${file.originalname} ---\n${result.rawText}\n\n`;
          allExtracted.phones.push(...result.extracted.phones);
          allExtracted.upis.push(...result.extracted.upis);
          allExtracted.accounts.push(...result.extracted.accounts);
        }
      }
    }
    
    // Deduplicate extracted identifiers
    allExtracted.phones = [...new Set(allExtracted.phones)];
    allExtracted.upis = [...new Set(allExtracted.upis)];
    allExtracted.accounts = [...new Set(allExtracted.accounts)];
    
    if (allRawText.trim()) {
      await Complaint.findByIdAndUpdate(complaintId, {
        ocrData: {
          rawText: allRawText.trim(),
          extracted: allExtracted,
          analyzedAt: new Date()
        }
      });
      logger.info(`OCR completed for complaint ${complaintId}`);
    }
  } catch (err) {
    logger.error(`OCR Background process failed for ${complaintId}: ${err.message}`);
  }
}

// @desc    Get all complaints (admin) or user's complaints
// @route   GET /api/complaints
exports.getComplaints = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, status, category, severity,
      search, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Non-admin only sees their complaints
    if (req.user.role === 'user') {
      query.userId = req.user._id;
    }

    // Filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (search) query.$text = { $search: search };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [complaints, total, statusCounts] = await Promise.all([
      Complaint.find(query)
        .populate('userId', 'name email phone')
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Complaint.countDocuments(query),
      Complaint.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Format status counts for easier consumption
    const stats = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      status: 'success',
      data: {
        complaints,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.id }, { complaintId: req.params.id }],
    })
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('timeline.updatedBy', 'name role')
      .populate('resolution.resolvedBy', 'name');

    if (!complaint) return next(new AppError('Complaint not found.', 404));

    // Access control
    if (req.user.role === 'user' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this complaint.', 403));
    }

    // AI Email Agent: Send Viewed Email if Admin/Officer views and not previously viewed
    if (req.user.role !== 'user' && !complaint.isViewed) {
      complaint.isViewed = true;
      await complaint.save();
      emailAgentService.sendViewedEmail(complaint.userId, complaint, req.user.role || 'Officer');
    }

    res.json({ status: 'success', data: { complaint } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status (admin/officer)
// @route   PATCH /api/complaints/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, message, actionTaken } = req.body;
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.id }, { complaintId: req.params.id }],
    }).populate('userId', 'name email');

    if (!complaint) return next(new AppError('Complaint not found.', 404));

    const previousStatus = complaint.status;
    complaint.status = status;
    complaint.timeline.push({
      status,
      message: message || `Status changed from ${previousStatus} to ${status}`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    if (status === 'resolved') {
      complaint.resolution = {
        notes: message,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        actionTaken,
      };
    }

    await complaint.save();

    // Real-time notification to user
    const io = req.app.get('io');
    const userIdStr = complaint.userId._id ? complaint.userId._id.toString() : complaint.userId.toString();
    io.to(`user-${userIdStr}`).emit('status-update', {
      complaintId: complaint.complaintId,
      status: complaint.status,
      message,
    });

    // AI Email Agent: Send State Change Email
    emailAgentService.sendStateChangeEmail(complaint.userId, complaint, previousStatus, status, message);

    res.json({
      status: 'success',
      message: 'Complaint status updated.',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public search for suspect identifiers
// @route   GET /api/complaints/public/search
exports.publicSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 5) {
      return res.status(400).json({ status: 'fail', message: 'Search query must be at least 5 characters.' });
    }

    // Search in suspectInfo details and ocrData extracted fields
    const results = await Complaint.find({
      $or: [
        { 'suspectInfo.details': { $regex: q, $options: 'i' } },
        { 'ocrData.extracted.phones': q },
        { 'ocrData.extracted.upis': q },
        { 'ocrData.extracted.accounts': q },
      ]
    }).select('complaintId category severity status createdAt').limit(20);

    res.json({
      status: 'success',
      data: {
        count: results.length,
        results: results
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track complaint by ID (public)
// @route   GET /api/complaints/track/:complaintId
exports.trackComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
      .select('complaintId status category severity title description evidence victimDetails location timeline createdAt updatedAt')
      .lean();

    if (!complaint) return next(new AppError('Complaint not found. Please check the ID.', 404));

    res.json({ status: 'success', data: { complaint } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (admin only)
// @route   DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return next(new AppError('Complaint not found.', 404));
    res.json({ status: 'success', message: 'Complaint deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze description for real-time feedback
// @route   POST /api/complaints/analyze
exports.analyzeDescription = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 5) {
      return res.json({ status: 'success', data: { category: 'other', confidence: 0 } });
    }

    const prediction = await mlService.predict(text);
    res.json({ status: 'success', data: prediction });
  } catch (error) {
    logger.warn(`AI analysis failed: ${error.message}`);
    res.json({ status: 'fail', message: 'Analysis service unavailable' });
  }
};
