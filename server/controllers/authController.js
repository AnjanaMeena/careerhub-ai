const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');

// Generate JWT token helper
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'careerhub_super_secret_jwt_key_2026_major_project',
    { expiresIn: '30d' }
  );
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, university, department, year, cgpa, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const studentExists = await Student.findOne({ email: email.toLowerCase() });
    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new Student({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      university: university || '',
      department: department || '',
      year: year || '',
      cgpa: cgpa ? parseFloat(cgpa) : 0,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : [])
    });

    student.calculateCompletion();
    await student.save();

    // Create welcome notification
    await Notification.create({
      student: student._id,
      title: 'Welcome to CareerHub AI! 🎉',
      message: 'Complete your profile details to unlock personalized opportunity recommendations and AI guidance.',
      type: 'SYSTEM'
    });

    const token = generateToken(student._id, 'Student');

    res.status(201).json({
      message: 'Student registration successful',
      token,
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: 'Student',
        profileCompletion: student.profileCompletion,
        skills: student.skills
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Student Login
// @route   POST /api/auth/student-login
// @access  Public
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(student._id, 'Student');

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        university: student.university,
        department: student.department,
        year: student.year,
        cgpa: student.cgpa,
        skills: student.skills,
        interests: student.interests,
        linkedin: student.linkedin,
        github: student.github,
        portfolio: student.portfolio,
        resumeUrl: student.resumeUrl,
        profileCompletion: student.profileCompletion,
        role: 'Student'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin-login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin._id, 'Admin');

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'Admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve current user profile', error: error.message });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  getCurrentUser
};
