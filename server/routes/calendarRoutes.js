const express = require('express');
const router = express.Router();
const { getEvents, getUpcoming, createEvent, updateEvent, deleteEvent } = require('../controllers/calendarController');
const { protect, studentOnly } = require('../middleware/auth');

router.get('/', protect, studentOnly, getEvents);
router.get('/upcoming', protect, studentOnly, getUpcoming);
router.post('/', protect, studentOnly, createEvent);
router.put('/:id', protect, studentOnly, updateEvent);
router.delete('/:id', protect, studentOnly, deleteEvent);

module.exports = router;
