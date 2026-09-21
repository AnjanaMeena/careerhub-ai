/**
 * Mock Interview Feedback Prompts
 * Used by: mockInterviewController — per-answer rating and end-of-session summary
 */

/**
 * Generate a per-answer rating and feedback for a single interview answer.
 */
function buildPerAnswerFeedbackPrompt(question, answer, role) {
  return `You are a senior interviewer evaluating a candidate's answer in a mock interview for a ${role} position.

Question: "${question}"
Candidate's Answer: "${answer}"

Rate this answer and provide brief, constructive feedback.

Respond ONLY with a valid JSON object. Do NOT wrap in markdown code fences. Do NOT include any text outside the JSON.

Required JSON schema:
{
  "rating": 4,
  "feedback": "Good explanation of your approach. You demonstrated clear understanding of the trade-offs. Consider adding more specific metrics about the impact of your solution.",
  "strengths": ["Clear communication", "Good problem decomposition"],
  "improvementAreas": ["Add quantitative impact", "Mention alternative approaches considered"]
}

rating must be an integer from 1 to 5 where:
1 = Poor (missing key points, off-topic, or unclear)
2 = Below Average (partially addresses the question but lacks depth)
3 = Average (addresses the question adequately but nothing exceptional)
4 = Good (strong answer with clear reasoning and relevant examples)
5 = Excellent (comprehensive, well-structured, demonstrates deep expertise)`;
}

/**
 * Generate an end-of-session summary for the entire mock interview.
 */
function buildSessionSummaryPrompt(sessionData, rejectionTags = []) {
  const qaText = sessionData.questions.map(q =>
    `Q${q.questionNumber} (${q.questionType}, ${q.difficulty}): ${q.questionText}
Answer: ${q.answerText}
Rating: ${q.rating}/5
Feedback: ${q.feedback}`
  ).join('\n\n');

  const rejectionContext = rejectionTags.length > 0
    ? `\nIMPORTANT: The student has a pattern of being rejected for these specific reasons: ${rejectionTags.join(', ')}.
In your feedback, specifically address whether these weak areas showed improvement or still need work based on the answers given in this session.`
    : '';

  return `You are a senior career coach reviewing a completed mock interview session.

Role: ${sessionData.role}
Company: ${sessionData.company || 'General'}

Full session transcript with per-question ratings:
${qaText}
${rejectionContext}

Generate a comprehensive end-of-session feedback summary.

Respond ONLY with a valid JSON object. Do NOT wrap in markdown code fences. Do NOT include any text outside the JSON.

Required JSON schema:
{
  "overallScore": 72,
  "strengths": [
    "Strong communication skills demonstrated across behavioral questions",
    "Good understanding of system design fundamentals"
  ],
  "weaknesses": [
    "DSA problem-solving approach needs more structure",
    "Project explanations lack quantitative impact metrics"
  ],
  "suggestions": [
    "Practice the STAR method for behavioral questions to add more structure",
    "Prepare 2-3 projects with specific metrics (e.g., 'reduced load time by 40%')",
    "Review common DSA patterns: sliding window, two pointers, BFS/DFS"
  ],
  "focusAreas": ["DSA", "Project Depth"],
  "readinessLevel": "Needs Preparation"
}

overallScore should be 0-100 based on the average quality across all answers.
readinessLevel must be one of: "Interview Ready", "Almost Ready", "Needs Preparation", "Significant Gaps"`;
}

const PER_ANSWER_REQUIRED_KEYS = ['rating', 'feedback'];
const SESSION_SUMMARY_REQUIRED_KEYS = ['overallScore', 'strengths', 'weaknesses', 'suggestions'];

module.exports = {
  buildPerAnswerFeedbackPrompt,
  buildSessionSummaryPrompt,
  PER_ANSWER_REQUIRED_KEYS,
  SESSION_SUMMARY_REQUIRED_KEYS
};
