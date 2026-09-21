const MockInterview = require('../models/MockInterview');
const Rejection = require('../models/Rejection');
const Student = require('../models/Student');
const { callGemini } = require('../services/geminiService');
const { parseAIResponse } = require('../utils/aiResponseParser');
const { buildMockStartPrompt, buildMockNextQuestionPrompt, MOCK_QUESTION_REQUIRED_KEYS } = require('../prompts/mockInterview.prompt');
const { buildPerAnswerFeedbackPrompt, buildSessionSummaryPrompt, PER_ANSWER_REQUIRED_KEYS, SESSION_SUMMARY_REQUIRED_KEYS } = require('../prompts/mockFeedback.prompt');

// @desc    Start a new mock interview session
// @route   POST /api/mock-interview/start
const startSession = async (req, res) => {
  try {
    const { role, company } = req.body;
    if (!role) return res.status(400).json({ message: 'Target role is required' });

    const student = await Student.findById(req.user._id);
    const resumeContext = student ? `Skills: ${(student.skills || []).join(', ')}. Department: ${student.department || 'CS'}. CGPA: ${student.cgpa || 'N/A'}.` : '';

    // Get rejection tags for context
    const rejections = await Rejection.find({ student: req.user._id });
    const tagCounts = {};
    rejections.forEach(r => (r.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

    const prompt = buildMockStartPrompt(role, company, resumeContext, topTags);

    let question;
    try {
      const raw = await callGemini(prompt);
      question = parseAIResponse(raw, MOCK_QUESTION_REQUIRED_KEYS);
    } catch (aiErr) {
      console.error('[mockInterview:start] AI error:', aiErr.message);
      question = {
        questionNumber: 1,
        questionText: `Tell me about yourself and why you're interested in the ${role} role${company ? ` at ${company}` : ''}.`,
        questionType: 'behavioral',
        difficulty: 'easy',
        totalQuestions: 5
      };
    }

    const session = await MockInterview.create({
      student: req.user._id,
      role,
      company: company || '',
      totalQuestions: question.totalQuestions || 5,
      questions: [{
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        questionType: question.questionType,
        difficulty: question.difficulty
      }],
      status: 'in-progress'
    });

    res.status(201).json({
      sessionId: session._id,
      question,
      totalQuestions: session.totalQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting mock interview', error: error.message });
  }
};

// @desc    Submit answer and get per-answer rating + next question
// @route   POST /api/mock-interview/:id/answer
const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ message: 'Answer text is required' });

    const session = await MockInterview.findOne({ _id: req.params.id, student: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status === 'completed') return res.status(400).json({ message: 'Session already completed' });

    const currentQ = session.questions[session.questions.length - 1];
    if (!currentQ) return res.status(400).json({ message: 'No pending question' });

    // Get per-answer feedback
    let feedback;
    try {
      const feedbackPrompt = buildPerAnswerFeedbackPrompt(currentQ.questionText, answer, session.role);
      const rawFeedback = await callGemini(feedbackPrompt);
      feedback = parseAIResponse(rawFeedback, PER_ANSWER_REQUIRED_KEYS);
    } catch (aiErr) {
      console.error('[mockInterview:feedback] AI error:', aiErr.message);
      feedback = { rating: 3, feedback: 'Thank you for your answer. Consider adding more specific examples and metrics.', strengths: [], improvementAreas: [] };
    }

    // Update current question with answer and rating
    currentQ.answerText = answer;
    currentQ.rating = feedback.rating;
    currentQ.feedback = feedback.feedback;
    currentQ.strengths = feedback.strengths || [];
    currentQ.improvementAreas = feedback.improvementAreas || [];

    const answeredCount = session.questions.filter(q => q.answerText).length;
    const isLastQuestion = answeredCount >= session.totalQuestions;

    let nextQuestion = null;

    if (!isLastQuestion) {
      // Generate next question
      const rejections = await Rejection.find({ student: req.user._id });
      const topTags = [...new Set(rejections.flatMap(r => r.tags || []))].slice(0, 5);

      try {
        const nextPrompt = buildMockNextQuestionPrompt(
          session.role, session.company, answeredCount + 1,
          session.questions.filter(q => q.answerText).map(q => ({
            questionNumber: q.questionNumber, questionText: q.questionText,
            answerText: q.answerText, rating: q.rating
          })),
          topTags
        );
        const rawNext = await callGemini(nextPrompt);
        nextQuestion = parseAIResponse(rawNext, MOCK_QUESTION_REQUIRED_KEYS);
      } catch (aiErr) {
        console.error('[mockInterview:nextQ] AI error:', aiErr.message);
        const fallbackTypes = ['technical', 'dsa', 'project-depth', 'situational', 'behavioral'];
        nextQuestion = {
          questionNumber: answeredCount + 1,
          questionText: `Can you walk me through a challenging ${fallbackTypes[answeredCount % 5]} problem you've solved recently?`,
          questionType: fallbackTypes[answeredCount % 5],
          difficulty: 'medium'
        };
      }

      session.questions.push({
        questionNumber: nextQuestion.questionNumber,
        questionText: nextQuestion.questionText,
        questionType: nextQuestion.questionType,
        difficulty: nextQuestion.difficulty
      });
    }

    await session.save();

    res.json({
      feedback,
      nextQuestion: isLastQuestion ? null : nextQuestion,
      isComplete: isLastQuestion,
      answeredCount,
      totalQuestions: session.totalQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing answer', error: error.message });
  }
};

// @desc    End session and generate summary
// @route   POST /api/mock-interview/:id/end
const endSession = async (req, res) => {
  try {
    const session = await MockInterview.findOne({ _id: req.params.id, student: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Get rejection tags for context-aware summary
    const rejections = await Rejection.find({ student: req.user._id });
    const topTags = [...new Set(rejections.flatMap(r => r.tags || []))].slice(0, 5);

    let summary;
    try {
      const summaryPrompt = buildSessionSummaryPrompt({
        role: session.role,
        company: session.company,
        questions: session.questions.filter(q => q.answerText).map(q => ({
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          questionType: q.questionType,
          difficulty: q.difficulty,
          answerText: q.answerText,
          rating: q.rating,
          feedback: q.feedback
        }))
      }, topTags);
      const rawSummary = await callGemini(summaryPrompt);
      summary = parseAIResponse(rawSummary, SESSION_SUMMARY_REQUIRED_KEYS);
    } catch (aiErr) {
      console.error('[mockInterview:summary] AI error:', aiErr.message);
      const avgRating = session.questions.filter(q => q.rating).reduce((s, q) => s + q.rating, 0) / (session.questions.filter(q => q.rating).length || 1);
      summary = {
        overallScore: Math.round(avgRating * 20),
        strengths: ['Completed the full mock interview session'],
        weaknesses: ['Consider providing more detailed answers with specific examples'],
        suggestions: ['Practice the STAR method for behavioral questions', 'Review DSA fundamentals'],
        focusAreas: topTags.length > 0 ? topTags.slice(0, 3) : ['General Preparation'],
        readinessLevel: avgRating >= 4 ? 'Almost Ready' : avgRating >= 3 ? 'Needs Preparation' : 'Significant Gaps'
      };
    }

    session.overallSummary = summary;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.json({ summary, session });
  } catch (error) {
    res.status(500).json({ message: 'Error generating session summary', error: error.message });
  }
};

// @desc    Get all past sessions
// @route   GET /api/mock-interview
const getSessions = async (req, res) => {
  try {
    const sessions = await MockInterview.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .select('role company status totalQuestions overallSummary.overallScore createdAt completedAt');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

// @desc    Get single session details
// @route   GET /api/mock-interview/:id
const getSession = async (req, res) => {
  try {
    const session = await MockInterview.findOne({ _id: req.params.id, student: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

module.exports = { startSession, submitAnswer, endSession, getSessions, getSession };
