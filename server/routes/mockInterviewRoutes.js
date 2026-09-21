const express = require('express');
const router = express.Router();
const { startSession, submitAnswer, endSession, getSessions, getSession } = require('../controllers/mockInterviewController');
const { protect, studentOnly } = require('../middleware/auth');

router.post('/start', protect, studentOnly, startSession);
router.post('/:id/answer', protect, studentOnly, submitAnswer);
router.post('/:id/end', protect, studentOnly, endSession);
router.get('/', protect, studentOnly, getSessions);
router.get('/:id', protect, studentOnly, getSession);

module.exports = router;
