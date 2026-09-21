const Opportunity = require('../models/Opportunity');
const Student = require('../models/Student');
const Bookmark = require('../models/Bookmark');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Helper to calculate AI Match Score between student skills and opportunity required skills
const calculateMatchScore = (studentSkills = [], requiredSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 100, matches: [], missing: [], reason: 'No specific skills required' };
  }
  if (!studentSkills || studentSkills.length === 0) {
    return { 
      score: 30, 
      matches: [], 
      missing: requiredSkills, 
      reason: 'Add your skills in your profile to see accurate matches' 
    };
  }

  const sSkillsLower = studentSkills.map(s => s.toLowerCase().trim());
  const matches = [];
  const missing = [];

  requiredSkills.forEach(reqSkill => {
    const isMatch = sSkillsLower.some(s => s.includes(reqSkill.toLowerCase().trim()) || reqSkill.toLowerCase().trim().includes(s));
    if (isMatch) {
      matches.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const percentage = Math.round((matches.length / requiredSkills.length) * 100);
  const score = Math.max(percentage, 25);

  return {
    score,
    matches,
    missing,
    reason: `${matches.length} of ${requiredSkills.length} required skills match your profile`
  };
};

// @desc    Get All Opportunities (with Search & Category Filters)
// @route   GET /api/opportunities
// @access  Public / Student / Admin
const getAllOpportunities = async (req, res) => {
  try {
    const { search, category, minCgpa } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (minCgpa) {
      filter.cgpaRequirement = { $lte: parseFloat(minCgpa) };
    }

    let opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });

    // If user is a Student, append AI Match Score, Bookmarked, and Applied flags
    if (req.user && req.user.role === 'Student') {
      const student = await Student.findById(req.user._id);
      const studentBookmarks = await Bookmark.find({ student: req.user._id }).select('opportunity');
      const bookmarkedIds = studentBookmarks.map(b => b.opportunity.toString());

      const studentApps = await Application.find({ student: req.user._id }).select('opportunity status');
      const appMap = {};
      studentApps.forEach(a => { appMap[a.opportunity.toString()] = a.status; });

      opportunities = opportunities.map(op => {
        const opObj = op.toObject();
        const matchData = calculateMatchScore(student ? student.skills : [], op.requiredSkills);
        opObj.matchScore = matchData.score;
        opObj.matchDetails = matchData;
        opObj.isBookmarked = bookmarkedIds.includes(op._id.toString());
        opObj.applicationStatus = appMap[op._id.toString()] || null;
        return opObj;
      });
    }

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
};

// @desc    Get Opportunity By ID
// @route   GET /api/opportunities/:id
// @access  Public / Student / Admin
const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const opObj = opportunity.toObject();

    if (req.user && req.user.role === 'Student') {
      const student = await Student.findById(req.user._id);
      opObj.matchDetails = calculateMatchScore(student ? student.skills : [], opportunity.requiredSkills);
      opObj.matchScore = opObj.matchDetails.score;

      const bookmark = await Bookmark.findOne({ student: req.user._id, opportunity: opportunity._id });
      opObj.isBookmarked = !!bookmark;

      const application = await Application.findOne({ student: req.user._id, opportunity: opportunity._id });
      opObj.applicationStatus = application ? application.status : null;
    }

    res.json(opObj);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving opportunity details', error: error.message });
  }
};

// @desc    Create Opportunity
// @route   POST /api/opportunities
// @access  Private (Admin)
const createOpportunity = async (req, res) => {
  try {
    const {
      companyName, role, category, description, eligibility,
      requiredSkills, cgpaRequirement, location, stipendSalary, deadline, applyLink, companyLogo
    } = req.body;

    if (!companyName || !role || !category || !description || !eligibility || !stipendSalary || !deadline || !applyLink) {
      return res.status(400).json({ message: 'Please provide all required opportunity fields' });
    }

    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : []);

    const opportunity = new Opportunity({
      companyName,
      role,
      category,
      description,
      eligibility,
      requiredSkills: skillsArray,
      cgpaRequirement: cgpaRequirement ? parseFloat(cgpaRequirement) : 0,
      location: location || 'Remote / On-site',
      stipendSalary,
      deadline: new Date(deadline),
      applyLink,
      companyLogo: companyLogo || '',
      createdBy: req.user._id
    });

    await opportunity.save();

    // Send Notification to all students about new opportunity
    const students = await Student.find().select('_id');
    const notifications = students.map(s => ({
      student: s._id,
      title: `New ${category}: ${role} at ${companyName}! 🚀`,
      message: `${companyName} is looking for a ${role}. Apply before ${new Date(deadline).toLocaleDateString()}.`,
      type: 'OPPORTUNITY'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'Opportunity created successfully',
      opportunity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating opportunity', error: error.message });
  }
};

// @desc    Update Opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Admin)
const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const {
      companyName, role, category, description, eligibility,
      requiredSkills, cgpaRequirement, location, stipendSalary, deadline, applyLink, companyLogo
    } = req.body;

    if (companyName) opportunity.companyName = companyName;
    if (role) opportunity.role = role;
    if (category) opportunity.category = category;
    if (description) opportunity.description = description;
    if (eligibility) opportunity.eligibility = eligibility;
    if (stipendSalary) opportunity.stipendSalary = stipendSalary;
    if (deadline) opportunity.deadline = new Date(deadline);
    if (applyLink) opportunity.applyLink = applyLink;
    if (location !== undefined) opportunity.location = location;
    if (companyLogo !== undefined) opportunity.companyLogo = companyLogo;
    if (cgpaRequirement !== undefined) opportunity.cgpaRequirement = parseFloat(cgpaRequirement);

    if (requiredSkills !== undefined) {
      opportunity.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    await opportunity.save();

    res.json({
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating opportunity', error: error.message });
  }
};

// @desc    Delete Opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Admin)
const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    await Bookmark.deleteMany({ opportunity: req.params.id });
    await Application.deleteMany({ opportunity: req.params.id });
    await opportunity.deleteOne();

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting opportunity', error: error.message });
  }
};

module.exports = {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
};
