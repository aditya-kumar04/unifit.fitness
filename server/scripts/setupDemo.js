const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chat');
require('dotenv').config();

const setupDemo = async () => {
  try {
    console.log('🔧 Setting up UNIFIT Demo Environment...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create demo student user
    let demoUser = await User.findOne({ email: 'demo@unifit.com' });
    
    if (!demoUser) {
      console.log('Creating demo user...');
      demoUser = new User({
        username: 'demo',
        email: 'demo@unifit.com',
        password: 'demo123',
        role: 'student',
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          bio: 'Demo student for testing'
        }
      });
      await demoUser.save();
      console.log('✅ Demo user created successfully');
    } else {
      console.log('✅ Demo user already exists');
    }

    // Verify demo user password
    const demoPasswordValid = await demoUser.comparePassword('demo123');
    console.log(`   Password test: ${demoPasswordValid ? '✅ WORKS' : '❌ FAILED'}`);

    // Create mentor user
    let mentorUser = await User.findOne({ email: 'arjun@unifit.com' });
    
    if (!mentorUser) {
      console.log('Creating mentor user...');
      mentorUser = new User({
        username: 'arjun',
        email: 'arjun@unifit.com',
        password: 'mentor123',
        role: 'mentor',
        profile: {
          firstName: 'Arjun',
          lastName: 'Singh',
          bio: 'Fitness coach specializing in strength training and nutrition'
        }
      });
      await mentorUser.save();
      console.log('✅ Mentor user created successfully');
    } else {
      console.log('✅ Mentor user already exists');
    }

    // Verify mentor password
    const mentorPasswordValid = await mentorUser.comparePassword('mentor123');
    console.log(`   Password test: ${mentorPasswordValid ? '✅ WORKS' : '❌ FAILED'}`);

    // Create mentorship chat
    const existingChat = await Chat.findOne({
      'participants.user': { $all: [mentorUser._id, demoUser._id] }
    });

    if (!existingChat) {
      console.log('Creating mentorship chat...');
      const chat = new Chat({
        participants: [
          { user: mentorUser._id, role: 'mentor' },
          { user: demoUser._id, role: 'student' }
        ],
        type: 'mentorship',
        title: 'Fitness Coaching',
        description: 'Personal fitness coaching and nutrition guidance',
        status: 'active',
        messages: [
          {
            sender: mentorUser._id,
            content: "Hi! I'm Coach Arjun. Let's start your fitness journey!",
            type: 'text',
            isRead: false,
            createdAt: new Date()
          }
        ],
        metadata: {
          totalMessages: 1,
          lastActivity: new Date(),
          priority: 'medium'
        }
      });

      await chat.save();
      console.log('✅ Mentorship chat created successfully');
    } else {
      console.log('✅ Mentorship chat already exists');
    }

    console.log('\n📋 Demo Credentials:\n');
    console.log('Student Account:');
    console.log('  Email:    demo@unifit.com');
    console.log('  Password: demo123\n');
    
    console.log('Mentor Account:');
    console.log('  Email:    arjun@unifit.com');
    console.log('  Password: mentor123\n');

    console.log('🎯 You can now login to the platform at http://localhost:3000\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

setupDemo();
