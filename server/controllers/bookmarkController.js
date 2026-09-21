const Bookmark = require('../models/Bookmark');
const Opportunity = require('../models/Opportunity');

// @desc    Toggle Bookmark (Save / Remove)
// @route   POST /api/bookmarks/toggle
// @access  Private (Student)
const toggleBookmark = async (req, res) => {
  try {
    const { opportunityId } = req.body;
    const studentId = req.user._id;

    if (!opportunityId) {
      return res.status(400).json({ message: 'Opportunity ID is required' });
    }

    const existingBookmark = await Bookmark.findOne({ student: studentId, opportunity: opportunityId });

    if (existingBookmark) {
      await existingBookmark.deleteOne();
      return res.json({ message: 'Opportunity removed from bookmarks', isBookmarked: false });
    } else {
      const bookmark = new Bookmark({ student: studentId, opportunity: opportunityId });
      await bookmark.save();
      return res.status(201).json({ message: 'Opportunity saved to bookmarks', isBookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling bookmark', error: error.message });
  }
};

// @desc    Get Student Bookmarks
// @route   GET /api/bookmarks
// @access  Private (Student)
const getStudentBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ student: req.user._id })
      .populate('opportunity')
      .sort({ createdAt: -1 });

    const opportunities = bookmarks
      .filter(b => b.opportunity !== null)
      .map(b => ({
        ...b.opportunity.toObject(),
        isBookmarked: true
      }));

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookmarks', error: error.message });
  }
};

module.exports = {
  toggleBookmark,
  getStudentBookmarks
};
