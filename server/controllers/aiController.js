const { analyzeResume, analyzeSkillGap, chatAdvisor } = require('../services/geminiService');
const Student = require('../models/Student');
const { sanitizePII } = require('../utils/piiSanitizer');

// @desc    Analyze Resume via Gemini AI
// @route   POST /api/ai/resume-analysis
// @access  Private (Student)
const handleResumeAnalysis = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    const { resumeText } = req.body;

    // Sanitize any PII in raw text before sending to AI
    const sanitizedText = sanitizePII(resumeText || '', student ? student.name : '');

    const analysis = await analyzeResume(student ? student.skills : [], sanitizedText);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error performing AI resume analysis', error: error.message });
  }
};

// @desc    Analyze Skill Gap for Target Role via Gemini AI
// @route   POST /api/ai/skill-gap
// @access  Private (Student)
const handleSkillGapAnalysis = async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    const student = await Student.findById(req.user._id);
    const result = await analyzeSkillGap(targetRole, student ? student.skills : []);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating skill gap analysis', error: error.message });
  }
};

// @desc    AI Career Advisor Chat
// @route   POST /api/ai/career-advisor
// @access  Private (Student)
const handleCareerAdvisor = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'User question message is required' });
    }

    const student = await Student.findById(req.user._id);
    const advice = await chatAdvisor(message, student || {}, chatHistory || []);

    res.json({
      reply: advice,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error from AI Career Advisor', error: error.message });
  }
};

module.exports = {
  handleResumeAnalysis,
  handleSkillGapAnalysis,
  handleCareerAdvisor
};
