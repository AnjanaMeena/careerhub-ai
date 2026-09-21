const axios = require('axios');
const { parseAIResponse, AiParseError } = require('../utils/aiResponseParser');

// Import prompt builders
const { buildResumeAnalysisPrompt, RESUME_ANALYSIS_REQUIRED_KEYS } = require('../prompts/resumeAnalysis.prompt');
const { buildSkillGapPrompt, SKILL_GAP_REQUIRED_KEYS } = require('../prompts/skillGap.prompt');
const { buildCareerAdvisorPrompt } = require('../prompts/careerAdvisor.prompt');

/**
 * Single Google Gemini AI Integration Service
 * Provides:
 * 1. Resume Analysis
 * 2. Skill Gap Analysis
 * 3. AI Career Advisor Chat
 * 4. Generic callGemini() for mock interview and other features
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Call Google Gemini API
const callGemini = async (prompt) => {
  console.log("====================================");
  console.log("callGemini() was called");

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_google_gemini_api_key_here") {
    console.error("❌ GEMINI_API_KEY is missing or placeholder");
    throw new Error('GEMINI_API_KEY is not configured. Set a valid key in the .env file.');
  }

  console.log(
    "API Key:",
    GEMINI_API_KEY.substring(0, 8) + "..." + GEMINI_API_KEY.slice(-6)
  );

  // FIX: Corrected model name from "gemini-flash-latest" to "gemini-2.0-flash"
  const MODEL = "gemini-2.0-flash";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  console.log("Request URL:", url);
  console.log("Prompt Preview:", prompt.substring(0, 200) + "...");

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("✅ Gemini responded successfully");

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error("❌ Gemini returned empty content. Full response:", JSON.stringify(response.data, null, 2).substring(0, 500));
      throw new Error('Gemini returned an empty response with no text content.');
    }

    console.log("Raw Response Preview:", text.substring(0, 300));
    return text;
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("No response received. Request was made but timed out or failed.");
    }

    console.error("Error message:", error.message);
    console.error("Full error:", error);
    console.error("==================================");

    // Re-throw with more context instead of silently returning null
    throw new Error(`Gemini API call failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

// 1. Resume Analysis
const analyzeResume = async (skills = [], resumeText = '') => {
  const prompt = buildResumeAnalysisPrompt(skills, resumeText);

  try {
    const rawResult = await callGemini(prompt);
    const parsed = parseAIResponse(rawResult, RESUME_ANALYSIS_REQUIRED_KEYS);

    // Validate parsed scores to ensure they are valid numbers
    if (typeof parsed.resumeScore === 'number' && typeof parsed.atsScore === 'number') {
      console.log(`[analyzeResume] Gemini AI analysis succeeded. Resume Score: ${parsed.resumeScore}, ATS Score: ${parsed.atsScore}`);
      return parsed;
    }
    return parsed;
  } catch (error) {
    console.warn('[analyzeResume] AI call failed/fallback triggered:', error.message);

    // Dynamic Heuristic Scorer for Fallback: evaluates text length, section headers, & skills
    const text = resumeText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let baseScore = 58;
    if (wordCount > 350) baseScore += 16;
    else if (wordCount > 180) baseScore += 10;
    else if (wordCount > 60) baseScore += 4;
    else baseScore -= 12;

    const lowerText = text.toLowerCase();
    let sectionsFound = 0;
    ['education', 'experience', 'projects', 'skills', 'certification', 'achievements'].forEach(sec => {
      if (lowerText.includes(sec)) sectionsFound++;
    });
    baseScore += sectionsFound * 3;

    baseScore += Math.min(skills.length * 2, 12);
    const noise = (text.length % 9) - 4; // text-based natural variation

    const calculatedResumeScore = Math.min(Math.max(baseScore + noise, 48), 93);
    const calculatedAtsScore = Math.min(Math.max(baseScore - 3 + (sectionsFound * 2) + noise, 45), 90);

    const availableSkills = skills.map(s => s.toLowerCase());
    const missing = [];
    if (!availableSkills.includes('docker')) missing.push('Docker');
    if (!availableSkills.includes('aws')) missing.push('AWS Cloud');
    if (!availableSkills.includes('typescript')) missing.push('TypeScript');
    if (!availableSkills.includes('jest')) missing.push('Jest / Unit Testing');

    const topSkill = skills.length > 0 ? skills[0] : 'software development';
    const missingFirst = missing[0] || 'Docker';

    return {
      resumeScore: calculatedResumeScore,
      atsScore: calculatedAtsScore,
      missingSkills: missing.length > 0 ? missing : ['CI/CD Pipelines', 'System Design', 'Kubernetes'],
      improvementSuggestions: [
        `Quantify achievements in your ${topSkill} projects (e.g. "Engineered ${topSkill} application improving response times by 30%")`,
        `Structure experience bullet points using the formula: Action Verb + Tech Stack (${skills.slice(0, 3).join(', ') || 'Node.js/React'}) + Measurable Outcome`,
        `Add dedicated technical metrics (API throughput, database optimization, or user load) to strengthen ATS keyword score`
      ],
      grammarSuggestions: [
        `Replace weak action verbs like "worked on" or "helped with" in your projects with power verbs such as "Architected", "Engineered", or "Spearheaded"`,
        `Maintain strict past-tense consistency across all completed project descriptions and standardize date ranges (e.g. "May 2025 – Aug 2025")`
      ],
      projectSuggestions: [
        `Build a Production-grade ${missingFirst} Microservice to directly showcase your ${missingFirst} proficiency to recruiters`,
        `Develop an End-to-End ${topSkill} Application with CI/CD deployment pipelines, automated testing, and comprehensive API documentation`
      ],
      _fallback: true,
      _error: error.message
    };
  }
};

// 2. Skill Gap Analysis
const analyzeSkillGap = async (targetRole, currentSkills = []) => {
  const prompt = buildSkillGapPrompt(targetRole, currentSkills);

  try {
    const rawResult = await callGemini(prompt);
    return parseAIResponse(rawResult, SKILL_GAP_REQUIRED_KEYS);
  } catch (error) {
    console.error('[analyzeSkillGap] AI analysis failed:', error.message);

    // Fallback skill mapping for standard target roles
    const roleMaps = {
      'Software Engineer': {
        req: ['Data Structures', 'Algorithms', 'Java/C++', 'SQL', 'Git', 'System Design'],
        courses: ['Mastering Data Structures & Algorithms', 'System Design Fundamentals'],
        plan: ['Week 1-2: Master DSA Patterns', 'Week 3-4: Object Oriented Design', 'Week 5-6: System Design & Mock Interviews']
      },
      'Full Stack Developer': {
        req: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Tailwind CSS', 'Docker'],
        courses: ['Full-Stack MERN Bootcamp', 'Modern Web Developer Roadmap'],
        plan: ['Week 1-2: React Hooks & State Management', 'Week 3-4: Node.js & MongoDB APIs', 'Week 5-6: Authentication & Cloud Deployment']
      },
      'Cyber Security Analyst': {
        req: ['Networking Basics', 'Linux Administration', 'Ethical Hacking', 'Wireshark', 'Python', 'SIEM Tools'],
        courses: ['CompTIA Security+ Certification Guide', 'Practical Ethical Hacking'],
        plan: ['Week 1-2: Network Security Fundamentals', 'Week 3-4: Vulnerability Assessment', 'Week 5-6: Incident Response & SIEM Analysis']
      },
      'Data Analyst': {
        req: ['Python', 'Pandas', 'SQL', 'Tableau / PowerBI', 'Statistics', 'Excel'],
        courses: ['Google Data Analytics Certificate', 'SQL for Data Science'],
        plan: ['Week 1-2: Advanced SQL & Database Querying', 'Week 3-4: Data Visualization with PowerBI', 'Week 5-6: Statistical Analysis with Python']
      }
    };

    const selectedMap = roleMaps[targetRole] || roleMaps['Full Stack Developer'];
    const normalizedCurrent = currentSkills.map(s => s.toLowerCase());
    const missing = selectedMap.req.filter(s => !normalizedCurrent.includes(s.toLowerCase()));

    return {
      targetRole,
      currentSkills: currentSkills.length > 0 ? currentSkills : ['JavaScript', 'HTML/CSS', 'Python'],
      missingSkills: missing.length > 0 ? missing : ['Docker', 'AWS', 'System Design'],
      suggestedTechnologies: selectedMap.req.slice(0, 4),
      recommendedCourses: selectedMap.courses.map((title, idx) => ({
        title,
        provider: idx % 2 === 0 ? 'Udemy / Coursera' : 'freeCodeCamp',
        level: 'Intermediate'
      })),
      learningPlan: selectedMap.plan.map((item, idx) => ({
        week: `Phase ${idx + 1}`,
        focus: item
      })),
      _fallback: true,
      _error: error.message
    };
  }
};

// 3. AI Career Advisor Chat
const chatAdvisor = async (userMessage, studentProfile = {}, chatHistory = []) => {
  const prompt = buildCareerAdvisorPrompt(userMessage, studentProfile, chatHistory);

  try {
    const rawResult = await callGemini(prompt);
    if (rawResult) return rawResult;
  } catch (error) {
    console.error('[chatAdvisor] AI chat failed:', error.message);
  }

  // Smart conversational fallback engine
  const query = userMessage.toLowerCase();

  if (query.includes('amazon') || query.includes('faang') || query.includes('google')) {
    return `To prepare for top tech companies like Amazon and Google, focus on these 3 pillars:
    
1. **Data Structures & Algorithms**: Master Arrays, Strings, Trees, Graphs, Dynamic Programming, and System Design concepts. Practice daily on platforms like LeetCode and HackerRank.
2. **Project Excellence**: Build 2-3 full-stack end-to-end projects demonstrating production practices (JWT authentication, scalable database design, clean architecture).
3. **Leadership & Behavioral**: Align your project experiences with Amazon's Leadership Principles (Customer Obsession, Ownership, Bias for Action). Use the STAR method (Situation, Task, Action, Result) for behavioral interview questions!`;
  }

  if (query.includes('resume') || query.includes('improve')) {
    return `Here are 4 high-impact ways to make your resume stand out to campus recruiters:

• **Quantify Achievements**: Use metrics like *"Optimized MongoDB database queries reducing API latency by 35%"* rather than generic descriptions.
• **Highlight Core Skills**: Group your skills into clear categories: *Languages, Frameworks/Libraries, Databases, Developer Tools*.
• **Project Links**: Include direct GitHub links and live demo links for all featured applications.
• **Keep it to 1 Page**: Use a clean, single-column ATS-friendly template with clear section headers.`;
  }

  if (query.includes('project') || query.includes('build')) {
    return `Based on your profile, here are 3 standout portfolio projects to build:

1. **AI-Powered Opportunity & Career Management System** (Full-Stack MERN + Gemini API).
2. **Real-time Collaborative Code Editor / Chat App** using React, Node.js, and WebSockets.
3. **Cloud-Native Microservice API Service** containerized with Docker and deployed on AWS / Vercel.

Focus on implementing clean authentication, error handling, clean design system, and responsive UI!`;
  }

  const skillsText = (studentProfile.skills || []).join(', ') || 'General CS skills';
  return `Hello ${studentProfile.name || 'there'}! Based on your current profile (${skillsText}), my recommendation is to maintain a balanced approach between mastering core domain skills and building 2 strong portfolio projects.

Focus on:
• Strengthening problem-solving capabilities (DSA & System Fundamentals)
• Completing your GitHub repository documentation with clean READMEs
• Applying early to campus placement drives and remote internships

Feel free to ask me about specific companies, resume tips, or skill roadmaps!`;
};

module.exports = {
  callGemini,
  analyzeResume,
  analyzeSkillGap,
  chatAdvisor
};
