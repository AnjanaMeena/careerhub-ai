const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Placement', 'Internship', 'Hackathon', 'Workshop', 'Scholarship'], 
    required: true 
  },
  description: { type: String, required: true },
  eligibility: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  cgpaRequirement: { type: Number, default: 0 },
  location: { type: String, default: 'Remote / On-site' },
  stipendSalary: { type: String, required: true },
  deadline: { type: Date, required: true },
  applyLink: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
