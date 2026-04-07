const express = require('express');
const router = express.Router();
const { authenticate, requireMentorOrAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Chat = require('../models/Chat');
const { cacheMiddleware } = require('../utils/cache');

// Get comprehensive analytics dashboard
router.get('/dashboard', authenticate, requireMentorOrAdmin, cacheMiddleware(
  (req) => `analytics:dashboard:${req.user._id}:${req.query.period || 'month'}`,
  300 // 5 minutes cache
), async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const mentorId = req.user._id;
    
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
    
    // Get all clients for this mentor
    const clients = await User.find({
      'subscription.mentorId': mentorId,
      role: 'student'
    }).select('username profile progress activity');
    
    const clientIds = clients.map(c => c._id);
    
    // Client metrics
    const clientMetrics = await Promise.all(clients.map(async (client) => {
      const workoutsCompleted = await Workout.countDocuments({
        user: client._id,
        completedDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      });
      
      const weightHistory = client.progress?.weight || [];
      const recentWeight = weightHistory.filter(w => new Date(w.date) >= startDate);
      const weightChange = recentWeight.length >= 2 
        ? recentWeight[recentWeight.length - 1].value - recentWeight[0].value 
        : 0;
      
      const photos = client.progress?.photos || [];
      const recentPhotos = photos.filter(p => new Date(p.date) >= startDate);
      
      const chatActivity = await Chat.aggregate([
        { $match: { 'participants.user': client._id } },
        { $unwind: '$messages' },
        { $match: { 'messages.createdAt': { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, messagesSent: { $sum: 1 } } }
      ]);
      
      return {
        clientId: client._id,
        username: client.username,
        profile: client.profile,
        metrics: {
          workoutsCompleted,
          weightChange,
          photosUploaded: recentPhotos.length,
          messagesSent: chatActivity[0]?.messagesSent || 0,
          streak: client.progress?.streak || 0,
          lastLogin: client.activity?.lastLogin,
          isOnline: client.activity?.isOnline
        }
      };
    }));
    
    // Overall analytics
    const totalWorkouts = await Workout.countDocuments({
      user: { $in: clientIds },
      completedDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });
    
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
        workoutsByType: { $push: '$type' },
        avgCaloriesBurned: { $avg: '$metrics.caloriesBurned' }
      }}
    ]);
    
    // Client engagement metrics
    const activeClients = clientMetrics.filter(c => c.metrics.workoutsCompleted > 0).length;
    const clientsWithPhotos = clientMetrics.filter(c => c.metrics.photosUploaded > 0).length;
    const clientsWithWeightLoss = clientMetrics.filter(c => c.metrics.weightChange < 0).length;
    
    // Chat analytics
    const chatAnalytics = await Chat.aggregate([
      { $match: { 'participants.user': { $in: clientIds } } },
      { $unwind: '$messages' },
      { $match: { 'messages.createdAt': { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        avgMessagesPerClient: { $avg: 1 }
      }}
    ]);
    
    // Progress analytics
    const progressAnalytics = {
      totalWeightLost: clientMetrics.reduce((sum, c) => sum + Math.min(0, c.metrics.weightChange), 0),
      avgWeightChange: clientMetrics.reduce((sum, c) => sum + c.metrics.weightChange, 0) / clientMetrics.length,
      totalPhotosUploaded: clientMetrics.reduce((sum, c) => sum + c.metrics.photosUploaded, 0),
      avgStreak: clientMetrics.reduce((sum, c) => sum + c.metrics.streak, 0) / clientMetrics.length
    };
    
    // Performance trends (weekly breakdown)
    const weeklyTrends = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(endDate.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(endDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekWorkouts = await Workout.countDocuments({
        user: { $in: clientIds },
        completedDate: { $gte: weekStart, $lt: weekEnd },
        status: 'completed'
      });
      
      weeklyTrends.unshift({
        week: i + 1,
        workouts: weekWorkouts,
        startDate: weekStart,
        endDate: weekEnd
      });
    }
    
    // Client performance distribution
    const performanceDistribution = {
      excellent: clientMetrics.filter(c => c.metrics.workoutsCompleted >= 20).length,
      good: clientMetrics.filter(c => c.metrics.workoutsCompleted >= 10 && c.metrics.workoutsCompleted < 20).length,
      average: clientMetrics.filter(c => c.metrics.workoutsCompleted >= 5 && c.metrics.workoutsCompleted < 10).length,
      needsAttention: clientMetrics.filter(c => c.metrics.workoutsCompleted < 5).length
    };
    
    res.json({
      period,
      summary: {
        totalClients: clients.length,
        activeClients,
        engagementRate: clients.length > 0 ? (activeClients / clients.length * 100).toFixed(1) : 0,
        totalWorkouts,
        avgWorkoutsPerClient: clients.length > 0 ? (totalWorkouts / clients.length).toFixed(1) : 0
      },
      clientMetrics,
      workoutAnalytics: workoutAnalytics[0] || {
        totalWorkouts: 0,
        totalMinutes: 0,
        avgDuration: 0,
        workoutsByType: [],
        avgCaloriesBurned: 0
      },
      chatAnalytics: chatAnalytics[0] || {
        totalMessages: 0,
        avgMessagesPerClient: 0
      },
      progressAnalytics,
      weeklyTrends,
      performanceDistribution,
      clientBreakdown: {
        withPhotos: clientsWithPhotos,
        withWeightLoss: clientsWithWeightLoss,
        onlineNow: clientMetrics.filter(c => c.metrics.isOnline).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client performance comparison
router.get('/client-comparison', authenticate, requireMentorOrAdmin, cacheMiddleware(
  (req) => `analytics:comparison:${req.user._id}:${JSON.stringify(req.query.clientIds)}`,
  600 // 10 minutes cache
), async (req, res) => {
  try {
    const { clientIds, period = 'month' } = req.query;
    
    if (!clientIds || !Array.isArray(clientIds)) {
      return res.status(400).json({ error: 'Client IDs array is required' });
    }
    
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
    }
    
    const clients = await User.find({
      _id: { $in: clientIds },
      'subscription.mentorId': req.user._id,
      role: 'student'
    }).select('username profile progress activity');
    
    const comparisonData = await Promise.all(clients.map(async (client) => {
      const workouts = await Workout.find({
        user: client._id,
        completedDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }).sort({ completedDate: 1 });
      
      const weightHistory = client.progress?.weight || [];
      const recentWeight = weightHistory.filter(w => new Date(w.date) >= startDate);
      
      const photos = client.progress?.photos || [];
      const recentPhotos = photos.filter(p => new Date(p.date) >= startDate);
      
      // Calculate performance score
      let performanceScore = 0;
      if (workouts.length >= 20) performanceScore += 40;
      else if (workouts.length >= 10) performanceScore += 25;
      else if (workouts.length >= 5) performanceScore += 10;
      
      if (recentWeight.length >= 2) {
        const weightChange = recentWeight[recentWeight.length - 1].value - recentWeight[0].value;
        if (weightChange < -2) performanceScore += 30;
        else if (weightChange < 0) performanceScore += 20;
      }
      
      if (recentPhotos.length >= 4) performanceScore += 20;
      else if (recentPhotos.length >= 2) performanceScore += 10;
      
      if (client.progress?.streak >= 7) performanceScore += 10;
      
      return {
        clientId: client._id,
        username: client.username,
        profile: client.profile,
        metrics: {
          workoutsCompleted: workouts.length,
          totalMinutes: workouts.reduce((sum, w) => sum + (w.duration?.actual || 0), 0),
          avgWorkoutDuration: workouts.length > 0 ? workouts.reduce((sum, w) => sum + (w.duration?.actual || 0), 0) / workouts.length : 0,
          weightChange: recentWeight.length >= 2 ? recentWeight[recentWeight.length - 1].value - recentWeight[0].value : 0,
          photosUploaded: recentPhotos.length,
          streak: client.progress?.streak || 0,
          performanceScore: Math.min(100, performanceScore),
          lastLogin: client.activity?.lastLogin,
          isOnline: client.activity?.isOnline
        },
        weeklyProgress: workouts.reduce((acc, workout) => {
          const week = Math.floor((new Date(endDate) - new Date(workout.completedDate)) / (7 * 24 * 60 * 60 * 1000));
          acc[week] = (acc[week] || 0) + 1;
          return acc;
        }, {})
      };
    }));
    
    // Sort by performance score
    comparisonData.sort((a, b) => b.metrics.performanceScore - a.metrics.performanceScore);
    
    res.json({
      period,
      comparisonData,
      rankings: {
        mostWorkouts: [...comparisonData].sort((a, b) => b.metrics.workoutsCompleted - a.metrics.workoutsCompleted),
        bestStreak: [...comparisonData].sort((a, b) => b.metrics.streak - a.metrics.streak),
        mostPhotos: [...comparisonData].sort((a, b) => b.metrics.photosUploaded - a.metrics.photosUploaded),
        highestScore: comparisonData
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system-wide analytics (admin only)
router.get('/system', authenticate, cacheMiddleware(
  (req) => `analytics:system:${req.query.period || 'month'}`,
  300
), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
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
    
    // User metrics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      'activity.accountCreated': { $gte: startDate, $lte: endDate }
    });
    const activeUsers = await User.countDocuments({
      'activity.lastLogin': { $gte: startDate, $lte: endDate }
    });
    const onlineUsers = await User.countDocuments({ 'activity.isOnline': true });
    
    // Role breakdown
    const roleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Workout metrics
    const totalWorkouts = await Workout.countDocuments({
      completedDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });
    
    const workoutAnalytics = await Workout.aggregate([
      { $match: { 
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
    
    // Chat metrics
    const totalChats = await Chat.countDocuments({
      'metadata.lastActivity': { $gte: startDate, $lte: endDate }
    });
    
    const messageAnalytics = await Chat.aggregate([
      { $match: { 'metadata.lastActivity': { $gte: startDate, $lte: endDate } } },
      { $unwind: '$messages' },
      { $match: { 'messages.createdAt': { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        avgMessagesPerChat: { $avg: 1 }
      }}
    ]);
    
    // Growth metrics
    const userGrowth = await User.aggregate([
      { $match: { 'activity.accountCreated': { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$activity.accountCreated' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      period,
      userMetrics: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        online: onlineUsers,
        roleBreakdown: roleBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      workoutMetrics: workoutAnalytics[0] || {
        totalWorkouts: 0,
        totalMinutes: 0,
        avgDuration: 0,
        workoutsByType: []
      },
      chatMetrics: {
        totalChats,
        totalMessages: messageAnalytics[0]?.totalMessages || 0,
        avgMessagesPerChat: messageAnalytics[0]?.avgMessagesPerChat || 0
      },
      growthMetrics: {
        userGrowth,
        growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
