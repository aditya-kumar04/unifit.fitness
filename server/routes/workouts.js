const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Workout = require('../models/Workout');
const User = require('../models/User');
const { authenticate, requireMentorOrAdmin } = require('../middleware/auth');

// Get daily workouts for a user
router.get('/daily', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const workouts = await Workout.find({
      user: req.user._id,
      scheduledDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['scheduled', 'in_progress'] }
    })
    .populate('mentor', 'username profile.firstName profile.lastName')
    .sort({ scheduledDate: 1 });

    // Transform to frontend format
    const formattedWorkouts = workouts.map(workout => ({
      id: workout._id,
      title: workout.title,
      type: workout.type,
      exercises: workout.exercises.map((exerciseSet, index) => ({
        id: index,
        label: `${exerciseSet.exercise.name} · ${exerciseSet.sets.length} × ${exerciseSet.sets[0]?.reps || 'N/A'}`,
        tag: exerciseSet.exercise.muscleGroup,
        done: exerciseSet.sets.every(set => set.completed),
        exerciseData: exerciseSet
      })),
      scheduledDate: workout.scheduledDate,
      status: workout.status,
      mentor: workout.mentor
    }));

    res.json({
      workouts: formattedWorkouts,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark exercise as complete
router.put('/:workoutId/exercises/:exerciseIndex/complete', authenticate, async (req, res) => {
  try {
    const { workoutId, exerciseIndex } = req.params;
    const { completed = true } = req.body;

    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (exerciseIndex < 0 || exerciseIndex >= workout.exercises.length) {
      return res.status(400).json({ error: 'Invalid exercise index' });
    }

    // Mark all sets in the exercise as completed
    workout.exercises[exerciseIndex].sets.forEach(set => {
      set.completed = completed;
    });

    // Check if all exercises are completed
    const allExercisesCompleted = workout.exercises.every(exerciseSet =>
      exerciseSet.sets.every(set => set.completed)
    );

    if (allExercisesCompleted) {
      workout.status = 'completed';
      workout.completedDate = new Date();
      
      // Update user progress
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'progress.workoutsCompleted': 1 },
        $set: { 'progress.lastWorkoutDate': new Date() }
      });
    }

    await workout.save();

    res.json({
      message: 'Exercise updated successfully',
      workoutStatus: workout.status,
      exerciseCompleted: completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workout history
router.get('/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const workouts = await Workout.find({
      user: req.user._id,
      status: 'completed'
    })
    .populate('mentor', 'username profile.firstName profile.lastName')
    .sort({ completedDate: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Workout.countDocuments({
      user: req.user._id,
      status: 'completed'
    });

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

// Create new workout
router.post('/', authenticate, [
  body('title').notEmpty().trim().withMessage('Workout title is required'),
  body('type').isIn(['strength', 'cardio', 'flexibility', 'sports', 'custom']).withMessage('Invalid workout type'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('duration.planned').isNumeric().withMessage('Planned duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workoutData = {
      ...req.body,
      user: req.user._id,
      status: 'scheduled'
    };

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update workout
router.put('/:workoutId', authenticate, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.workoutId,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Don't allow updating completed workouts
    if (workout.status === 'completed') {
      return res.status(400).json({ error: 'Cannot update completed workout' });
    }

    Object.assign(workout, req.body);
    await workout.save();

    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workout statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get workout stats for different time periods
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayWorkouts, weekWorkouts, monthWorkouts, totalWorkouts] = await Promise.all([
      Workout.countDocuments({
        user: userId,
        completedDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
      }),
      Workout.countDocuments({
        user: userId,
        completedDate: { $gte: weekAgo }
      }),
      Workout.countDocuments({
        user: userId,
        completedDate: { $gte: monthAgo }
      }),
      Workout.countDocuments({
        user: userId,
        status: 'completed'
      })
    ]);

    // Get workout types distribution
    const workoutTypes = await Workout.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      today: todayWorkouts,
      thisWeek: weekWorkouts,
      thisMonth: monthWorkouts,
      total: totalWorkouts,
      byType: workoutTypes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
