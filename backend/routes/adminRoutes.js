const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  getPendingRequests, 
  verifyRequest, 
  getAnalytics 
} = require('../controllers/adminController');

// Admin Role Verification Middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Apply auth and admin middleware to all routes in this file
router.use(auth, requireAdmin);

// @route   GET /api/admin/pending
router.get('/pending', getPendingRequests);

// @route   PATCH /api/admin/verify/:id
router.patch('/verify/:id', verifyRequest);

// @route   GET /api/admin/analytics
router.get('/analytics', getAnalytics);

module.exports = router;