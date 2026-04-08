const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get weight history
router.get('/weight', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress.weight')
      .sort({ 'progress.weight.date': -1 });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      weightHistory: user.progress.weight || [],
      currentWeight: user.progress.weight.length > 0 
        ? user.progress.weight[user.progress.weight.length - 1] 
        : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log weight
router.post('/weight', authenticate, [
  require('express-validator').body('value')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500'),
  require('express-validator').body('unit')
    .optional()
    .isIn(['kg', 'lbs'])
    .withMessage('Unit must be kg or lbs')
], async (req, res) => {
  try {
    const { value, unit = 'kg' } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add new weight entry
    user.progress.weight.push({
      value,
      unit,
      date: new Date()
    });

    // Keep only last 100 entries
    if (user.progress.weight.length > 100) {
      user.progress.weight = user.progress.weight.slice(-100);
    }

    await user.save();

    res.status(201).json({
      message: 'Weight logged successfully',
      weightEntry: user.progress.weight[user.progress.weight.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall progress
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('progress.weight progress.measurements progress.workoutsCompleted progress.streak progress.totalWorkoutTime')
      .sort({ 'progress.weight.date': -1, 'progress.measurements.date': -1 });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate progress metrics
    const weightHistory = user.progress.weight || [];
    const measurements = user.progress.measurements || [];

    // Weight progress
    let weightProgress = null;
    if (weightHistory.length >= 2) {
      const startWeight = weightHistory[0].value;
      const currentWeight = weightHistory[weightHistory.length - 1].value;
      weightProgress = {
        start: startWeight,
        current: currentWeight,
        change: currentWeight - startWeight,
        changePercent: ((currentWeight - startWeight) / startWeight * 100).toFixed(1)
      };
    }

    // Latest measurements
    const latestMeasurements = {};
    measurements.forEach(measurement => {
      if (!latestMeasurements[measurement.type] || 
          new Date(measurement.date) > new Date(latestMeasurements[measurement.type].date)) {
        latestMeasurements[measurement.type] = measurement;
      }
    });

    res.json({
      weight: {
        history: weightHistory.slice(-30), // Last 30 entries
        progress: weightProgress,
        current: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null
      },
      measurements: {
        history: measurements.slice(-20), // Last 20 entries
        latest: latestMeasurements
      },
      stats: {
        workoutsCompleted: user.progress.workoutsCompleted,
        totalWorkoutTime: user.progress.totalWorkoutTime,
        currentStreak: user.progress.streak
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload progress photo
router.post('/photos', authenticate, async (req, res) => {
  try {
    // This is a placeholder for photo upload functionality
    // In a real implementation, you would use multer to handle file uploads
    // and store the file in cloud storage or local filesystem
    
    const { photoUrl, photoType = 'progress' } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add photo to progress photos array (you would need to add this field to the schema)
    const photoEntry = {
      url: photoUrl,
      type: photoType,
      date: new Date()
    };

    // For now, we'll simulate adding it to measurements as a photo entry
    user.progress.measurements.push({
      type: `photo_${photoType}`,
      value: photoUrl, // Storing URL as value for now
      date: new Date(),
      unit: 'url'
    });

    await user.save();

    res.status(201).json({
      message: 'Progress photo uploaded successfully',
      photo: photoEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
