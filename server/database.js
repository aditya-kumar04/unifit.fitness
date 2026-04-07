const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unifit');

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('🔧 Please check:');
    console.error('   1. MongoDB URI in .env file');
    console.error('   2. Network connectivity');
    console.error('   3. Database credentials');
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    const User = require('./models/User');
    await User.createIndexes([
      { email: 1 },
      { username: 1 },
      { role: 1 },
      { 'activity.isBanned': 1 },
      { 'activity.lastLogin': -1 }
    ]);

    // Chat indexes
    const Chat = require('./models/Chat');
    await Chat.createIndexes([
      { 'participants.user': 1 },
      { 'metadata.lastActivity': -1 },
      { status: 1 },
      { type: 1 }
    ]);

    // Workout indexes
    const Workout = require('./models/Workout');
    await Workout.createIndexes([
      { user: 1, scheduledDate: -1 },
      { mentor: 1, scheduledDate: -1 },
      { status: 1 },
      { type: 1 }
    ]);

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

module.exports = connectDB;
