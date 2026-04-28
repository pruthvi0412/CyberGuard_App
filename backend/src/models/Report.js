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
    // Generated before save
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Complaint details
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },

  // Crime classification (from ML)
  category: {
    type: String,
    enum: [
      'phishing',
      'identity_theft',
      'online_fraud',
      'cyberbullying',
      'hacking',
      'ransomware',
      'social_media_crime',
      'financial_fraud',
      'data_breach',
      'child_exploitation',
      'other',
    ],
    default: 'other',
  },
  mlPrediction: {
    category: String,
    confidence: { type: Number, min: 0, max: 1 },
    scores: { type: Map, of: Number },
    modelVersion: String,
    predictedAt: Date,
  },

  // Severity
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed', 'rejected'],
    default: 'pending',
    index: true,
  },

  // Victim details
  victimDetails: {
    financialLoss: { type: Number, default: 0, min: 0 },
    lossType: {
      type: String,
      enum: ['monetary', 'data', 'identity', 'emotional', 'other', 'none'],
      default: 'none',
    },
    incidentDate: { type: Date, required: true },
  },

  // Suspect info (optional)
  suspectInfo: {
    name: String,
    email: String,
    phone: String,
    website: String,
    socialMedia: String,
    ipAddress: String,
    additionalInfo: String,
  },

  // Evidence files
  evidence: [evidenceSchema],

  // Timeline
  timeline: [timelineSchema],

  // Resolution
  resolution: {
    notes: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    actionTaken: String,
  },

  // Location
  location: {
    state: String,
    district: String,
    pincode: String,
  },

  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web',
  },
  isAnonymous: { type: Boolean, default: false },
  priority: { type: Number, default: 5, min: 1, max: 10 },
  tags: [{ type: String, trim: true }],
  internalNotes: [{ note: String, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, addedAt: Date }],

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Auto-generate complaint ID
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CC-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Add to timeline on status change
complaintSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      message: `Status updated to ${this.status.replace('_', ' ')}`,
      timestamp: new Date(),
    });
  }
  next();
});

// Indexes
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ status: 1, severity: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ 'victimDetails.incidentDate': -1 });

// Text index for search
complaintSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
