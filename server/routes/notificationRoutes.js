const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, clearAllNotifications } = require('../controllers/notificationController');
const { protect, studentOnly } = require('../middleware/auth');

router.get('/', protect, studentOnly, getNotifications);
router.put('/:id/read', protect, studentOnly, markAsRead);
router.delete('/', protect, studentOnly, clearAllNotifications);

module.exports = router;
