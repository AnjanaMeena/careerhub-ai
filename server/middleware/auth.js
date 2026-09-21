const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerhub_super_secret_jwt_key_2026_major_project');
      
      if (decoded.role === 'Admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
        if (req.user) req.user.role = 'Admin';
      } else {
        req.user = await Student.findById(decoded.id).select('-password');
        if (req.user) req.user.role = 'Student';
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Student') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Student authorization required' });
  }
};

module.exports = { protect, adminOnly, studentOnly };
