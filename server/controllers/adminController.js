const Student = require('../models/Student');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

// @desc    Get Admin Dashboard & Analytics Data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Opportunities by Category Chart Data
    const categories = ['Placement', 'Internship', 'Hackathon', 'Workshop', 'Scholarship'];
    const categoryColors = {
      Placement: '#3b82f6',
      Internship: '#10b981',
      Hackathon: '#8b5cf6',
      Workshop: '#f59e0b',
      Scholarship: '#ec4899'
    };

    const categoryData = await Promise.all(
      categories.map(async (cat) => {
        const count = await Opportunity.countDocuments({ category: cat });
        return { category: cat, count, color: categoryColors[cat] };
      })
    );

    // Recent Activity Feed
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(3);
    const recentOpportunities = await Opportunity.find().sort({ createdAt: -1 }).limit(3);
    const recentApplications = await Application.find()
      .populate('student', 'name email')
      .populate('opportunity', 'companyName role')
      .sort({ createdAt: -1 })
      .limit(3);

    const activities = [];

    recentStudents.forEach(st => {
      activities.push({
        id: `st-${st._id}`,
        type: 'STUDENT_REGISTERED',
        text: `New student ${st.name} registered (${st.department || 'Student'})`,
        timestamp: st.createdAt
      });
    });

    recentOpportunities.forEach(op => {
      activities.push({
        id: `op-${op._id}`,
        type: 'OPPORTUNITY_ADDED',
        text: `New ${op.category} added: ${op.role} at ${op.companyName}`,
        timestamp: op.createdAt
      });
    });

    recentApplications.forEach(app => {
      if (app.student && app.opportunity) {
        activities.push({
          id: `app-${app._id}`,
          type: 'APPLICATION_SUBMITTED',
          text: `${app.student.name} applied for ${app.opportunity.role} at ${app.opportunity.companyName}`,
          timestamp: app.createdAt
        });
      }
    });

    // Sort combined activity timeline descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      totalStudents,
      totalOpportunities,
      totalApplications,
      opportunitiesByCategoryChart: categoryData,
      recentActivity: activities.slice(0, 8)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading admin analytics', error: error.message });
  }
};

module.exports = {
  getAdminDashboard
};
