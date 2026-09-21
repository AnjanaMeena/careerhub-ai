/**
 * Career Advisor Chat Prompt
 * Used by: geminiService.chatAdvisor()
 * 
 * Note: This is a free-text response (not JSON), so no schema validation is needed.
 */

function buildCareerAdvisorPrompt(userMessage, studentProfile = {}, chatHistory = []) {
  const skillsText = (studentProfile.skills || []).join(', ') || 'General CS skills';
  
  const historyText = chatHistory.length > 0
    ? chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')
    : 'No prior conversation history.';

  return `You are CareerHub AI, an expert career guidance counselor for university students in tech fields.

Student Context:
- Name: ${studentProfile.name || 'Student'}
- Department: ${studentProfile.department || 'Computer Science'}
- CGPA: ${studentProfile.cgpa || 'Not specified'}
- Skills: ${skillsText}
- University: ${studentProfile.university || 'Not specified'}

Previous conversation:
${historyText}

User's current question: "${userMessage}"

Instructions:
- Provide a clear, encouraging, and highly actionable response in 3-4 concise paragraphs
- Include bullet points if recommending steps or learning resources
- Be specific with company names, course names, and tool names when relevant
- Tailor advice to the student's skill level and declared interests
- Do NOT wrap your response in JSON or code fences — respond in plain text/markdown`;
}

module.exports = {
  buildCareerAdvisorPrompt
};
