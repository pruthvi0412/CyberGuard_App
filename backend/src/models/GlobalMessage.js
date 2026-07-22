const mongoose = require('mongoose');

const globalMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String
  }],
  isAnnouncement: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalMessage', globalMessageSchema);
