const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'workout_plan', 'progress_update'],
    default: 'text'
  },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: { type: Date },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: { type: Date },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: { type: Date }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      required: true
    },
    joinedAt: { type: Date, default: Date.now },
    lastRead: { type: Date },
    isMuted: { type: Boolean, default: false },
    canLeave: { type: Boolean, default: true }
  }],
  type: {
    type: String,
    enum: ['mentorship', 'support', 'group', 'admin_student'],
    required: true
  },
  title: { type: String, trim: true },
  description: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed', 'suspended'],
    default: 'active'
  },
  messages: [messageSchema],
  metadata: {
    totalMessages: { type: Number, default: 0 },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastActivity: { type: Date, default: Date.now },
    responseTime: { type: Number }, // average response time in minutes
    satisfaction: { type: Number, min: 1, max: 5 }, // rating
    tags: [{ type: String }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  adminNotes: {
    notes: [{ 
      content: String, 
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    flags: [{
      type: { type: String, enum: ['warning', 'violation', 'praise', 'review'] },
      reason: String,
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    isMonitored: { type: Boolean, default: false },
    monitoringReason: { type: String }
  }
}, { timestamps: true });

// Index for efficient queries
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ 'metadata.lastActivity': -1 });
chatSchema.index({ status: 1 });
chatSchema.index({ type: 1 });

// Update metadata when messages are added
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.metadata.totalMessages = this.messages.length;
    this.metadata.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
