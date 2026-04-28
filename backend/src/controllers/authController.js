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
    const { name, email, password } = req.body;
    
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    const { accessToken, refreshToken } = generateTokens(newUser._id);
    
    res.status(201).json({
      status: 'success',
      data: {
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
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

// EXPORT EVERYTHING
module.exports = { 
  login, 
  register, 
  refreshToken, 
  getMe, 
  logout, 
  updatePassword 
};