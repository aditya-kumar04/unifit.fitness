const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get user streak information
router.get('/streak', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress.streak progress.lastWorkoutDate activity.lastLogin');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate current streak if not set
    let streak = user.progress.streak || 0;
    const lastWorkoutDate = user.progress.lastWorkoutDate;
    const today = new Date();
    
    if (lastWorkoutDate) {
      const daysSinceLastWorkout = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24));
      
      // If last workout was yesterday, streak is maintained
      if (daysSinceLastWorkout === 1) {
        streak = streak;
      }
      // If last workout was today, streak is maintained
      else if (daysSinceLastWorkout === 0) {
        streak = streak;
      }
      // If more than 1 day ago, streak is broken
      else if (daysSinceLastWorkout > 1) {
        streak = 0;
        // Update user's streak in database
        await User.findByIdAndUpdate(req.user._id, {
          'progress.streak': 0
        });
      }
    }

    res.json({
      currentStreak: streak,
      lastWorkoutDate: user.progress.lastWorkoutDate,
      lastLogin: user.activity.lastLogin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress.workoutsCompleted progress.totalWorkoutTime progress.streak progress.weight progress.measurements activity.loginCount activity.accountCreated')
      .populate('subscription.mentorId', 'username profile.firstName profile.lastName');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate additional stats
    const accountAge = Math.floor((new Date() - user.activity.accountCreated) / (1000 * 60 * 60 * 24));
    const avgWorkoutsPerWeek = accountAge > 0 ? (user.progress.workoutsCompleted / (accountAge / 7)).toFixed(1) : 0;

    // Get weight trend
    const weightHistory = user.progress.weight || [];
    const weightTrend = weightHistory.length >= 2 
      ? weightHistory[weightHistory.length - 1].value - weightHistory[0].value 
      : 0;

    res.json({
      workoutsCompleted: user.progress.workoutsCompleted,
      totalWorkoutTime: user.progress.totalWorkoutTime,
      currentStreak: user.progress.streak,
      loginCount: user.activity.loginCount,
      accountAgeDays: accountAge,
      avgWorkoutsPerWeek: parseFloat(avgWorkoutsPerWeek),
      weightHistory: weightHistory.slice(-10), // Last 10 entries
      currentWeight: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null,
      weightTrend,
      measurements: user.progress.measurements.slice(-5), // Last 5 measurements
      subscription: user.subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { notifications, profile } = req.body;
    const updateData = {};

    if (notifications) {
      updateData.notifications = { ...req.user.notifications, ...notifications };
    }

    if (profile) {
      updateData.profile = { ...req.user.profile, ...profile };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Settings updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update online status
router.put('/online-status', authenticate, async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      'activity.isOnline': isOnline,
      ...(isOnline && { 'activity.lastLogin': new Date() })
    });

    res.json({ message: 'Online status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
