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
    set: v => {
      if (!v) return v;
      // Convert snake_case or messy strings to "Title Case With Spaces"
      return v.split(/[_\s]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .replace('Cyberbullying', 'Cyber Bullying'); // Handle specific case
    },
    enum: {
      values: ['Financial Fraud', 'Cyber Bullying', 'Data Breach', 'Phishing', 'Identity Theft', 'Online Fraud', 'Hacking', 'Ransomware', 'Social Media Crime', 'Child Exploitation', 'Other'],
      message: '{VALUE} is not a supported category'
    }
  },
  evidence: [evidenceSchema],
  timeline: [timelineSchema],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed', 'rejected', 'in-progress'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  victimDetails: {
    incidentDate: { type: Date },
    incidentTime: { type: String },
    location: { type: String },
  },
  suspectInfo: {
    name: { type: String },
    details: { type: String },
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: 'web',
  },
  mlPrediction: {
    category: String,
    confidence: Number,
    scores: Object,
    modelVersion: String,
    predictedAt: Date,
  }
}, { timestamps: true });

// Auto-generate Complaint ID before saving
complaintSchema.pre('save', function (next) {
  if (!this.complaintId) {
    this.complaintId = 'CMP-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

// Index for text search
complaintSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);