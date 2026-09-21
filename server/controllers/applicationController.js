const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

// @desc    Apply / Track an opportunity
// @route   POST /api/applications
// @access  Private (Student)
const trackApplication = async (req, res) => {
  try {
    const { opportunityId, status = 'Applied', notes = '' } = req.body;
    const studentId = req.user._id;

    if (!opportunityId) {
      return res.status(400).json({ message: 'Opportunity ID is required' });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    let application = await Application.findOne({ student: studentId, opportunity: opportunityId });

    if (application) {
      application.status = status;
      if (notes) application.notes = notes;
      await application.save();
    } else {
      application = new Application({
        student: studentId,
        opportunity: opportunityId,
        status,
        notes
      });
      await application.save();
    }

    // Send confirmation notification
    await Notification.create({
      student: studentId,
      title: `Application Tracked: ${opportunity.companyName}`,
      message: `Status set to "${status}" for ${opportunity.role} at ${opportunity.companyName}.`,
      type: 'SYSTEM'
    });

    res.status(201).json({
      message: `Application tracked with status "${status}"`,
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track application', error: error.message });
  }
};

// @desc    Update Application Status
// @route   PUT /api/applications/:id
// @access  Private (Student)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user._id
    }).populate('opportunity');

    if (!application) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    res.json({
      message: `Status updated to ${status}`,
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};

// @desc    Get All Student Applications
// @route   GET /api/applications
// @access  Private (Student)
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('opportunity')
      .sort({ updatedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

module.exports = {
  trackApplication,
  updateApplicationStatus,
  getStudentApplications
};
