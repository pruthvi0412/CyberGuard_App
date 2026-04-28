const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const evidenceSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    // This setter ensures that even if you type 'phishing', 
    // it saves as 'Phishing' to match the enum
    set: v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
    enum: {
      values: ['Financial Fraud', 'Cyber Bullying', 'Data Breach', 'Phishing', 'Other'],
      message: '{VALUE} is not a supported category'
    }
  },
  evidence: [evidenceSchema],
  timeline: [timelineSchema],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  }
}, { timestamps: true });

// Auto-generate Complaint ID before saving
complaintSchema.pre('save', function(next) {
  if (!this.complaintId) {
    this.complaintId = 'CMP-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);