const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if demo user exists
    const demoUser = await User.findOne({ email: 'demo@unifit.com' });
    if (demoUser) {
      console.log('✅ Demo user exists');
      console.log('   Username:', demoUser.username);
      console.log('   Email:', demoUser.email);
      console.log('   Role:', demoUser.role);
      
      // Test 2: Test password comparison
      const isMatch = await demoUser.comparePassword('demo123');
      console.log('✅ Password test (demo123):', isMatch ? 'MATCH ✅' : 'NO MATCH ❌');
    } else {
      console.log('❌ Demo user does NOT exist');
    }

    // Test 3: Check if mentor user exists
    const mentorUser = await User.findOne({ email: 'arjun@unifit.com' });
    if (mentorUser) {
      console.log('✅ Mentor user exists');
      console.log('   Username:', mentorUser.username);
      console.log('   Email:', mentorUser.email);
      console.log('   Role:', mentorUser.role);
      
      // Test 4: Test password comparison
      const isMatch = await mentorUser.comparePassword('mentor123');
      console.log('✅ Password test (mentor123):', isMatch ? 'MATCH ✅' : 'NO MATCH ❌');
    } else {
      console.log('❌ Mentor user does NOT exist');
    }

    // Test 5: List all users
    const allUsers = await User.find({}, 'username email role').limit(5);
    console.log('\n📋 Sample users in database:');
    allUsers.forEach(u => {
      console.log(`   - ${u.username} (${u.email}) - ${u.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
