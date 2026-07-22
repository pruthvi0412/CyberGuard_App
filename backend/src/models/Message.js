const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: false,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  content: {
    type: String,
    required: true // This will store the encrypted content
  },
  iv: {
    type: String,
    required: true // Initialization Vector for encryption
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String
  }],
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
