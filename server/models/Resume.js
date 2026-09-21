const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  resumeUrl: { type: String, required: true },
  fileName: { type: String, default: 'Resume.pdf' },
  resumeScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  missingSkills: { type: [String], default: [] },
  improvementSuggestions: { type: [String], default: [] },
  grammarSuggestions: { type: [String], default: [] },
  projectSuggestions: { type: [String], default: [] },
  rawAnalysis: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
