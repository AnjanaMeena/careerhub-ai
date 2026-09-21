const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  questionType: { type: String, default: 'general' },
  difficulty: { type: String, default: 'medium' },
  answerText: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, default: null },
  feedback: { type: String, default: '' },
  strengths: { type: [String], default: [] },
  improvementAreas: { type: [String], default: [] }
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  role: { type: String, required: true },
  company: { type: String, default: '' },
  questions: { type: [questionSchema], default: [] },
  overallSummary: {
    overallScore: { type: Number, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    focusAreas: { type: [String], default: [] },
    readinessLevel: { type: String, default: '' }
  },
  status: { 
    type: String, 
    enum: ['in-progress', 'completed'],
    default: 'in-progress' 
  },
  totalQuestions: { type: Number, default: 5 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

mockInterviewSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
