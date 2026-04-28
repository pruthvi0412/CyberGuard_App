const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const mlService = require('../services/mlService');
const { protect, restrictTo } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

router.use(protect, restrictTo('admin'));

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({ status: 'success', data: { users, total } });
  } catch (error) { next(error); }
});

// Update user role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'officer', 'admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return next(new AppError('User not found', 404));
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
});

// Toggle user status
router.patch('/users/:id/toggle-status', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    user.isActive = !user.isActive;
    await user.save();
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
});

// Assign complaint to officer
router.patch('/complaints/:id/assign', async (req, res, next) => {
  try {
    const { officerId } = req.body;
    const officer = await User.findOne({ _id: officerId, role: 'officer' });
    if (!officer) return next(new AppError('Officer not found', 404));

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: officerId, status: 'under_review' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!complaint) return next(new AppError('Complaint not found', 404));
    res.json({ status: 'success', data: { complaint } });
  } catch (error) { next(error); }
});

// ML Service status
router.get('/ml-status', async (req, res, next) => {
  try {
    const [status, modelInfo] = await Promise.all([
      mlService.healthCheck(),
      mlService.getModelInfo(),
    ]);
    res.json({ status: 'success', data: { mlService: status, modelInfo } });
  } catch (error) { next(error); }
});

// System stats
router.get('/system-stats', async (req, res, next) => {
  try {
    const [totalUsers, totalComplaints, pendingComplaints] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
    ]);
    res.json({
      status: 'success',
      data: {
        system: {
          totalUsers,
          totalComplaints,
          pendingComplaints,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      },
    });
  } catch (error) { next(error); }
});

module.exports = router;
