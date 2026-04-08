const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/progress');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `progress-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Enhanced progress photo upload
router.post('/photos', authenticate, upload.single('photo'), [
  body('photoType').optional().isIn(['front', 'side', 'back', 'flex', 'progress']).withMessage('Invalid photo type'),
  body('week').optional().isInt({ min: 1, max: 52 }).withMessage('Week must be between 1 and 52')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }
    
    const { photoType = 'progress', week } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.progress) {
      user.progress = {};
    }
    
    // Add photo to progress photos array
    const photoEntry = {
      url: `/uploads/progress/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      type: photoType,
      week: week ? parseInt(week) : null,
      date: new Date(),
      size: req.file.size,
      dimensions: null // Would be processed with image library
    };
    
    if (!user.progress.photos) {
      user.progress.photos = [];
    }
    
    user.progress.photos.push(photoEntry);
    await user.save();
    
    res.status(201).json({
      message: 'Progress photo uploaded successfully',
      photo: photoEntry
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get progress photos
router.get('/photos', authenticate, async (req, res) => {
  try {
    const { type, week, limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id);
    let photos = user.progress?.photos || [];
    
    // Filter by type
    if (type) {
      photos = photos.filter(photo => photo.type === type);
    }
    
    // Filter by week
    if (week) {
      photos = photos.filter(photo => photo.week === parseInt(week));
    }
    
    // Sort by date (newest first)
    photos.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit results
    photos = photos.slice(0, parseInt(limit));
    
    res.json({
      photos,
      total: user.progress?.photos?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete progress photo
router.delete('/photos/:photoId', authenticate, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user.progress?.photos) {
      return res.status(404).json({ error: 'No photos found' });
    }
    
    const photoIndex = user.progress.photos.findIndex(photo => photo._id.toString() === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = user.progress.photos[photoIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from database
    user.progress.photos.splice(photoIndex, 1);
    await user.save();
    
    res.json({
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced weight tracking with body composition
router.post('/weight', authenticate, [
  body('value').isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500'),
  body('unit').optional().isIn(['kg', 'lbs']).withMessage('Unit must be kg or lbs'),
  body('bodyFat').optional().isFloat({ min: 0, max: 100 }).withMessage('Body fat must be between 0 and 100'),
  body('muscleMass').optional().isFloat({ min: 0, max: 500 }).withMessage('Muscle mass must be valid'),
  body('notes').optional().isLength({ max: 200 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { value, unit = 'kg', bodyFat, muscleMass, notes } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.progress) {
      user.progress = {};
    }
    
    // Add new weight entry
    const weightEntry = {
      value: parseFloat(value),
      unit,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      muscleMass: muscleMass ? parseFloat(muscleMass) : null,
      notes: notes || '',
      date: new Date()
    };
    
    if (!user.progress.weight) {
      user.progress.weight = [];
    }
    
    user.progress.weight.push(weightEntry);
    
    // Keep only last 100 entries
    if (user.progress.weight.length > 100) {
      user.progress.weight = user.progress.weight.slice(-100);
    }
    
    await user.save();
    
    res.status(201).json({
      message: 'Weight logged successfully',
      weightEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced measurements tracking
router.post('/measurements', authenticate, [
  body('type').notEmpty().withMessage('Measurement type is required'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be positive'),
  body('unit').optional().isIn(['cm', 'inches']).withMessage('Unit must be cm or inches'),
  body('notes').optional().isLength({ max: 200 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { type, value, unit = 'cm', notes } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.progress) {
      user.progress = {};
    }
    
    // Add new measurement
    const measurement = {
      type,
      value: parseFloat(value),
      unit,
      notes: notes || '',
      date: new Date()
    };
    
    if (!user.progress.measurements) {
      user.progress.measurements = [];
    }
    
    user.progress.measurements.push(measurement);
    
    // Keep only last 50 entries per type
    const sameTypeMeasurements = user.progress.measurements.filter(m => m.type === type);
    if (sameTypeMeasurements.length > 50) {
      // Remove oldest entries of this type
      const toRemove = sameTypeMeasurements.slice(0, -50);
      user.progress.measurements = user.progress.measurements.filter(m => 
        !toRemove.some(tr => tr.date.getTime() === m.date.getTime() && tr.type === m.type)
      );
    }
    
    await user.save();
    
    res.status(201).json({
      message: 'Measurement logged successfully',
      measurement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive progress analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const user = await User.findById(req.user._id);
    
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
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Filter data by period
    const weightHistory = (user.progress?.weight || []).filter(w => 
      new Date(w.date) >= startDate && new Date(w.date) <= endDate
    );
    
    const measurements = (user.progress?.measurements || []).filter(m => 
      new Date(m.date) >= startDate && new Date(m.date) <= endDate
    );
    
    const photos = (user.progress?.photos || []).filter(p => 
      new Date(p.date) >= startDate && new Date(p.date) <= endDate
    );
    
    // Calculate trends
    let weightTrend = null;
    if (weightHistory.length >= 2) {
      const startWeight = weightHistory[0].value;
      const endWeight = weightHistory[weightHistory.length - 1].value;
      weightTrend = {
        start: startWeight,
        current: endWeight,
        change: endWeight - startWeight,
        changePercent: ((endWeight - startWeight) / startWeight * 100).toFixed(2)
      };
    }
    
    // Calculate measurement trends by type
    const measurementTrends = {};
    const measurementsByType = {};
    measurements.forEach(m => {
      if (!measurementsByType[m.type]) {
        measurementsByType[m.type] = [];
      }
      measurementsByType[m.type].push(m);
    });
    
    Object.keys(measurementsByType).forEach(type => {
      const typeMeasurements = measurementsByType[type];
      if (typeMeasurements.length >= 2) {
        const startValue = typeMeasurements[0].value;
        const endValue = typeMeasurements[typeMeasurements.length - 1].value;
        measurementTrends[type] = {
          start: startValue,
          current: endValue,
          change: endValue - startValue,
          changePercent: startValue > 0 ? ((endValue - startValue) / startValue * 100).toFixed(2) : 0
        };
      }
    });
    
    // Progress score (0-100)
    let progressScore = 0;
    if (weightTrend && weightTrend.change < 0) {
      progressScore += Math.min(40, Math.abs(weightTrend.change) * 10);
    }
    if (photos.length > 0) {
      progressScore += Math.min(30, photos.length * 5);
    }
    if (Object.keys(measurementTrends).length > 0) {
      progressScore += Math.min(30, Object.keys(measurementTrends).length * 10);
    }
    
    res.json({
      period,
      progressScore: Math.round(progressScore),
      weight: {
        history: weightHistory,
        trend: weightTrend,
        current: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null
      },
      measurements: {
        history: measurements,
        trends: measurementTrends,
        byType: measurementsByType
      },
      photos: {
        count: photos.length,
        latest: photos.slice(-5), // Last 5 photos
        byType: photos.reduce((acc, photo) => {
          acc[photo.type] = (acc[photo.type] || 0) + 1;
          return acc;
        }, {})
      },
      achievements: user.progress?.achievements || [],
      streak: user.progress?.streak || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set progress goals
router.post('/goals', authenticate, [
  body('targetWeight').optional().isFloat({ min: 20, max: 500 }).withMessage('Target weight must be valid'),
  body('targetBodyFat').optional().isFloat({ min: 0, max: 100 }).withMessage('Target body fat must be valid'),
  body('targetDate').optional().isISO8601().withMessage('Target date must be valid'),
  body('weeklyGoal').optional().isIn(['weight_loss', 'muscle_gain', 'maintenance']).withMessage('Invalid weekly goal')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { targetWeight, targetBodyFat, targetDate, weeklyGoal } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.progress) {
      user.progress = {};
    }
    
    user.progress.goals = {
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : null,
      targetDate: targetDate ? new Date(targetDate) : null,
      weeklyGoal: weeklyGoal || 'maintenance',
      updatedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      message: 'Progress goals updated successfully',
      goals: user.progress.goals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress goals
router.get('/goals', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const goals = user.progress?.goals || {};
    
    // Calculate progress towards goals
    const currentWeight = user.progress?.weight?.length > 0 
      ? user.progress.weight[user.progress.weight.length - 1].value 
      : null;
    
    const goalProgress = {};
    if (goals.targetWeight && currentWeight) {
      const totalChange = goals.targetWeight - (user.progress?.weight?.[0]?.value || currentWeight);
      const currentChange = currentWeight - (user.progress?.weight?.[0]?.value || currentWeight);
      goalProgress.weightProgress = totalChange !== 0 ? (currentChange / totalChange * 100) : 0;
    }
    
    res.json({
      goals,
      progress: goalProgress,
      currentWeight
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
