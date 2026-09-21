const Notification = require('../models/Notification');

// @desc    Get Student Notifications
// @route   GET /api/notifications
// @access  Private (Student)
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      student: req.user._id,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private (Student)
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// @desc    Clear All Notifications
// @route   DELETE /api/notifications
// @access  Private (Student)
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ student: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  clearAllNotifications
};
