const express = require('express');
const router = express.Router();
const { toggleBookmark, getStudentBookmarks } = require('../controllers/bookmarkController');
const { protect, studentOnly } = require('../middleware/auth');

router.post('/toggle', protect, studentOnly, toggleBookmark);
router.get('/', protect, studentOnly, getStudentBookmarks);

module.exports = router;
