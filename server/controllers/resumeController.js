const Resume = require('../models/Resume');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { analyzeResume } = require('../services/geminiService');
const { extractAndSanitizePdfText } = require('../services/pdfService');

// @desc    Upload Resume PDF and perform AI Analysis
// @route   POST /api/resumes/upload
// @access  Private (Student)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a PDF or Word document file' });
    }

    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    let fileUrl = `/uploads/${req.file.filename}`;

    // Try Cloudinary upload if configured
    const cloudinaryUrl = await uploadToCloudinary(req.file.path);
    if (cloudinaryUrl) {
      fileUrl = cloudinaryUrl;
    }

    // Extract PDF text and sanitize PII before sending to AI
    const { sanitizedText } = await extractAndSanitizePdfText(req.file.path, student ? student.name : '');
    const textToAnalyze = sanitizedText || req.file.originalname;

    // Perform AI analysis using Gemini service
    const analysis = await analyzeResume(student.skills || [], textToAnalyze);

    // Save or update Resume record
    let resumeRecord = await Resume.findOne({ student: studentId });

    if (resumeRecord) {
      resumeRecord.resumeUrl = fileUrl;
      resumeRecord.fileName = req.file.originalname;
      resumeRecord.resumeScore = analysis.resumeScore;
      resumeRecord.atsScore = analysis.atsScore;
      resumeRecord.missingSkills = analysis.missingSkills;
      resumeRecord.improvementSuggestions = analysis.improvementSuggestions;
      resumeRecord.grammarSuggestions = analysis.grammarSuggestions;
      resumeRecord.projectSuggestions = analysis.projectSuggestions;
      resumeRecord.rawAnalysis = analysis;
      await resumeRecord.save();
    } else {
      resumeRecord = new Resume({
        student: studentId,
        resumeUrl: fileUrl,
        fileName: req.file.originalname,
        resumeScore: analysis.resumeScore,
        atsScore: analysis.atsScore,
        missingSkills: analysis.missingSkills,
        improvementSuggestions: analysis.improvementSuggestions,
        grammarSuggestions: analysis.grammarSuggestions,
        projectSuggestions: analysis.projectSuggestions,
        rawAnalysis: analysis
      });
      await resumeRecord.save();
    }

    // Update Student record
    student.resumeUrl = fileUrl;
    student.calculateCompletion();
    await student.save();

    // Create Notification
    await Notification.create({
      student: studentId,
      title: 'Resume Uploaded & Analyzed! 📄',
      message: `Your resume score is ${analysis.resumeScore}/100 and ATS score is ${analysis.atsScore}/100.`,
      type: 'RESUME'
    });

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resumeUrl: fileUrl,
      analysis: resumeRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing resume upload', error: error.message });
  }
};

// @desc    Get Latest Resume Analysis
// @route   GET /api/resumes/latest
// @access  Private (Student)
const getLatestResumeAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findOne({ student: req.user._id }).sort({ updatedAt: -1 });
    res.json(resume || null);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve resume analysis', error: error.message });
  }
};

module.exports = {
  uploadResume,
  getLatestResumeAnalysis
};
