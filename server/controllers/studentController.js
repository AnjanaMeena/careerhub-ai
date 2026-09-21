const Student = require('../models/Student');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');

// @desc    Update Student Profile
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const {
      name, phone, university, department, year, cgpa,
      skills, interests, linkedin, github, portfolio, resumeUrl
    } = req.body;

    if (name) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (university !== undefined) student.university = university;
    if (department !== undefined) student.department = department;
    if (year !== undefined) student.year = year;
    if (cgpa !== undefined) student.cgpa = parseFloat(cgpa) || 0;

    if (skills !== undefined) {
      student.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (interests !== undefined) {
      student.interests = Array.isArray(interests)
        ? interests
        : interests.split(',').map(i => i.trim()).filter(Boolean);
    }

    if (linkedin !== undefined) student.linkedin = linkedin;
    if (github !== undefined) student.github = github;
    if (portfolio !== undefined) student.portfolio = portfolio;
    if (resumeUrl !== undefined) student.resumeUrl = resumeUrl;

    student.calculateCompletion();
    await student.save();

    // Create Notification
    await Notification.create({
      student: student._id,
      title: 'Profile Updated Successfully! ✏️',
      message: `Your profile completion is now ${student.profileCompletion}%.`,
      type: 'PROFILE'
    });

    res.json({
      message: 'Profile updated successfully',
      user: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student profile', error: error.message });
  }
};

// @desc    Get Student Dashboard Overview
// @route   GET /api/students/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    // 1. Saved Opportunities Count
    const savedCount = await Bookmark.countDocuments({ student: studentId });

    // 2. Applications Count & Applications breakdown by status
    const applications = await Application.find({ student: studentId }).populate('opportunity');
    const appliedCount = applications.length;

    const statusCounts = {
      Saved: savedCount,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    };

    applications.forEach(app => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    const applicationStatusChart = [
      { status: 'Saved', count: statusCounts.Saved, fill: '#6366f1' },
      { status: 'Applied', count: statusCounts.Applied, fill: '#3b82f6' },
      { status: 'Interview', count: statusCounts.Interview, fill: '#f59e0b' },
      { status: 'Offer', count: statusCounts.Offer, fill: '#10b981' },
      { status: 'Rejected', count: statusCounts.Rejected, fill: '#ef4444' }
    ];

    // 3. Recommended Opportunities based on matching student skills
    const studentSkills = (student.skills || []).map(s => s.toLowerCase());
    const allOpportunities = await Opportunity.find().sort({ createdAt: -1 });

    const recommendedOpportunities = allOpportunities.filter(op => {
      if (!op.requiredSkills || op.requiredSkills.length === 0) return true;
      return op.requiredSkills.some(skill => studentSkills.includes(skill.toLowerCase()));
    }).slice(0, 5);

    // 4. Upcoming Deadlines (Deadlines in the future)
    const upcomingDeadlines = await Opportunity.find({
      deadline: { $gte: new Date() }
    }).sort({ deadline: 1 }).limit(5);

    // 5. Recent Notifications
    const recentNotifications = await Notification.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Recent Applications
    const recentApplications = await Application.find({ student: studentId })
      .populate('opportunity')
      .sort({ updatedAt: -1 })
      .limit(5);

    // 7. Monthly Application Trend (last 6 months)
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendAgg = await Application.aggregate([
      { $match: { student: studentId, appliedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$appliedAt' }, month: { $month: '$appliedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build full 6-month array with zeros for empty months
    const monthlyApplicationTrend = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const found = trendAgg.find(a => a._id.month === m && a._id.year === y);
      monthlyApplicationTrend.push({
        month: monthNames[m - 1],
        count: found ? found.count : 0
      });
    }

    res.json({
      profileCompletion: student.profileCompletion,
      savedCount,
      appliedCount,
      recommendedCount: recommendedOpportunities.length,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      applicationStatusChart,
      recommendedOpportunities,
      upcomingDeadlines,
      recentNotifications,
      recentApplications,
      monthlyApplicationTrend
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dashboard data', error: error.message });
  }
};

// @desc    Admin View All Students
// @route   GET /api/students
// @access  Private (Admin)
const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { university: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const students = await Student.find(query).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving students list', error: error.message });
  }
};

// @desc    Admin Delete Student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Clean up student related data
    await Application.deleteMany({ student: req.params.id });
    await Bookmark.deleteMany({ student: req.params.id });
    await Notification.deleteMany({ student: req.params.id });
    await student.deleteOne();

    res.json({ message: 'Student account and associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student account', error: error.message });
  }
};

module.exports = {
  updateProfile,
  getStudentDashboard,
  getAllStudents,
  deleteStudent
};
