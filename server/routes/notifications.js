const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { cache, cacheMiddleware, invalidateCache } = require('../utils/cache');

// Get user notifications
router.get('/', authenticate, cacheMiddleware(
  (req) => `notifications:${req.user._id}:${req.query.page || 1}`,
  60 // 1 minute cache
), async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;
    
    // For now, return mock data (in production, would query Notification model)
    const notifications = [
      {
        id: '1',
        type: 'workout_reminder',
        title: 'Workout Reminder',
        message: 'Time for your Upper Body workout today!',
        data: { workoutId: 'workout123' },
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'medium'
      },
      {
        id: '2',
        type: 'new_message',
        title: 'New Message from Coach Arjun',
        message: 'Great job on your workout today! Keep it up.',
        data: { chatId: 'chat123', senderId: 'mentor123' },
        read: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        priority: 'low'
      },
      {
        id: '3',
        type: 'progress_achievement',
        title: 'Achievement Unlocked!',
        message: 'You\'ve completed 10 workouts! Keep up the great work.',
        data: { achievement: '10_workouts', badge: 'bronze' },
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'high'
      }
    ];
    
    const filteredNotifications = unreadOnly 
      ? notifications.filter(n => !n.read)
      : notifications;
    
    const paginatedNotifications = filteredNotifications.slice(skip, skip + parseInt(limit));
    
    res.json({
      notifications: paginatedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredNotifications.length,
        unreadCount: notifications.filter(n => !n.read).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticate, invalidateCache(
  (req) => `notifications:${req.user._id}:*`
), async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Mock implementation - in production would update Notification model
    res.json({
      message: 'Notification marked as read',
      notificationId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, invalidateCache(
  (req) => `notifications:${req.user._id}:*`
), async (req, res) => {
  try {
    // Mock implementation
    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:notificationId', authenticate, invalidateCache(
  (req) => `notifications:${req.user._id}:*`
), async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Mock implementation
    res.json({
      message: 'Notification deleted',
      notificationId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification settings
router.get('/settings', authenticate, cacheMiddleware(
  (req) => `notifications:settings:${req.user._id}`,
  300 // 5 minutes cache
), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    
    const settings = {
      email: user.notifications?.email ?? true,
      push: user.notifications?.push ?? true,
      workoutReminders: user.notifications?.workoutReminders ?? true,
      mentorMessages: user.notifications?.mentorMessages ?? true,
      achievementAlerts: true,
      weeklyReports: true,
      systemUpdates: false
    };
    
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update notification settings
router.put('/settings', authenticate, invalidateCache([
  (req) => `notifications:settings:${req.user._id}`,
  (req) => `notifications:${req.user._id}:*`
]), async (req, res) => {
  try {
    const { email, push, workoutReminders, mentorMessages, achievementAlerts, weeklyReports, systemUpdates } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      'notifications.email': email,
      'notifications.push': push,
      'notifications.workoutReminders': workoutReminders,
      'notifications.mentorMessages': mentorMessages
    });
    
    res.json({
      message: 'Notification settings updated successfully',
      settings: {
        email,
        push,
        workoutReminders,
        mentorMessages,
        achievementAlerts,
        weeklyReports,
        systemUpdates
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification (internal use)
const createNotification = async (userId, notificationData) => {
  try {
    // In production, would save to Notification model
    const notification = {
      id: Date.now().toString(),
      userId,
      ...notificationData,
      createdAt: new Date(),
      read: false
    };
    
    // Invalidate cache for this user
    await cache.del(`notifications:${userId}:*`);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Send workout reminder notification
const sendWorkoutReminder = async (userId, workoutId) => {
  return await createNotification(userId, {
    type: 'workout_reminder',
    title: 'Workout Reminder',
    message: 'Time for your scheduled workout!',
    data: { workoutId },
    priority: 'medium'
  });
};

// Send achievement notification
const sendAchievementNotification = async (userId, achievement, badge) => {
  return await createNotification(userId, {
    type: 'progress_achievement',
    title: 'Achievement Unlocked!',
    message: `You've earned the ${achievement} badge!`,
    data: { achievement, badge },
    priority: 'high'
  });
};

// Send message notification
const sendMessageNotification = async (userId, senderName, chatId) => {
  return await createNotification(userId, {
    type: 'new_message',
    title: `New Message from ${senderName}`,
    message: 'You have a new message waiting for you.',
    data: { chatId },
    priority: 'low'
  });
};

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.sendWorkoutReminder = sendWorkoutReminder;
module.exports.sendAchievementNotification = sendAchievementNotification;
module.exports.sendMessageNotification = sendMessageNotification;
