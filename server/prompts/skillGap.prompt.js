/**
 * Skill Gap Analysis Prompt
 * Used by: geminiService.analyzeSkillGap()
 */

function buildSkillGapPrompt(targetRole, currentSkills = []) {
  const skillsList = currentSkills.length > 0 ? currentSkills.join(', ') : 'None specified';

  return `You are an expert career development advisor for tech professionals.

Perform a comprehensive skill gap analysis for a student targeting the role: "${targetRole}".

Student's current skills: ${skillsList}

Your task:
1. Acknowledge their current skills
2. Identify missing skills required for the target role
3. Suggest technologies they should learn
4. Recommend specific courses with providers and difficulty levels
5. Create a phased learning plan (week-by-week)

Respond ONLY with a valid JSON object. Do NOT wrap in markdown code fences. Do NOT include any text before or after the JSON.

Required JSON schema:
{
  "targetRole": "${targetRole}",
  "currentSkills": ["React", "JavaScript", "HTML/CSS"],
  "missingSkills": ["Node.js", "MongoDB", "Express", "Docker"],
  "suggestedTechnologies": ["Next.js", "Tailwind CSS", "Redux Toolkit"],
  "recommendedCourses": [
    { "title": "Full Stack MERN Mastery", "provider": "Coursera / Udemy", "level": "Intermediate" },
    { "title": "Docker & Kubernetes Guide", "provider": "YouTube / freeCodeCamp", "level": "Beginner" }
  ],
  "learningPlan": [
    { "week": "Week 1-2", "focus": "Master Backend Development with Express & MongoDB" },
    { "week": "Week 3-4", "focus": "Containerize applications with Docker" },
    { "week": "Week 5-6", "focus": "Deploy apps to AWS & practice System Design questions" }
  ]
}`;
}

const SKILL_GAP_REQUIRED_KEYS = [
  'currentSkills',
  'missingSkills',
  'suggestedTechnologies',
  'recommendedCourses',
  'learningPlan'
];

module.exports = {
  buildSkillGapPrompt,
  SKILL_GAP_REQUIRED_KEYS
};
