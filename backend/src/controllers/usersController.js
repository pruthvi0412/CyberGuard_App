const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}`;
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images.', 400), false);
  }
};

exports.uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    
    // If avatar was uploaded in this request
    if (req.file) {
      updates.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { 
      new: true, 
      runValidators: true 
    });
    
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
};

exports.registerPushToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { notificationTokens: token } });
    res.json({ status: 'success', message: 'Push token registered.' });
  } catch (error) { next(error); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name role avatar status lastSeen')
      .lean();
    res.json({ status: 'success', data: { users } });
  } catch (error) { next(error); }
};
