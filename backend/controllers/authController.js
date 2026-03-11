const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User or NGO
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization, lat, lng } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    let coordinates = [0, 0];
    if (lat !== undefined && lng !== undefined) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) return res.status(400).json({ message: 'Invalid coordinates format' });
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return res.status(400).json({ message: 'Coordinates out of valid range' });
      
      coordinates = [longitude, latitude];
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      organization: role === 'ngo' ? organization : undefined,
      location: {
        type: 'Point',
        coordinates
      }
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // FIX: Send lat/lng back to the frontend on register!
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        lat: user.location?.coordinates[1],
        lng: user.location?.coordinates[0]
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User or NGO
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // FIX: Send lat/lng back to the frontend on login!
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        lat: user.location?.coordinates[1],
        lng: user.location?.coordinates[0]
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};