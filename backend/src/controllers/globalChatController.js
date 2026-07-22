const GlobalMessage = require('../models/GlobalMessage');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get global chat history
// @route   GET /api/chats/global
exports.getGlobalMessages = async (req, res, next) => {
  try {
    const messages = await GlobalMessage.find()
      .populate('sender', 'name role avatar')
      .sort('-createdAt')
      .limit(100);

    res.json({
      status: 'success',
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post to global chat
// @route   POST /api/chats/global
exports.sendGlobalMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const message = await GlobalMessage.create({
      sender: req.user._id,
      content,
      isAnnouncement: req.user.role === 'admin'
    });

    await message.populate('sender', 'name role avatar');

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};
