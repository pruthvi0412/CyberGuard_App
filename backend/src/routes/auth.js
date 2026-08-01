const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ---------------- VALIDATIONS ----------------
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 chars'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),

  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid Indian phone number required'),
];

// ---------------- SAFETY WRAPPER ----------------
// Prevents server crash if controller export is missing
const safe = (fn) => (req, res, next) => {
  if (typeof fn !== 'function') {
    return next(new Error('Controller function missing or undefined'));
  }
  return fn(req, res, next);
};

// ---------------- ROUTES ----------------
router.post('/register', registerValidation, safe(authController.register));
router.post('/login', loginValidation, safe(authController.login));
router.post('/verify-email-otp', safe(authController.verifyEmailOtp));

router.post('/refresh', safe(authController.refreshToken));
router.get('/me', protect, safe(authController.getMe));
router.post('/logout', protect, safe(authController.logout));
router.patch('/update-password', protect, safe(authController.updatePassword));

// Face ID Routes
router.post('/enroll-face', protect, safe(authController.enrollFace));
router.post('/verify-face', protect, safe(authController.verifyFace));

// 2FA Routes
router.post('/2fa/generate', protect, safe(authController.generate2FA));
router.post('/2fa/verify', protect, safe(authController.verify2FA));
router.post('/2fa/login', safe(authController.login2FA));
router.post('/2fa/disable', protect, safe(authController.disable2FA));

module.exports = router;