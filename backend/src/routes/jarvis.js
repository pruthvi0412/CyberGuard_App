const express = require('express');
const router = express.Router();
const { jarvisChat } = require('../controllers/jarvisController');

// POST /api/jarvis/chat
router.post('/chat', jarvisChat);

module.exports = router;
