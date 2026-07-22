const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usersController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', ctrl.getProfile);

// Update profile and avatar
router.patch('/profile', ctrl.uploadAvatar, ctrl.updateProfile);

// Register push token for mobile notifications
router.post('/push-token', ctrl.registerPushToken);
router.get('/', ctrl.getAllUsers);

module.exports = router;
