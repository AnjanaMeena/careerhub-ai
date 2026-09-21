const express = require('express');
const router = express.Router();
const { updateProfile, getStudentDashboard, getAllStudents, deleteStudent } = require('../controllers/studentController');
const { protect, studentOnly, adminOnly } = require('../middleware/auth');

router.put('/profile', protect, studentOnly, updateProfile);
router.get('/dashboard', protect, studentOnly, getStudentDashboard);

// Admin Student Management
router.get('/', protect, adminOnly, getAllStudents);
router.delete('/:id', protect, adminOnly, deleteStudent);

module.exports = router;
