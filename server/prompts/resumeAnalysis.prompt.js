/**
 * Resume Analysis Prompt
 * Used by: geminiService.analyzeResume()
 */

function buildResumeAnalysisPrompt(skills = [], resumeText = '') {
  const skillsList = skills.length > 0 ? skills.join(', ') : 'None specified';

  return `You are an expert technical recruiter, ATS specialist, and executive resume writer.

Analyze the following student resume text in detail and return candidate-specific feedback for each of the 3 frontend flashcard categories:
1. Impact Suggestions (Actionable bullet point improvements with quantitative metrics)
2. Grammar & Verbs (Weak verb replacements, tense consistency, formatting fixes)
3. Project Descriptions (Customized project rewrites & new project ideas matching missing skills)

Student's declared skills: ${skillsList}

Resume Content:
"""
${resumeText || 'No detailed resume text provided.'}
"""

Instructions for Flashcards Output:
- "resumeScore": Calculate an integer between 30 and 95 based on actual content depth.
- "atsScore": Calculate an integer between 30 and 95 based on ATS readability & keyword density.
- "missingSkills": List 3-5 high-demand tech skills missing from their resume for their target domain.
- "improvementSuggestions": Provide 3 candidate-specific bullet points for the "Impact Suggestions" flashcard. Focus on quantifying project impact (e.g. percentages, latency, users, throughput) and structuring bullet points as: [Action Verb] + [Tech Stack] + [Measurable Result].
- "grammarSuggestions": Provide 2-3 candidate-specific bullet points for the "Grammar & Verbs" flashcard. Identify weak/passive verbs (like "worked on", "helped", "made") used in the resume text and replace them with strong power verbs (like "Engineered", "Architected", "Spearheaded").
- "projectSuggestions": Provide 2-3 candidate-specific bullet points for the "Project Descriptions" flashcard. Give enhanced project description rewrites or unique project ideas tailored to showcase their missing skills.

CRITICAL: Do NOT return static or generic boilerplate strings. Every suggestion MUST reference details or missing areas relevant to this specific student's text and skills.

Respond ONLY with a valid, clean JSON object. Do NOT wrap in markdown code blocks.

JSON Output Schema:
{
  "resumeScore": 84,
  "atsScore": 79,
  "missingSkills": ["Docker", "TypeScript", "Jest"],
  "improvementSuggestions": [
    "Quantify project achievements with specific metrics (e.g., 'Engineered REST APIs reducing server response latency by 35%')",
    "Structure project bullet points using the formula: Action Verb + Tech Stack + Measurable Outcome",
    "Highlight technical leadership and performance optimization efforts explicitly in your projects section"
  ],
  "grammarSuggestions": [
    "Replace passive phrases like 'worked on' with high-impact power verbs like 'Architected' or 'Spearheaded'",
    "Ensure consistent past tense usage across all completed projects and standardize date formats"
  ],
  "projectSuggestions": [
    "Build a Microservices Task Management System containerized with Docker to demonstrate DevOps skills",
    "Develop a Real-Time Collaborative Workspace using React, Node.js, and Socket.io to showcase full-stack proficiency"
  ]
}`;
}

const RESUME_ANALYSIS_REQUIRED_KEYS = [
  'resumeScore',
  'atsScore',
  'missingSkills',
  'improvementSuggestions',
  'grammarSuggestions',
  'projectSuggestions'
];

module.exports = {
  buildResumeAnalysisPrompt,
  RESUME_ANALYSIS_REQUIRED_KEYS
};
