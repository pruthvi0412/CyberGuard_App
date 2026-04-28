const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
});

router.patch('/profile', async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
});

// Register push token for mobile notifications
router.post('/push-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { notificationTokens: token } });
    res.json({ status: 'success', message: 'Push token registered.' });
  } catch (error) { next(error); }
});

module.exports = router;
