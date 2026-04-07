const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chat');
require('dotenv').config();

const createMentorAndChat = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unifit');
    
    // Check if mentor already exists
    let mentor = await User.findOne({ email: 'arjun@unifit.com' });
    
    if (!mentor) {
      // Create mentor user
      mentor = new User({
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

      await mentor.save();
      console.log('✅ Mentor user created successfully');
    } else {
      console.log('✅ Mentor user already exists');
    }
    
    // Get demo student user
    const student = await User.findOne({ email: 'demo@unifit.com' });
    
    if (!student) {
      console.log('❌ Demo student user not found. Please create demo user first.');
      process.exit(1);
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      'participants.user': { $all: [mentor._id, student._id] }
    });
    
    if (existingChat) {
      console.log('✅ Chat already exists between mentor and student');
      process.exit(0);
    }
    
    // Create chat between mentor and student
    const chat = new Chat({
      participants: [
        { user: mentor._id, role: 'mentor' },
        { user: student._id, role: 'student' }
      ],
      type: 'mentorship',
      title: 'Fitness Coaching - Arjun & Demo',
      description: 'Personal fitness coaching and nutrition guidance',
      status: 'active',
      messages: [
        {
          sender: mentor._id,
          content: "Hi! I'm Coach Arjun. I'll be helping you with your fitness journey. How are you feeling about your current workout routine?",
          type: 'text',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          sender: student._id,
          content: "Hi Coach! I've been doing okay but struggling to stay consistent with my workouts.",
          type: 'text',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        },
        {
          sender: mentor._id,
          content: "That's completely normal! Consistency is the biggest challenge. Let's start with a more manageable routine. Have you hit your protein goal yet? Check in with me about your nutrition today.",
          type: 'text',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      ],
      metadata: {
        totalMessages: 3,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium'
      }
    });

    await chat.save();
    console.log('✅ Chat created successfully between mentor and student');
    console.log('📧 Mentor: arjun@unifit.com | Password: mentor123');
    console.log('📧 Student: demo@unifit.com | Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating mentor and chat:', error.message);
    process.exit(1);
  }
};

createMentorAndChat();
