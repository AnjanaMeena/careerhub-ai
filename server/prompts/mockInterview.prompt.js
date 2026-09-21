/**
 * Mock Interview Prompt
 * Used by: mockInterviewController — generating interview questions
 */

/**
 * Generate the initial prompt to start a mock interview session.
 * Returns a prompt that asks Gemini to produce the first question.
 */
function buildMockStartPrompt(role, company, resumeContext = '', rejectionTags = []) {
  const rejectionContext = rejectionTags.length > 0
    ? `The student has previously been rejected and identified these weak areas: ${rejectionTags.join(', ')}. 
       Pay special attention to probing these areas during the interview.`
    : '';

  return `You are a senior technical interviewer conducting a mock interview.

Interview context:
- Target role: ${role}
- Company: ${company || 'A top tech company'}
${resumeContext ? `- Student's resume context: ${resumeContext}` : ''}
${rejectionContext}

Generate the first interview question for this mock session. The question should be appropriate for the role and difficulty level expected at the company.

Respond ONLY with a valid JSON object. Do NOT wrap in markdown code fences.

Required JSON schema:
{
  "questionNumber": 1,
  "questionText": "Tell me about a challenging project you worked on and how you handled the technical decisions.",
  "questionType": "behavioral",
  "difficulty": "medium",
  "totalQuestions": 5
}

questionType must be one of: "behavioral", "technical", "situational", "dsa", "system-design", "project-depth"
difficulty must be one of: "easy", "medium", "hard"
totalQuestions should be 5 for a standard mock interview session.`;
}

/**
 * Generate the next question based on conversation history.
 */
function buildMockNextQuestionPrompt(role, company, questionNumber, conversationHistory, rejectionTags = []) {
  const historyText = conversationHistory.map(h => 
    `Q${h.questionNumber}: ${h.questionText}\nAnswer: ${h.answerText}\nRating: ${h.rating}/5`
  ).join('\n\n');

  const rejectionContext = rejectionTags.length > 0
    ? `Student's known weak areas from past rejections: ${rejectionTags.join(', ')}. Probe these areas if not already covered.`
    : '';

  return `You are a senior technical interviewer conducting a mock interview for a ${role} position at ${company || 'a top tech company'}.

Previous questions and answers in this session:
${historyText}

${rejectionContext}

Generate question number ${questionNumber} of 5. Vary the question types — mix behavioral, technical, DSA, project-depth, and situational questions. Adapt difficulty based on previous answer quality.

Respond ONLY with a valid JSON object. Do NOT wrap in markdown code fences.

Required JSON schema:
{
  "questionNumber": ${questionNumber},
  "questionText": "Your next interview question here",
  "questionType": "technical",
  "difficulty": "medium"
}

questionType must be one of: "behavioral", "technical", "situational", "dsa", "system-design", "project-depth"
difficulty must be one of: "easy", "medium", "hard"`;
}

const MOCK_QUESTION_REQUIRED_KEYS = ['questionNumber', 'questionText', 'questionType', 'difficulty'];

module.exports = {
  buildMockStartPrompt,
  buildMockNextQuestionPrompt,
  MOCK_QUESTION_REQUIRED_KEYS
};
