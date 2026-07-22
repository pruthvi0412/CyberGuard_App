const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const globalChatController = require('../controllers/globalChatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/global', globalChatController.getGlobalMessages);
router.post('/global', globalChatController.sendGlobalMessage);
router.get('/private/:userId', chatController.getPrivateMessages);
router.post('/private/:userId', chatController.sendPrivateMessage);
router.get('/:complaintId', chatController.getMessages);
router.post('/:complaintId', chatController.sendMessage);

module.exports = router;
