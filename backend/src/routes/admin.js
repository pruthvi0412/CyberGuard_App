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

// Test ML prediction (Playground)
router.post('/predict', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return next(new AppError('Please provide text to analyze', 400));
    
    const prediction = await mlService.predict(text);
    res.json({ status: 'success', data: prediction });
  } catch (error) { next(error); }
});

// System stats
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

router.get('/system-stats', async (req, res, next) => {
  try {
    const [totalUsers, totalComplaints, pendingComplaints] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
    ]);

    // Calculate CPU Load (approximate)
    const cpus = os.cpus();
    const load = os.loadavg();
    const cpuLoad = Math.min(100, Math.round((load[0] / cpus.length) * 100));

    // Memory calculation
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

    // Storage calculation
    let storageUsage = 45; // Fallback
    try {
      const { stdout } = await execPromise(os.platform() === 'win32' ? 'wmic logicaldisk get size,freespace' : "df -h / | tail -1 | awk '{print $5}'");
      if (os.platform() !== 'win32') {
        storageUsage = parseInt(stdout.replace('%', ''));
      }
    } catch (e) {
      console.error('Storage check failed', e);
    }

    res.json({
      status: 'success',
      data: {
        counts: {
          totalUsers,
          totalComplaints,
          pendingComplaints,
        },
        health: {
          cpu: cpuLoad,
          memory: memUsage,
          storage: storageUsage,
          uptime: os.uptime(),
        }
      },
    });
  } catch (error) { next(error); }
});

// Source Code Viewer
const fs = require('fs');
const path = require('path');

router.get('/codebase', async (req, res, next) => {
  try {
    const rootPath = path.resolve(__dirname, '../../../');
    const ignoreDirs = ['node_modules', '.git', 'build', 'dist', 'uploads', '.DS_Store', 'scratch', '.env'];

    const getFiles = (dir) => {
      const results = [];
      try {
        if (!fs.existsSync(dir)) return results;
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
          if (ignoreDirs.includes(file)) return;
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat && stat.isDirectory()) {
            results.push({
              name: file,
              type: 'directory',
              children: getFiles(fullPath)
            });
          } else {
            const ext = path.extname(file);
            const validExts = ['.js', '.jsx', '.json', '.md', '.html', '.css'];
            if (validExts.includes(ext) || file === '.env.example') {
              let content = '';
              try {
                content = fs.readFileSync(fullPath, 'utf8');
              } catch (e) {
                content = 'Error reading file content.';
              }
              results.push({
                name: file,
                type: 'file',
                content
              });
            }
          }
        });
      } catch (err) {
        console.error('Error reading directory:', dir, err);
      }
      return results;
    };

    const codebase = [
      {
        name: 'web-app/src',
        type: 'directory',
        children: getFiles(path.join(rootPath, 'web-app/src'))
      },
      {
        name: 'backend/src',
        type: 'directory',
        children: getFiles(path.join(rootPath, 'backend/src'))
      }
    ];

    res.json({ status: 'success', data: { codebase } });
  } catch (error) { next(error); }
});

const MailLog = require('../models/MailLog');

// Get sent emails
router.get('/emails', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const [emails, total] = await Promise.all([
      MailLog.find().sort({ sentAt: -1 })
        .skip((page - 1) * limit).limit(parseInt(limit)),
      MailLog.countDocuments()
    ]);
    
    res.json({ status: 'success', data: { emails, total } });
  } catch (error) { next(error); }
});

module.exports = router;
