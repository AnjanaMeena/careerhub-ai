const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/student-login', loginStudent);
router.post('/admin-login', loginAdmin);
router.get('/me', protect, getCurrentUser);

module.exports = router;
