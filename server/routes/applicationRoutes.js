const express = require('express');
const router = express.Router();
const { trackApplication, updateApplicationStatus, getStudentApplications } = require('../controllers/applicationController');
const { protect, studentOnly } = require('../middleware/auth');

router.post('/', protect, studentOnly, trackApplication);
router.get('/', protect, studentOnly, getStudentApplications);
router.put('/:id', protect, studentOnly, updateApplicationStatus);

module.exports = router;
