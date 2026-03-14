const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  college: {
    type: String,
    trim: true,
    default: ''
  },
  degreeYear: {
    type: String,
    trim: true,
    default: ''
  },
  preferredService: {
    type: String,
    required: true,
    enum: ['Apply for Job', 'Study Abroad', 'Career Counselling']
  },
  preferredTimeline: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  utmSource: {
    type: String,
    default: ''
  },
  utmMedium: {
    type: String,
    default: ''
  },
  utmCampaign: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'],
    default: 'New'
  }
});

// Index for faster queries
leadSchema.index({ submittedAt: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', leadSchema);
