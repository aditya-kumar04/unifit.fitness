const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const Workout = require('../models/Workout');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin middleware to all routes
router.use(authenticate, requireAdmin);

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.status) filters['subscription.status'] = req.query.status;
    if (req.query.search) {
      filters.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { 'profile.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'profile.lastName': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.isBanned !== undefined) filters['activity.isBanned'] = req.query.isBanned === 'true';
    if (req.query.isOnline !== undefined) filters['activity.isOnline'] = req.query.isOnline === 'true';

    const users = await User.find(filters)
      .select('-password')
      .sort({ 'activity.lastLogin': -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filters);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 'activity.isBanned': true }),
      User.countDocuments({ 'activity.isOnline': true }),
      User.countDocuments({ 'subscription.plan': 'free' }),
      User.countDocuments({ 'subscription.plan': 'mentored' }),
      User.countDocuments({ 
        'activity.lastLogin': { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      })
    ]);

    res.json({
      totalStudents: stats[0],
      totalMentors: stats[1],
      totalAdmins: stats[2],
      bannedUsers: stats[3],
      onlineUsers: stats[4],
      freeSubscriptions: stats[5],
      mentoredSubscriptions: stats[6],
      activeLastWeek: stats[7]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific user details
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('subscription.mentorId', 'username email profile.firstName profile.lastName');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's recent workouts
    const recentWorkouts = await Workout.find({ user: user._id })
      .sort({ scheduledDate: -1 })
      .limit(10)
      .populate('mentor', 'username profile.firstName profile.lastName');

    // Get user's chats
    const userChats = await Chat.find({ 
      'participants.user': user._id 
    })
    .populate('participants.user', 'username profile.firstName profile.lastName')
    .sort({ 'metadata.lastActivity': -1 })
    .limit(5);

    res.json({
      user,
      recentWorkouts,
      userChats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin can update any user)
router.put('/users/:userId', async (req, res) => {
  try {
    const allowedUpdates = [
      'username', 'email', 'role', 'profile', 'subscription', 
      'activity.isBanned', 'activity.banReason', 'activity.banExpires',
      'notifications'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban/Unban user
router.post('/users/:userId/ban', async (req, res) => {
  try {
    const { reason, duration } = req.body; // duration in days
    
    const banExpires = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        'activity.isBanned': true,
        'activity.banReason': reason,
        'activity.banExpires': banExpires
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User banned successfully',
      user,
      banExpires
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/:userId/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        'activity.isBanned': false,
        'activity.banReason': null,
        'activity.banExpires': null
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User unbanned successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also delete user's workouts and chats
    await Workout.deleteMany({ user: req.params.userId });
    await Chat.deleteMany({ 'participants.user': req.params.userId });

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHAT MANAGEMENT ====================

// Get all chats with filtering
router.get('/chats', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters['metadata.priority'] = req.query.priority;
    if (req.query.isMonitored !== undefined) filters['adminNotes.isMonitored'] = req.query.isMonitored === 'true';

    const chats = await Chat.find(filters)
      .populate('participants.user', 'username email profile.firstName profile.lastName role')
      .sort({ 'metadata.lastActivity': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments(filters);

    res.json({
      chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat details with all messages
router.get('/chats/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants.user', 'username email profile.firstName profile.lastName role')
      .populate('messages.sender', 'username profile.firstName profile.lastName');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add admin note to chat
router.post('/chats/:chatId/notes', async (req, res) => {
  try {
    const { content } = req.body;
    
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      {
        $push: {
          'adminNotes.notes': {
            content,
            admin: req.user._id,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('adminNotes.notes.admin', 'username profile.firstName profile.lastName');

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flag chat for monitoring
router.post('/chats/:chatId/flag', async (req, res) => {
  try {
    const { type, reason } = req.body;
    
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      {
        $push: {
          'adminNotes.flags': {
            type,
            reason,
            admin: req.user._id,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle chat monitoring
router.put('/chats/:chatId/monitor', async (req, res) => {
  try {
    const { isMonitored, monitoringReason } = req.body;
    
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      {
        'adminNotes.isMonitored': isMonitored,
        'adminNotes.monitoringReason': monitoringReason
      },
      { new: true }
    );

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WORKOUT MANAGEMENT ====================

// Get all workouts with filtering
router.get('/workouts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.difficulty) filters.difficulty = req.query.difficulty;
    if (req.query.user) filters.user = req.query.user;
    if (req.query.mentor) filters.mentor = req.query.mentor;

    const workouts = await Workout.find(filters)
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('mentor', 'username profile.firstName profile.lastName')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Workout.countDocuments(filters);

    res.json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workout statistics
router.get('/workouts/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      Workout.countDocuments(),
      Workout.countDocuments({ status: 'completed' }),
      Workout.countDocuments({ status: 'scheduled' }),
      Workout.countDocuments({ status: 'skipped' }),
      Workout.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Workout.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalWorkouts: stats[0],
      completedWorkouts: stats[1],
      scheduledWorkouts: stats[2],
      skippedWorkouts: stats[3],
      workoutsByType: stats[4],
      workoutsByDifficulty: stats[5]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYSTEM STATISTICS ====================

// Get comprehensive system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalChats,
      activeChats,
      totalWorkouts,
      completedWorkouts,
      newUsersThisMonth,
      newWorkoutsThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'activity.lastLogin': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Chat.countDocuments(),
      Chat.countDocuments({ status: 'active' }),
      Workout.countDocuments(),
      Workout.countDocuments({ status: 'completed' }),
      User.countDocuments({ 'activity.accountCreated': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Workout.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth
      },
      chats: {
        total: totalChats,
        active: activeChats
      },
      workouts: {
        total: totalWorkouts,
        completed: completedWorkouts,
        newThisMonth: newWorkoutsThisMonth
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
