const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },
  oauth: {
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ['google'], default: null }
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    college: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    fitnessGoals: [{ type: String }],
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'mentored'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: { type: Date },
    endDate: { type: Date },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  progress: {
    workoutsCompleted: { type: Number, default: 0 },
    totalWorkoutTime: { type: Number, default: 0 }, // in minutes
    streak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    achievements: [{ type: String }],
    weight: [{ 
      value: Number, 
      date: Date, 
      unit: { type: String, default: 'kg' },
      bodyFat: Number,
      muscleMass: Number,
      notes: String
    }],
    measurements: [{
      type: String, // chest, arms, waist, etc.
      value: Number,
      date: Date,
      unit: { type: String, default: 'cm' },
      notes: String
    }],
    photos: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      originalName: { type: String },
      type: { type: String, enum: ['front', 'side', 'back', 'flex', 'progress'], default: 'progress' },
      week: { type: Number, min: 1, max: 52 },
      date: { type: Date, default: Date.now },
      size: Number,
      dimensions: Object
    }],
    goals: {
      targetWeight: Number,
      targetBodyFat: Number,
      targetDate: Date,
      weeklyGoal: { type: String, enum: ['weight_loss', 'muscle_gain', 'maintenance'], default: 'maintenance' },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  activity: {
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    accountCreated: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    banExpires: { type: Date }
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    workoutReminders: { type: Boolean, default: true },
    mentorMessages: { type: Boolean, default: true }
  },
  nutrition: {
    meals: [{
      name: { type: String, required: true },
      cal: { type: Number, required: true },
      p: { type: Number, required: true }, // protein
      c: { type: Number, required: true }, // carbs
      f: { type: Number, required: true }, // fat
      type: { type: String, enum: ['custom', 'searched', 'quick'], default: 'custom' },
      date: { type: Date, default: Date.now }
    }],
    waterIntake: [{
      date: { type: Date, default: Date.now },
      glass: { type: Number, min: 1, max: 20 }
    }],
    goals: {
      cal: { type: Number, default: 2000 },
      p: { type: Number, default: 150 },
      c: { type: Number, default: 250 },
      f: { type: Number, default: 65 }
    }
  },
  mentorNotes: [{
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'progress', 'concern', 'achievement'], default: 'general' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentorName: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide password in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
