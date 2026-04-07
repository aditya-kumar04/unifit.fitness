const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Workout = require('../models/Workout');
const Chat = require('../models/Chat');
const { authenticate, requireMentorOrAdmin } = require('../middleware/auth');

// Get mentor's clients
router.get('/clients', authenticate, requireMentorOrAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Find users who have this mentor assigned
    const clients = await User.find({
      'subscription.mentorId': req.user._id,
      role: 'student'
    })
    .select('-password')
    .sort({ 'activity.lastLogin': -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Add additional client data
    const clientsWithStats = await Promise.all(clients.map(async (client) => {
      // Get workout stats
      const workoutStats = await Workout.aggregate([
        { $match: { user: client._id, status: 'completed' } },
        { $group: { 
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalMinutes: { $sum: '$duration.actual' },
          lastWorkout: { $max: '$completedDate' }
        }}
      ]);
      
      // Get recent chat activity
      const recentChat = await Chat.findOne({
        'participants.user': client._id,
        'participants.role': 'mentor'
      })
      .sort({ 'metadata.lastActivity': -1 })
      .limit(1);
      
      // Calculate status based on activity
      let clientStatus = 'On Track';
      const daysSinceLastWorkout = workoutStats[0]?.lastWorkout 
        ? Math.floor((new Date() - workoutStats[0].lastWorkout) / (1000 * 60 * 60 * 24))
        : 999;
      
      const daysSinceLastLogin = client.activity.lastLogin
        ? Math.floor((new Date() - client.activity.lastLogin) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceLastLogin > 7) {
        clientStatus = 'At Risk';
      } else if (daysSinceLastWorkout > 5) {
        clientStatus = 'Needs Nudge';
      } else if (client.progress.streak >= 7) {
        clientStatus = 'Excellent';
      }
      
      return {
        ...client.toObject(),
        stats: {
          workoutsCompleted: workoutStats[0]?.totalWorkouts || 0,
          totalMinutes: workoutStats[0]?.totalMinutes || 0,
          lastWorkout: workoutStats[0]?.lastWorkout,
          streak: client.progress.streak || 0,
          currentWeight: client.progress.weight?.length > 0 
            ? client.progress.weight[client.progress.weight.length - 1].value 
            : null
        },
        status: clientStatus,
        online: client.activity.isOnline,
        lastLogin: client.activity.lastLogin,
        recentChatActivity: recentChat?.metadata.lastActivity
      };
    }));
    
    // Filter by status if provided
    const filteredClients = status 
      ? clientsWithStats.filter(client => client.status === status)
      : clientsWithStats;
    
    const total = await User.countDocuments({
      'subscription.mentorId': req.user._id,
      role: 'student',
      ...(status && { /* Would need to add status to user schema for proper filtering */ })
    });
    
    res.json({
      clients: filteredClients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalClients: total,
        onTrack: clientsWithStats.filter(c => c.status === 'On Track').length,
        needsNudge: clientsWithStats.filter(c => c.status === 'Needs Nudge').length,
        atRisk: clientsWithStats.filter(c => c.status === 'At Risk').length,
        excellent: clientsWithStats.filter(c => c.status === 'Excellent').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client details
router.get('/clients/:clientId', authenticate, requireMentorOrAdmin, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Verify this mentor has access to this client
    const client = await User.findOne({
      _id: clientId,
      'subscription.mentorId': req.user._id,
      role: 'student'
    }).select('-password');
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }
    
    // Get detailed workout history
    const workoutHistory = await Workout.find({
      user: clientId,
      status: 'completed'
    })
    .populate('mentor', 'username profile.firstName profile.lastName')
    .sort({ completedDate: -1 })
    .limit(20);
    
    // Get progress data
    const weightHistory = client.progress.weight || [];
    const measurements = client.progress.measurements || [];
    const photos = client.progress.photos || [];
    
    // Get chat history
    const chatHistory = await Chat.find({
      'participants.user': clientId,
      'participants.role': 'mentor'
    })
    .populate('messages.sender', 'username profile.firstName profile.lastName')
    .sort({ 'metadata.lastActivity': -1 })
    .limit(10);
    
    // Calculate analytics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workoutHistory.filter(w => w.completedDate >= last30Days);
    
    res.json({
      client: {
        ...client.toObject(),
        stats: {
          workoutsCompleted: workoutHistory.length,
          workoutsThisMonth: recentWorkouts.length,
          totalMinutes: workoutHistory.reduce((sum, w) => sum + (w.duration.actual || 0), 0),
          streak: client.progress.streak || 0,
          currentWeight: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null,
          weightTrend: weightHistory.length >= 2 
            ? weightHistory[weightHistory.length - 1].value - weightHistory[0].value 
            : 0
        }
      },
      workoutHistory: workoutHistory.slice(0, 10), // Last 10 workouts
      progress: {
        weight: weightHistory.slice(-12), // Last 12 weight entries
        measurements: measurements.slice(-20), // Last 20 measurements
        photos: photos.slice(-8) // Last 8 photos
      },
      chatHistory,
      recentActivity: {
        lastWorkout: workoutHistory[0]?.completedDate,
        lastLogin: client.activity.lastLogin,
        lastMessage: chatHistory[0]?.metadata.lastActivity
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add client note
router.post('/clients/:clientId/notes', authenticate, requireMentorOrAdmin, [
  require('express-validator').body('content').notEmpty().trim().withMessage('Note content is required'),
  require('express-validator').body('type').optional().isIn(['general', 'progress', 'concern', 'achievement']).withMessage('Invalid note type')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { clientId } = req.params;
    const { content, type = 'general' } = req.body;
    
    // Verify access
    const client = await User.findOne({
      _id: clientId,
      'subscription.mentorId': req.user._id,
      role: 'student'
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }
    
    // Add note to client's record (in production, would have separate notes model)
    const note = {
      content,
      type,
      mentor: req.user._id,
      mentorName: `${req.user.profile.firstName || ''} ${req.user.profile.lastName || req.user.username}`.trim(),
      createdAt: new Date()
    };
    
    if (!client.mentorNotes) {
      client.mentorNotes = [];
    }
    
    client.mentorNotes.push(note);
    await client.save();
    
    res.status(201).json({
      message: 'Note added successfully',
      note
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mentor analytics
router.get('/analytics', authenticate, requireMentorOrAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    // Get all clients
    const clients = await User.find({
      'subscription.mentorId': req.user._id,
      role: 'student'
    });
    
    const clientIds = clients.map(c => c._id);
    
    // Get workout analytics
    const workoutAnalytics = await Workout.aggregate([
      { $match: { 
        user: { $in: clientIds },
        completedDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }},
      { $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalMinutes: { $sum: '$duration.actual' },
        avgDuration: { $avg: '$duration.actual' },
        workoutsByType: { $push: '$type' }
      }}
    ]);
    
    // Get client progress analytics
    const clientProgress = await Promise.all(clients.map(async (client) => {
      const weightHistory = client.progress.weight || [];
      const recentWeight = weightHistory.filter(w => new Date(w.date) >= startDate);
      
      const workoutsCompleted = await Workout.countDocuments({
        user: client._id,
        completedDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      });
      
      return {
        clientId: client._id,
        name: `${client.profile.firstName || ''} ${client.profile.lastName || client.username}`.trim(),
        workoutsCompleted,
        streak: client.progress.streak || 0,
        weightChange: recentWeight.length >= 2 
          ? recentWeight[recentWeight.length - 1].value - recentWeight[0].value 
          : 0,
        lastLogin: client.activity.lastLogin,
        status: client.activity.isOnline ? 'online' : 'offline'
      };
    }));
    
    // Calculate summary stats
    const totalClients = clients.length;
    const activeClients = clientProgress.filter(c => c.workoutsCompleted > 0).length;
    const avgWorkoutsPerClient = activeClients > 0 
      ? clientProgress.reduce((sum, c) => sum + c.workoutsCompleted, 0) / activeClients 
      : 0;
    
    const workoutData = workoutAnalytics[0] || { totalWorkouts: 0, totalMinutes: 0, avgDuration: 0 };
    
    res.json({
      period,
      summary: {
        totalClients,
        activeClients,
        avgWorkoutsPerClient: Math.round(avgWorkoutsPerClient * 10) / 10,
        totalWorkouts: workoutData.totalWorkouts,
        totalMinutes: workoutData.totalMinutes,
        avgSessionDuration: Math.round(workoutData.avgDuration || 0)
      },
      clientProgress,
      workoutsByType: workoutData.workoutsByType?.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}) || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create workout plan for client
router.post('/clients/:clientId/workout-plan', authenticate, requireMentorOrAdmin, [
  require('express-validator').body('title').notEmpty().trim().withMessage('Workout title is required'),
  require('express-validator').body('type').isIn(['strength', 'cardio', 'flexibility', 'sports', 'custom']).withMessage('Invalid workout type'),
  require('express-validator').body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  require('express-validator').body('exercises').isArray({ min: 1 }).withMessage('At least one exercise is required')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { clientId } = req.params;
    const { title, type, scheduledDate, exercises, notes } = req.body;
    
    // Verify access
    const client = await User.findOne({
      _id: clientId,
      'subscription.mentorId': req.user._id,
      role: 'student'
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }
    
    // Create workout plan
    const workout = new Workout({
      user: clientId,
      mentor: req.user._id,
      title,
      type,
      exercises,
      scheduledDate: new Date(scheduledDate),
      duration: {
        planned: exercises.reduce((total, ex) => total + (ex.duration || 30), 0)
      },
      notes,
      status: 'scheduled'
    });
    
    await workout.save();
    
    res.status(201).json({
      message: 'Workout plan created successfully',
      workout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mentor schedule
router.get('/schedule', authenticate, requireMentorOrAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    
    // Get all bookings/sessions for this mentor (mock implementation)
    // In production, would query Booking model
    const schedule = [
      { time: '9:00 AM', type: 'strategy_call', client: 'Rahul Mehta', status: 'confirmed' },
      { time: '10:00 AM', type: 'check_in', client: 'Priya Sharma', status: 'scheduled' },
      { time: '11:00 AM', type: null, client: null, status: 'available' },
      { time: '12:00 PM', type: null, client: null, status: 'available' },
      { time: '3:00 PM', type: 'progress_review', client: 'Aryan Gupta', status: 'confirmed' },
      { time: '4:00 PM', type: null, client: null, status: 'available' },
      { time: '5:00 PM', type: 'consultation', client: 'Sneha Patel', status: 'scheduled' }
    ];
    
    res.json({
      date: targetDate.toISOString().split('T')[0],
      schedule,
      summary: {
        total: schedule.length,
        booked: schedule.filter(s => s.client).length,
        available: schedule.filter(s => !s.client).length,
        confirmed: schedule.filter(s => s.status === 'confirmed').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
