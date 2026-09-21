const Rejection = require('../models/Rejection');

// @desc    Get all rejections for student
// @route   GET /api/rejections
const getRejections = async (req, res) => {
  try {
    const rejections = await Rejection.find({ student: req.user._id }).sort({ date: -1 });
    res.json(rejections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rejections', error: error.message });
  }
};

// @desc    Create rejection entry
// @route   POST /api/rejections
const createRejection = async (req, res) => {
  try {
    const { companyName, role, date, roundReached, notes, tags } = req.body;

    if (!companyName || !role || !roundReached) {
      return res.status(400).json({ message: 'Company name, role, and round reached are required' });
    }

    const rejection = await Rejection.create({
      student: req.user._id,
      companyName, role, date: date || new Date(), roundReached, notes,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])
    });

    res.status(201).json(rejection);
  } catch (error) {
    res.status(500).json({ message: 'Error creating rejection entry', error: error.message });
  }
};

// @desc    Update rejection entry
// @route   PUT /api/rejections/:id
const updateRejection = async (req, res) => {
  try {
    const rejection = await Rejection.findOne({ _id: req.params.id, student: req.user._id });
    if (!rejection) return res.status(404).json({ message: 'Rejection not found' });

    const { companyName, role, date, roundReached, notes, tags } = req.body;
    if (companyName !== undefined) rejection.companyName = companyName;
    if (role !== undefined) rejection.role = role;
    if (date !== undefined) rejection.date = date;
    if (roundReached !== undefined) rejection.roundReached = roundReached;
    if (notes !== undefined) rejection.notes = notes;
    if (tags !== undefined) {
      rejection.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await rejection.save();
    res.json(rejection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rejection', error: error.message });
  }
};

// @desc    Delete rejection entry
// @route   DELETE /api/rejections/:id
const deleteRejection = async (req, res) => {
  try {
    const rejection = await Rejection.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!rejection) return res.status(404).json({ message: 'Rejection not found' });
    res.json({ message: 'Rejection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting rejection', error: error.message });
  }
};

// @desc    Get rejection analytics
// @route   GET /api/rejections/analytics
const getAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;

    const rejections = await Rejection.find({ student: studentId });
    const totalRejections = rejections.length;

    // Round breakdown
    const roundCounts = {};
    rejections.forEach(r => {
      roundCounts[r.roundReached] = (roundCounts[r.roundReached] || 0) + 1;
    });
    const roundBreakdown = Object.entries(roundCounts)
      .map(([round, count]) => ({ round, count }))
      .sort((a, b) => b.count - a.count);

    // Tag breakdown
    const tagCounts = {};
    rejections.forEach(r => {
      (r.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const tagBreakdown = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const topTag = tagBreakdown.length > 0 ? tagBreakdown[0].tag : null;
    const topRound = roundBreakdown.length > 0 ? roundBreakdown[0].round : null;

    // Monthly trend
    const monthlyCounts = {};
    rejections.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    });
    const recentTrend = Object.entries(monthlyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));

    // All unique tags used (for the tag picker)
    const allTags = [...new Set(rejections.flatMap(r => r.tags || []))].sort();

    res.json({
      totalRejections,
      roundBreakdown,
      tagBreakdown,
      topTag,
      topRound,
      recentTrend,
      allTags
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing rejection analytics', error: error.message });
  }
};

module.exports = { getRejections, createRejection, updateRejection, deleteRejection, getAnalytics };
