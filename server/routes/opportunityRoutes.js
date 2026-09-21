const express = require('express');
const router = express.Router();
const {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect, adminOnly } = require('../middleware/auth');

// Optional auth middleware helper so students get match scores while public browsing is also supported
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getAllOpportunities);
router.get('/:id', optionalAuth, getOpportunityById);

// Admin CRUD
router.post('/', protect, adminOnly, createOpportunity);
router.put('/:id', protect, adminOnly, updateOpportunity);
router.delete('/:id', protect, adminOnly, deleteOpportunity);

module.exports = router;
