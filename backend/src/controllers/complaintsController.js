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
const smsService = require('../services/smsService');
const threatIntelligence = require('../utils/threatIntelligence');

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
      const errorMsg = errors.array().map(e => e.msg).join('. ');
      return res.status(400).json({ status: 'fail', message: errorMsg, errors: errors.array() });
    }

    const {
      title,
      description,
      victimDetails,
      suspectInfo,
      location,
      isAnonymous,
      category: userCategory,
      subCategory,
      modusOperandi,
      lostMoney,
      relationshipWithVictim,
      severity: userSeverity,
      priority: userPriority,
      isImmediateAction: userImmediateAction
    } = req.body;

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
    let parsedVictimDetails = {};
    if (typeof victimDetails === 'string') {
      try { parsedVictimDetails = JSON.parse(victimDetails); } catch (_) { parsedVictimDetails = {}; }
    } else if (victimDetails && typeof victimDetails === 'object') {
      parsedVictimDetails = victimDetails;
    }
    if (!parsedVictimDetails.incidentDate) {
      parsedVictimDetails.incidentDate = new Date();
    }

    let parsedSuspectInfo = {};
    if (typeof suspectInfo === 'string') {
      try { parsedSuspectInfo = JSON.parse(suspectInfo); } catch (_) { parsedSuspectInfo = {}; }
    } else if (suspectInfo && typeof suspectInfo === 'object') {
      parsedSuspectInfo = suspectInfo;
    }

    let parsedLocation = null;
    if (typeof location === 'string') {
      try { parsedLocation = JSON.parse(location); } catch (_) { parsedLocation = null; }
    } else if (location && typeof location === 'object') {
      parsedLocation = location;
    }

    // Determine category & priority rules
    const isSafetyCategory = /women|child|domestic|harass|safety|emergency/i.test(userCategory || '');
    const isImmediateAction = userImmediateAction === true || userImmediateAction === 'true' || isSafetyCategory;
    const priority = isImmediateAction ? 'top_priority' : (userPriority || 'standard');

    let severity = userSeverity || 'low';
    if (isImmediateAction || ['financial_fraud', 'hacking', 'ransomware', 'child_exploitation'].includes(mlPrediction?.category)) {
      severity = 'high';
    } else if (mlPrediction?.category === 'phishing') {
      severity = 'low';
    } else if (mlPrediction?.confidence > 0.8) {
      severity = 'high';
    } else if (mlPrediction?.confidence > 0.6) {
      severity = 'medium';
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      title,
      description,
      category: userCategory || mlPrediction?.category || 'Other',
      subCategory,
      modusOperandi,
      lostMoney: lostMoney === 'true' || lostMoney === true,
      relationshipWithVictim,
      mlPrediction,
      severity,
      priority,
      isImmediateAction,
      victimDetails: parsedVictimDetails,
      suspectInfo: parsedSuspectInfo,
      location: parsedLocation,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      evidence,
      source: req.body.source || 'web',
      timeline: [{
        status: 'pending',
        message: isImmediateAction
          ? '🚨 EMERGENCY PROTOCOL ACTIVATED: High priority Women & Child Safety incident logged for immediate tactical response.'
          : 'Complaint submitted successfully. Under review.',
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
      priority: complaint.priority,
      isImmediateAction: complaint.isImmediateAction,
      title: complaint.title,
    });
    io.to(`user-${req.user._id}`).emit('complaint-submitted', {
      complaintId: complaint.complaintId,
      status: complaint.status,
    });

    logger.info(`Complaint created: ${complaint.complaintId} by user ${req.user._id}`);

    // Dispatch email alert to admins/officers
    try {
      const User = require('../models/User'); // Import User model dynamically if not at top
      const adminsAndOfficers = await User.find({ role: { $in: ['admin', 'officer', 'owner'] } }).select('email name');
      emailAgentService.sendNewComplaintAlert(adminsAndOfficers, complaint, req.user);
    } catch (err) {
      logger.error(`Error dispatching new complaint email alert: ${err.message}`);
    }

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
      const updateData = {
        ocrData: {
          rawText: allRawText.trim(),
          extracted: allExtracted,
          analyzedAt: new Date()
        }
      };

      try {
        // Classify cybercrime type directly from OCR extracted text
        const ocrPrediction = await mlService.predict(allRawText.trim());
        if (ocrPrediction && ocrPrediction.category && ocrPrediction.category !== 'Other') {
          const currentComplaint = await Complaint.findById(complaintId);
          if (currentComplaint && (!currentComplaint.category || currentComplaint.category === 'Other' || currentComplaint.aiConfidence < 0.7)) {
            updateData.category = ocrPrediction.category;
            updateData.subcategory = ocrPrediction.subcategory;
            updateData.aiConfidence = ocrPrediction.confidence;
            if (ocrPrediction.severity) updateData.severity = ocrPrediction.severity;
          }
        }
      } catch (classifyErr) {
        logger.warn(`OCR AI post-classification skipped: ${classifyErr.message}`);
      }

      await Complaint.findByIdAndUpdate(complaintId, updateData);
      logger.info(`OCR and evidence analysis completed for complaint ${complaintId}`);
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
    if (category) {
      if (category.toLowerCase() === 'safety') {
        query.$or = [
          { category: { $in: ['Women/Child Safety', 'Domestic Violence', 'Child Exploitation', 'Harassment', 'Emergency Safety'] } },
          { isImmediateAction: true }
        ];
      } else if (category.includes(',')) {
        query.category = { $in: category.split(',').map(c => c.trim()) };
      } else {
        query.category = category;
      }
    }
    if (severity) query.severity = severity;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.isImmediateAction !== undefined) {
      query.isImmediateAction = req.query.isImmediateAction === 'true';
    }
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
    }).populate('userId', 'name email phone');

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

    // SMS Agent: Send State Change SMS
    smsService.sendStatusUpdateSMS(complaint.userId, complaint, status, message);

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
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ status: 'fail', message: 'Search query must be at least 2 characters.' });
    }

    const trimmed = q.trim();

    // 1. Search Threat Intelligence Repository (Curated Scam numbers, Phishing URLs, VoIP)
    const threatMatches = threatIntelligence.lookupThreat(trimmed);

    // 2. Search MongoDB Complaint database
    let dbResults = [];
    try {
      dbResults = await Complaint.find({
        $or: [
          { 'suspectInfo.details': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.name': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.phone': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.email': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.upiId': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.bankAccount': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.socialMediaHandle': { $regex: trimmed, $options: 'i' } },
          { 'suspectInfo.websiteUrl': { $regex: trimmed, $options: 'i' } },
          { 'description': { $regex: trimmed, $options: 'i' } },
          { 'ocrData.extracted.phones': { $regex: trimmed, $options: 'i' } },
          { 'ocrData.extracted.upis': { $regex: trimmed, $options: 'i' } },
          { 'ocrData.extracted.accounts': { $regex: trimmed, $options: 'i' } },
        ]
      }).select('complaintId category severity status createdAt suspectInfo description').limit(20).lean();
    } catch (dbErr) {
      logger.warn('DB search warning: ' + dbErr.message);
    }

    // Combine results (avoiding duplicates by complaintId)
    const combined = [...threatMatches];
    const existingIds = new Set(threatMatches.map(m => m.complaintId));

    for (const r of dbResults) {
      if (!existingIds.has(r.complaintId)) {
        combined.push({
          complaintId: r.complaintId,
          category: r.category || 'Cybercrime Complaint',
          severity: r.severity || 'medium',
          riskLevel: r.severity === 'high' ? 'critical' : 'high',
          identifier: r.suspectInfo?.phone || r.suspectInfo?.websiteUrl || r.suspectInfo?.upiId || trimmed,
          type: r.suspectInfo?.phone ? 'PHONE' : (r.suspectInfo?.websiteUrl ? 'WEBSITE' : 'CREDENTIAL'),
          details: r.description ? r.description.slice(0, 120) + '...' : 'Citizen report on active cybercrime registry.',
          status: r.status || 'UNDER INVESTIGATION',
          createdAt: r.createdAt || new Date().toISOString()
        });
        existingIds.add(r.complaintId);
      }
    }

    res.json({
      status: 'success',
      data: {
        isScam: combined.length > 0,
        count: combined.length,
        results: combined
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
