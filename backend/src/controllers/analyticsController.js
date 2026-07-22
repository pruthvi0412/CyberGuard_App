const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// @desc    Dashboard overview stats
// @route   GET /api/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalComplaints, pendingComplaints, resolvedComplaints,
      thisMonthComplaints, lastMonthComplaints,
      totalUsers, criticalComplaints,
      avgResolutionTime,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Complaint.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ role: 'user' }),
      Complaint.countDocuments({ severity: 'critical' }),
      Complaint.aggregate([
        { $match: { status: 'resolved', 'resolution.resolvedAt': { $exists: true } } },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolution.resolvedAt', '$createdAt'],
            },
          },
        },
        { $group: { _id: null, avg: { $avg: '$resolutionTime' } } },
      ]),
    ]);

    const growthRate = lastMonthComplaints > 0
      ? (((thisMonthComplaints - lastMonthComplaints) / lastMonthComplaints) * 100).toFixed(1)
      : 0;

    const avgDays = avgResolutionTime[0]
      ? Math.round(avgResolutionTime[0].avg / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      status: 'success',
      data: {
        overview: {
          totalComplaints,
          pendingComplaints,
          resolvedComplaints,
          thisMonthComplaints,
          growthRate: parseFloat(growthRate),
          totalUsers,
          criticalComplaints,
          avgResolutionDays: avgDays,
          resolutionRate: totalComplaints > 0
            ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complaints by category
// @route   GET /api/analytics/by-category
exports.getByCategory = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$severity', 'critical'] }, then: 4 },
                  { case: { $eq: ['$severity', 'high'] }, then: 3 },
                  { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                  { case: { $eq: ['$severity', 'low'] }, then: 1 },
                ],
                default: 2,
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ status: 'success', data: { categories: data } });
  } catch (error) {
    next(error);
  }
};

// @desc    Monthly trends
// @route   GET /api/analytics/trends
exports.getTrends = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const data = await Complaint.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formatted = data.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.total,
      resolved: item.resolved,
      pending: item.pending,
      critical: item.critical,
    }));

    res.json({ status: 'success', data: { trends: formatted } });
  } catch (error) {
    next(error);
  }
};

// @desc    Geographic distribution
// @route   GET /api/analytics/geographic
exports.getGeographic = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { $match: { 'location.state': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({ status: 'success', data: { geographic: data } });
  } catch (error) {
    next(error);
  }
};

// @desc    Map points (coordinates)
// @route   GET /api/analytics/map-points
exports.getMapPoints = async (req, res, next) => {
  try {
    const data = await Complaint.find({
      'location.coordinates': { $exists: true, $size: 2 },
    })
      .select('complaintId title category severity status location victimDetails.pincode createdAt')
      .lean();

    res.json({ status: 'success', data: { points: data } });
  } catch (error) {
    next(error);
  }
};

// @desc    Public map points (Anonymized)
// @route   GET /api/analytics/public/map-points
exports.getPublicMapPoints = async (req, res, next) => {
  try {
    const data = await Complaint.find({
      'location.coordinates': { $exists: true, $size: 2 },
    })
      .select('category severity location createdAt') // No IDs or Titles
      .lean();

    res.json({ status: 'success', data: { points: data } });
  } catch (error) {
    next(error);
  }
};

// @desc    Status distribution
// @route   GET /api/analytics/status-distribution
exports.getStatusDistribution = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ status: 'success', data: { distribution: data } });
  } catch (error) {
    next(error);
  }
};

// @desc    Financial loss analysis
// @route   GET /api/analytics/financial
exports.getFinancialAnalysis = async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { $match: { 'victimDetails.financialLoss': { $gt: 0 } } },
      {
        $group: {
          _id: '$category',
          totalLoss: { $sum: '$victimDetails.financialLoss' },
          avgLoss: { $avg: '$victimDetails.financialLoss' },
          count: { $sum: 1 },
          maxLoss: { $max: '$victimDetails.financialLoss' },
        },
      },
      { $sort: { totalLoss: -1 } },
    ]);

    const totalFinancialLoss = data.reduce((sum, d) => sum + d.totalLoss, 0);

    res.json({
      status: 'success',
      data: { financialAnalysis: data, totalFinancialLoss },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspect link analysis (identify serial scammers)
// @route   GET /api/analytics/link-analysis
exports.getLinkAnalysis = async (req, res, next) => {
  try {
    // Link by Extracted Phone Numbers
    const phoneLinks = await Complaint.aggregate([
      { $match: { 'ocrData.extracted.phones': { $exists: true, $ne: [] } } },
      { $unwind: '$ocrData.extracted.phones' },
      {
        $group: {
          _id: '$ocrData.extracted.phones',
          count: { $sum: 1 },
          cases: { $push: { id: '$complaintId', category: '$category', severity: '$severity', status: '$status' } }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    // Link by Extracted UPI IDs
    const upiLinks = await Complaint.aggregate([
      { $match: { 'ocrData.extracted.upis': { $exists: true, $ne: [] } } },
      { $unwind: '$ocrData.extracted.upis' },
      {
        $group: {
          _id: '$ocrData.extracted.upis',
          count: { $sum: 1 },
          cases: { $push: { id: '$complaintId', category: '$category', severity: '$severity', status: '$status' } }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      status: 'success',
      data: {
        links: {
          phones: phoneLinks,
          upis: upiLinks
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
