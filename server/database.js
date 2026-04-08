const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Connecting to MongoDB Atlas...');
    console.log('\x1b[36m%s\x1b[0m', `URI: ${process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@')}`);
    
    // Connect to MongoDB Atlas only
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log(`\x1b[32m\x1b[1m%s\x1b[0m`, `MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`\x1b[32m\x1b[1m%s\x1b[0m`, `Database: ${conn.connection.name}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('\x1b[31m\x1b[1m%s\x1b[0m', 'MongoDB Atlas connection failed:', error.message);
    console.error('\x1b[33m%s\x1b[0m', 'To fix this issue:');
    console.error('   1. Go to your MongoDB Atlas dashboard');
    console.error('   2. Navigate to Network Access');
    console.error('   3. Add your current IP address to the whitelist');
    console.error('   4. Or use 0.0.0.0/0 to allow access from anywhere (not recommended for production)');
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
