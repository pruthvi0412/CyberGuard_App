const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { AppError } = require('../middleware/errorHandler');
const mlService = require('../services/mlService');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
      const prediction = await mlService.predict(title + ' ' + description);
      mlPrediction = {
        category: prediction.category,
        confidence: prediction.confidence,
        scores: prediction.scores,
        modelVersion: prediction.model_version,
        predictedAt: new Date(),
      };
      logger.info(`ML prediction: ${prediction.category} (${(prediction.confidence * 100).toFixed(1)}%)`);
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

    // Determine severity from ML confidence
    const severity = mlPrediction?.confidence > 0.8 ? 'high'
      : mlPrediction?.confidence > 0.6 ? 'medium' : 'low';

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

    res.status(201).json({
      status: 'success',
      message: 'Complaint submitted successfully.',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

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

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('userId', 'name email phone')
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Complaint.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        complaints,
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
    });

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
    io.to(`user-${complaint.userId}`).emit('status-update', {
      complaintId: complaint.complaintId,
      status: complaint.status,
      message,
    });

    res.json({
      status: 'success',
      message: 'Complaint status updated.',
      data: { complaint },
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
      .select('complaintId status category severity title timeline createdAt updatedAt')
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
