const express = require('express');
const router = express.Router();
const { uploadResume, getLatestResumeAnalysis } = require('../controllers/resumeController');
const { protect, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, studentOnly, upload.single('resume'), uploadResume);
router.get('/latest', protect, studentOnly, getLatestResumeAnalysis);

module.exports = router;
