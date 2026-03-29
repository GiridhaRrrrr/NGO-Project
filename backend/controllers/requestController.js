const HelpRequest = require('../models/HelpRequest');

// @desc    Create a new help request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { category, description, contact, lat, lng } = req.body;
    
    // Validate required fields
    if (!category || !description || !contact) {
      return res.status(400).json({ message: 'Please provide category, description, and contact information' });
    }

    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid coordinates format' });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Coordinates out of valid range' });
    }
    
    // Get image path if a file was uploaded
    // const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // const newRequest = new HelpRequest({
    //   userId: req.user.id, // Comes from authMiddleware
    //   userName: req.user.name || 'User', // You might want to fetch user details to get the exact name
    //   category,
    //   description,
    //   contact,
    //   location: {
    //     type: 'Point',
    //     coordinates: [longitude, latitude] // MongoDB needs [lng, lat]
    //   },
    //   imageUrl
    // });

    const documentUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newRequest = new HelpRequest({
      userId: req.user.id,
      userName: req.user.name || 'User',
      category,
      description,
      contact,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] 
      },
      documents: documentUrls 
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error while creating request' });
  }
};

// @desc    Get all requests for a specific user
// @route   GET /api/requests/user/:userId
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user requests' });
  }
};

// @desc    Get nearby verified requests for NGOs
// @route   GET /api/requests/nearby
exports.getNearbyRequests = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // default radius 50km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid coordinates format' });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Coordinates out of valid range' });
    }

    const requests = await HelpRequest.find({
      status: 'Verified',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    });

    res.json(requests);
  } catch (error) {
    console.error('Get nearby requests error:', error);
    res.status(500).json({ message: 'Server error fetching nearby requests' });
  }
};

exports.getNgoTasks = async (req, res) => {
  try {
    // Find all requests where assignedNgoId matches the logged-in NGO's ID
    const tasks = await HelpRequest.find({ assignedNgoId: req.user.id }).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get NGO tasks error:', error);
    res.status(500).json({ message: 'Server error fetching NGO tasks' });
  }
};

// @desc    Update request status (Accepted, Completed, etc.)
// @route   PATCH /api/requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let updateData = { status };

    // NEW LOGIC: If an NGO accepts the request, permanently link it to them
    if (status === 'Accepted' && req.user.role === 'ngo') {
      updateData.assignedNgoId = req.user.id;
    }

    const request = await HelpRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.json(request);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating request' });
  }
};