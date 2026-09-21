const CalendarEvent = require('../models/CalendarEvent');

// @desc    Get all calendar events for student (optional month/year filter)
// @route   GET /api/calendar
const getEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { student: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const events = await CalendarEvent.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
};

// @desc    Get upcoming events (next 7 days)
// @route   GET /api/calendar/upcoming
const getUpcoming = async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const events = await CalendarEvent.find({
      student: req.user._id,
      date: { $gte: now, $lte: nextWeek }
    }).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming events', error: error.message });
  }
};

// @desc    Create calendar event
// @route   POST /api/calendar
const createEvent = async (req, res) => {
  try {
    const { title, type, date, time, companyName, roundType, notes } = req.body;

    if (!title || !type || !date) {
      return res.status(400).json({ message: 'Title, type, and date are required' });
    }

    const event = await CalendarEvent.create({
      student: req.user._id,
      title, type, date, time, companyName, roundType, notes
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating calendar event', error: error.message });
  }
};

// @desc    Update calendar event
// @route   PUT /api/calendar/:id
const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, student: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { title, type, date, time, companyName, roundType, notes } = req.body;
    if (title !== undefined) event.title = title;
    if (type !== undefined) event.type = type;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (companyName !== undefined) event.companyName = companyName;
    if (roundType !== undefined) event.roundType = roundType;
    if (notes !== undefined) event.notes = notes;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating calendar event', error: error.message });
  }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting calendar event', error: error.message });
  }
};

module.exports = { getEvents, getUpcoming, createEvent, updateEvent, deleteEvent };
