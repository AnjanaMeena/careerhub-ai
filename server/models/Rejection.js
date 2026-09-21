const mongoose = require('mongoose');

const rejectionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  companyName: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  roundReached: { 
    type: String, 
    enum: ['Online Test', 'Technical', 'HR', 'GD', 'Other'],
    required: true 
  },
  notes: { type: String, default: '' },
  tags: { type: [String], default: [] }
}, { timestamps: true });

rejectionSchema.index({ student: 1, date: -1 });

module.exports = mongoose.model('Rejection', rejectionSchema);
