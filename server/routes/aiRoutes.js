const express = require('express');
const router = express.Router();
const { handleResumeAnalysis, handleSkillGapAnalysis, handleCareerAdvisor } = require('../controllers/aiController');
const { protect, studentOnly } = require('../middleware/auth');

router.post('/resume-analysis', protect, studentOnly, handleResumeAnalysis);
router.post('/skill-gap', protect, studentOnly, handleSkillGapAnalysis);
router.post('/career-advisor', protect, studentOnly, handleCareerAdvisor);

module.exports = router;
