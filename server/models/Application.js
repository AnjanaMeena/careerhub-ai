const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: { 
    type: String, 
    enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'], 
    default: 'Applied' 
  },
  appliedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Prevent duplicate application tracking for same student + opportunity
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
