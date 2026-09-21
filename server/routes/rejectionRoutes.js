const express = require('express');
const router = express.Router();
const { getRejections, createRejection, updateRejection, deleteRejection, getAnalytics } = require('../controllers/rejectionController');
const { protect, studentOnly } = require('../middleware/auth');

router.get('/analytics', protect, studentOnly, getAnalytics);
router.get('/', protect, studentOnly, getRejections);
router.post('/', protect, studentOnly, createRejection);
router.put('/:id', protect, studentOnly, updateRejection);
router.delete('/:id', protect, studentOnly, deleteRejection);

module.exports = router;
