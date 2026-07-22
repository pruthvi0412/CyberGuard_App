const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// 1. LOGIN LOGIC
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
    const { password } = req.body;

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +isActive');

    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next(new AppError(`Account locked. Try again in ${lockTime} minutes.`, 423));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.loginAttempts = 0;
      }
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account deactivated. Contact support.', 401));
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);

    res.json({
      status: 'success',
      message: 'Login successful.',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ME (Fixes the Postman Loading issue)
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by the 'protect' middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. REGISTER LOGIC
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role
    });

    const { accessToken, refreshToken } = generateTokens(newUser._id);
    
    res.status(201).json({
      status: 'success',
      data: {
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. LOGOUT LOGIC
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// 5. REFRESH TOKEN & UPDATE PASSWORD PLACEHOLDERS
const refreshToken = async (req, res, next) => {
    res.status(200).json({ status: 'success', message: 'Token refresh endpoint' });
};
const updatePassword = async (req, res, next) => {
    res.status(200).json({ status: 'success', message: 'Password update endpoint' });
};

// 6. FACE ID BIOMETRICS
const enrollFace = async (req, res, next) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return next(new AppError('Invalid face descriptor. Must be a 128-dimensional array.', 400));
    }
    
    // Only Pruthvi Shetty can enroll
    const user = await User.findById(req.user.id);
    if (user.email !== 'pruthvishetty04@gmail.com') {
      return next(new AppError('UNAUTHORIZED: Face ID enrollment restricted to System Admin.', 403));
    }

    user.faceDescriptor = descriptor;
    await user.save({ validateBeforeSave: false });

    logger.info(`Face ID enrolled for user: ${user.email}`);
    res.status(200).json({ status: 'success', message: 'Face ID successfully enrolled.' });
  } catch (error) {
    next(error);
  }
};

const verifyFace = async (req, res, next) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return next(new AppError('Invalid face descriptor for verification.', 400));
    }

    // Must fetch user with select('+faceDescriptor') because it's hidden by default
    const user = await User.findById(req.user.id).select('+faceDescriptor');
    
    if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
      return next(new AppError('No Face ID enrolled for this user.', 404));
    }

    // Compute Euclidean Distance
    let sum = 0;
    for (let i = 0; i < 128; i++) {
      sum += Math.pow(user.faceDescriptor[i] - descriptor[i], 2);
    }
    const distance = Math.sqrt(sum);

    // Standard face-api.js threshold is ~0.5 to 0.6
    if (distance < 0.5) {
      res.status(200).json({ status: 'success', message: 'Biometric verification passed.', distance });
    } else {
      res.status(401).json({ status: 'fail', message: 'Rejected: Biometric Mismatch.', distance });
    }
  } catch (error) {
    next(error);
  }
};

// EXPORT EVERYTHING
module.exports = { 
  login, 
  register, 
  refreshToken, 
  getMe, 
  logout, 
  updatePassword,
  enrollFace,
  verifyFace
};