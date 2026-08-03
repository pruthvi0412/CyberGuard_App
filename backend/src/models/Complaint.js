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
    minlength: [3, 'Description must be at least 3 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    set: v => {
      if (!v) return 'Other';
      const clean = v.trim();
      if (/women.*child/i.test(clean)) return 'Women/Child Safety';
      if (/domestic.*violence/i.test(clean)) return 'Domestic Violence';
      if (/child.*exploit/i.test(clean)) return 'Child Exploitation';
      if (/cyber.*bully/i.test(clean)) return 'Cyber Bullying';
      if (/financial.*fraud|upi|bank/i.test(clean)) return 'Financial Fraud';
      if (/data.*breach|leak/i.test(clean)) return 'Data Breach';
      if (/phish|spoof|sso/i.test(clean)) return 'Phishing';
      if (/identity.*theft|impersonat/i.test(clean)) return 'Identity Theft';
      if (/online.*fraud|ecommerce|shopping/i.test(clean)) return 'Online Fraud';
      if (/hack|intrusion|unauthorized.*access/i.test(clean)) return 'Hacking';
      if (/ransom|malware|trojan/i.test(clean)) return 'Ransomware';
      if (/ddos|dos|network.*attack/i.test(clean)) return 'DDoS / Network Attacks';
      if (/crypto|web3|nft|bitcoin/i.test(clean)) return 'Cryptocurrency Scams';
      if (/social.*media/i.test(clean)) return 'Social Media Crime';
      if (/harass/i.test(clean)) return 'Harassment';
      if (/safety|emergency/i.test(clean)) return 'Women/Child Safety';
      return clean;
    },
    enum: {
      values: [
        'Financial Fraud',
        'Cyber Bullying',
        'Data Breach',
        'Phishing',
        'Identity Theft',
        'Online Fraud',
        'Hacking',
        'Ransomware',
        'Social Media Crime',
        'Child Exploitation',
        'Women/Child Safety',
        'Domestic Violence',
        'Harassment',
        'Emergency Safety',
        'DDoS / Network Attacks',
        'Cryptocurrency Scams',
        'Other'
      ],
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
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  priority: {
    type: String,
    enum: ['standard', 'medium', 'high', 'critical', 'emergency', 'top_priority'],
    default: 'standard',
  },
  isImmediateAction: {
    type: Boolean,
    default: false,
  },
  subCategory: { type: String },
  modusOperandi: { type: String },
  lostMoney: { type: Boolean, default: false },
  relationshipWithVictim: { type: String },
  victimDetails: {
    name: { type: String },
    incidentDate: { type: Date },
    incidentTime: { type: String },
    location: { type: String },
    pincode: { type: String },
    email: { type: String },
    mobile: { type: String },
    countryCode: { type: String },
    incidentOccurredWhere: { type: String },
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
  },
  ocrData: {
    rawText: String,
    extracted: {
      phones: [String],
      upis: [String],
      accounts: [String],
    },
    analyzedAt: Date
  },
  isViewed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-generate Complaint ID & apply Priority Zero Rules before saving
complaintSchema.pre('save', function (next) {
  if (!this.complaintId) {
    this.complaintId = 'CMP-' + Math.floor(100000 + Math.random() * 900000);
  }

  // Ensure valid coordinate defaults if empty so it always displays on the Live Threat Map
  if (!this.location || !this.location.coordinates || this.location.coordinates.length < 2 || (!this.location.coordinates[0] && !this.location.coordinates[1])) {
    // Default fallback near Central Bangalore/India IT corridor coordinates with slight random jitter for distinct pins
    const lat = 12.9716 + (Math.random() - 0.5) * 0.08;
    const lng = 77.5946 + (Math.random() - 0.5) * 0.08;
    this.location = {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }

  // Priority Zero Escalation for Women/Child Safety and Emergency Complaints
  const safetyCategories = ['Women/Child Safety', 'Domestic Violence', 'Child Exploitation', 'Emergency Safety', 'Harassment'];
  if (safetyCategories.includes(this.category) || this.isImmediateAction) {
    this.isImmediateAction = true;
    this.priority = 'top_priority';
    if (this.severity !== 'critical') {
      this.severity = 'high';
    }
  }

  next();
});

// Index for text search
complaintSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);