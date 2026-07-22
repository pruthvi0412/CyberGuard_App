const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get message history for a complaint
// @route   GET /api/chats/:complaintId
exports.getMessages = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.complaintId }, { complaintId: req.params.complaintId }]
    });

    if (!complaint) return next(new AppError('Complaint not found', 404));

    // Access Control
    const isOwner = complaint.userId.toString() === req.user._id.toString();
    const isOfficer = ['admin', 'officer'].includes(req.user.role);
    
    if (!isOwner && !isOfficer) {
      return next(new AppError('Not authorized to access this chat', 403));
    }

    const messages = await Message.find({ complaintId: complaint._id })
      .populate('sender', 'name role avatar')
      .sort('createdAt');

    res.json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a new message (usually via socket, but available as fallback)
// @route   POST /api/chats/:complaintId
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, iv, attachments } = req.body;
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.complaintId }, { complaintId: req.params.complaintId }]
    });

    if (!complaint) return next(new AppError('Complaint not found', 404));

    const message = await Message.create({
      complaintId: complaint._id,
      sender: req.user._id,
      content,
      iv,
      attachments
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

// @desc    Get private messages between users
// @route   GET /api/chats/private/:userId
exports.getPrivateMessages = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherId },
        { sender: otherId, recipient: myId }
      ],
      complaintId: { $exists: false }
    })
      .populate('sender', 'name role avatar')
      .sort('createdAt');

    res.json({ status: 'success', data: { messages } });
  } catch (error) { next(error); }
};

// @desc    Send private message
// @route   POST /api/chats/private/:userId
exports.sendPrivateMessage = async (req, res, next) => {
  try {
    const { content, iv } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      recipient: req.params.userId,
      content,
      iv
    });
    await message.populate('sender', 'name role avatar');
    res.status(201).json({ status: 'success', data: { message } });
  } catch (error) { next(error); }
};
