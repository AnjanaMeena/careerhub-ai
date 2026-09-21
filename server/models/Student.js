const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  university: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  cgpa: { type: Number, default: 0 },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  profileCompletion: { type: Number, default: 20 },
  role: { type: String, default: 'Student' }
}, { timestamps: true });

// Helper to calculate profile completion percentage
studentSchema.methods.calculateCompletion = function() {
  let score = 20; // Default after basic registration
  if (this.phone && this.university && this.department) score += 25;
  if (this.cgpa > 0 && this.skills && this.skills.length > 0) score += 30;
  if (this.linkedin || this.github || this.portfolio || this.resumeUrl) score += 25;
  this.profileCompletion = Math.min(score, 100);
  return this.profileCompletion;
};

module.exports = mongoose.model('Student', studentSchema);
