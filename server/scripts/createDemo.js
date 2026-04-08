const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDemo = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unifit');
    
    // Check if demo user already exists
    const existingDemo = await User.findOne({ email: 'demo@unifit.com' });
    if (existingDemo) {
      console.log('❌ Demo user already exists');
      process.exit(0);
    }

    // Create demo user
    const demo = new User({
      username: 'demo',
      email: 'demo@unifit.com',
      password: 'demo123',
      role: 'student',
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        bio: 'Demo user for UNIFIT platform'
      }
    });

    await demo.save();
    console.log('✅ Demo user created successfully');
    console.log('📧 Email: demo@unifit.com');
    console.log('🔑 Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    process.exit(1);
  }
};

createDemo();
