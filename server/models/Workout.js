const mongoose = require('mongoose');

const exerciseSetSchema = new mongoose.Schema({
  exercise: {
    name: { type: String, required: true },
    muscleGroup: { type: String, required: true },
    instructions: [String],
  },
  sets: [{
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    duration: { type: Number }, // for timed exercises
    restTime: { type: Number, default: 60 }, // in seconds
    completed: { type: Boolean, default: false },
    notes: { type: String, maxlength: 200 }
  }],
  personalRecord: {
    weight: { type: Number },
    reps: { type: Number },
    date: { type: Date }
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  exercises: [exerciseSetSchema],
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: { type: Date },
  duration: {
    planned: { type: Number, required: true }, // in minutes
    actual: { type: Number } // in minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'skipped', 'cancelled'],
    default: 'scheduled'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard', 'very_hard'],
    default: 'moderate'
  },
  location: {
    type: String,
    enum: ['gym', 'home', 'outdoor', 'other'],
    default: 'gym'
  },
  equipment: [String],
  metrics: {
    caloriesBurned: { type: Number },
    heartRate: {
      avg: { type: Number },
      max: { type: Number },
      zones: { type: String }
    },
    rpe: { // Rate of Perceived Exertion
      type: Number,
      min: 1,
      max: 10
    }
  },
  feedback: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userNotes: { type: String, maxlength: 500 },
    mentorFeedback: { type: String, maxlength: 500 },
    mentorRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  tags: [String],
  isPublic: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Index for efficient queries
workoutSchema.index({ user: 1, scheduledDate: -1 });
workoutSchema.index({ mentor: 1, scheduledDate: -1 });
workoutSchema.index({ status: 1 });
workoutSchema.index({ type: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
