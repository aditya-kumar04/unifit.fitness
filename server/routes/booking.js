const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, requireMentorOrAdmin } = require('../middleware/auth');

// Booking/Scheduling model (using User schema for now, in production would have separate Booking model)
const createBookingSchema = () => {
  const mongoose = require('mongoose');
  const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['strategy_call', 'check_in', 'progress_review', 'consultation'],
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 30 }, // in minutes
    notes: { type: String, maxlength: 500 },
    meetingLink: { type: String },
    reminders: [{
      type: { type: String, enum: ['email', 'sms', 'push'] },
      sent: { type: Boolean, default: false },
      scheduledAt: { type: Date }
    }],
    payment: {
      status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
      amount: { type: Number },
      method: { type: String }
    }
  }, { timestamps: true });
  
  return mongoose.model('Booking', bookingSchema);
};

// Get mentor availability
router.get('/availability', authenticate, async (req, res) => {
  try {
    const { mentorId, month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth();
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    // Get mentor
    const mentor = await User.findById(mentorId || req.user.subscription?.mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    // Generate availability (in production, this would come from mentor's calendar)
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    const availability = [];
    
    // Generate available days (Monday to Friday, excluding weekends)
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(targetYear, targetMonth, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Skip past dates
      if (date < new Date().setHours(0,0,0,0)) continue;
      
      availability.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        available: Math.random() > 0.3, // 70% chance of being available
        timeSlots: [
          '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
          '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
        ]
      });
    }
    
    res.json({
      mentor: {
        id: mentor._id,
        name: `${mentor.profile.firstName || ''} ${mentor.profile.lastName || mentor.username}`.trim(),
        avatar: mentor.profile.avatar,
        specialties: mentor.profile.fitnessGoals || []
      },
      availability
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // For now, return mock data (in production, would query Booking model)
    const bookings = [
      {
        id: '1',
        mentor: {
          id: 'mentor123',
          name: 'Coach Arjun Singh',
          avatar: null
        },
        type: 'strategy_call',
        status: 'confirmed',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 30,
        notes: 'Initial strategy call to discuss goals and plan',
        meetingLink: 'https://meet.google.com/xxx-yyy-zzz'
      },
      {
        id: '2',
        mentor: {
          id: 'mentor123',
          name: 'Coach Arjun Singh',
          avatar: null
        },
        type: 'check_in',
        status: 'completed',
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        duration: 15,
        notes: 'Weekly check-in - progress review',
        meetingLink: null
      }
    ];
    
    // Filter by status if provided
    const filteredBookings = status 
      ? bookings.filter(b => b.status === status)
      : bookings;
    
    res.json({
      bookings: filteredBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredBookings.length,
        pages: Math.ceil(filteredBookings.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new booking
router.post('/book', authenticate, [
  body('mentorId').notEmpty().withMessage('Mentor ID is required'),
  body('type').isIn(['strategy_call', 'check_in', 'progress_review', 'consultation']).withMessage('Invalid booking type'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('duration').isInt({ min: 15, max: 120 }).withMessage('Duration must be between 15 and 120 minutes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { mentorId, type, scheduledDate, duration, notes } = req.body;
    
    // Validate mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    // Validate date (should be in the future)
    const bookingDate = new Date(scheduledDate);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ error: 'Booking date must be in the future' });
    }
    
    // Check for conflicts (in production, would check existing bookings)
    const hasConflict = false; // Simplified for now
    
    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    
    // Create booking (mock implementation)
    const booking = {
      id: Date.now().toString(),
      user: req.user._id,
      mentor: {
        id: mentor._id,
        name: `${mentor.profile.firstName || ''} ${mentor.profile.lastName || mentor.username}`.trim(),
        avatar: mentor.profile.avatar
      },
      type,
      status: 'scheduled',
      scheduledDate: bookingDate,
      duration: duration || 30,
      notes: notes || '',
      meetingLink: null,
      createdAt: new Date()
    };
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
router.put('/:bookingId', authenticate, [
  body('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { bookingId } = req.params;
    const { status, notes } = req.body;
    
    // Mock implementation - in production would update Booking model
    const booking = {
      id: bookingId,
      status: status || 'scheduled',
      notes: notes || '',
      updatedAt: new Date()
    };
    
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.delete('/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Mock implementation - in production would delete Booking model
    // Check if booking can be cancelled (e.g., not within 24 hours)
    const canCancel = true; // Simplified
    
    if (!canCancel) {
      return res.status(400).json({ error: 'Cannot cancel booking within 24 hours of scheduled time' });
    }
    
    res.json({
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking types and pricing
router.get('/booking-types', authenticate, async (req, res) => {
  try {
    const bookingTypes = [
      {
        id: 'strategy_call',
        name: 'Strategy Call',
        description: 'Initial consultation to discuss goals and create personalized plan',
        duration: 30,
        price: 0, // Free for subscribers
        features: ['Goal assessment', 'Plan creation', 'Q&A session']
      },
      {
        id: 'check_in',
        name: 'Weekly Check-in',
        description: 'Progress review and plan adjustments',
        duration: 15,
        price: 0,
        features: ['Progress review', 'Plan adjustments', 'Motivation boost']
      },
      {
        id: 'progress_review',
        name: 'Progress Review',
        description: 'Detailed analysis of progress and next steps',
        duration: 45,
        price: 0,
        features: ['Detailed analysis', 'Plan refinement', 'Goal setting']
      },
      {
        id: 'consultation',
        name: 'General Consultation',
        description: 'Discuss any fitness-related topics',
        duration: 30,
        price: 0,
        features: ['Open discussion', 'Advice', 'Problem solving']
      }
    ];
    
    res.json({ bookingTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mentor-specific endpoints
router.get('/mentor/schedule', authenticate, requireMentorOrAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Mock mentor schedule
    const schedule = [
      {
        time: '9:00 AM',
        booking: {
          id: '1',
          user: { name: 'Rahul Mehta', avatar: null },
          type: 'strategy_call',
          status: 'confirmed'
        }
      },
      {
        time: '10:00 AM',
        booking: null
      },
      {
        time: '11:00 AM',
        booking: {
          id: '2',
          user: { name: 'Priya Sharma', avatar: null },
          type: 'check_in',
          status: 'scheduled'
        }
      }
    ];
    
    res.json({
      date: targetDate.toISOString().split('T')[0],
      schedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
