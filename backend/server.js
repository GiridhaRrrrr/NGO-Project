const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();
connectDB();

// Auto-create demo users if they don't exist
const createDemoUsers = async () => {
  try {
    const demoUsers = [
      {
        name: 'Demo User',
        email: 'user@test.com',
        password: 'password123',
        role: 'user',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.076] // Mumbai coordinates
        }
      },
      {
        name: 'Demo NGO',
        email: 'ngo@test.com',
        password: 'password123',
        role: 'ngo',
        organization: 'Demo NGO Organization',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.076] // Mumbai coordinates
        }
      },
      {
        name: 'Demo Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.076] // Mumbai coordinates
        }
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        console.log(`Created demo user: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('Error creating demo users:', error);
  }
};

// Wait a bit for DB connection then create users
setTimeout(createDemoUsers, 2000);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Basic Route for testing
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.get('/', (req, res) => res.send('NGO Platform API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));