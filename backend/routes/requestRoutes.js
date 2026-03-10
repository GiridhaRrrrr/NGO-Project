const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');
const { 
  createRequest, 
  getUserRequests, 
  getNearbyRequests, 
  updateRequestStatus 
} = require('../controllers/requestController');

// Submit a request: Needs Auth + File Upload handling (for the 'image' field)
router.post('/', auth, upload.single('image'), createRequest);

// Get requests for a specific user (Needs Auth)
router.get('/user/:userId', auth, getUserRequests);

// Get nearby requests (NGOs looking for verified requests)
router.get('/nearby', getNearbyRequests);

// Update status (e.g., NGO accepts a request)
router.patch('/:id/status', auth, updateRequestStatus);

module.exports = router;