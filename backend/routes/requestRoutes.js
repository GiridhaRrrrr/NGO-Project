const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');
const { 
  createRequest, 
  getUserRequests, 
  getNearbyRequests, 
  updateRequestStatus,
  getNgoTasks
} = require('../controllers/requestController');

// Submit a request: Needs Auth + File Upload handling (for the 'image' field)
// router.post('/', auth, upload.single('image'), createRequest);

// This allows up to 5 files at once
router.post('/', auth, upload.array('documents', 5), createRequest);

// Get requests for a specific user (Needs Auth)
router.get('/user/:userId', auth, getUserRequests);

// Get nearby requests (NGOs looking for verified requests)
router.get('/nearby', getNearbyRequests);

// Get tasks assigned to the logged-in NGO
router.get('/ngo-tasks', auth, getNgoTasks);

// Update status (e.g., NGO accepts a request)
router.patch('/:id/status', auth, updateRequestStatus);

module.exports = router;