const mongoose = require('mongoose');

const mailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: [true, 'Recipient email is required'],
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
  },
  body: {
    type: String,
    required: [true, 'Email body is required'],
  },
  complaintId: {
    type: String,
    required: false,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MailLog', mailLogSchema);
