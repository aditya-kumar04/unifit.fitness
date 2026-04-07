const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticate, requireMentorOrAdmin } = require('../middleware/auth');

// Get user's chats
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ 
      'participants.user': req.user._id 
    })
    .populate('participants.user', 'username profile.firstName profile.lastName avatar')
    .populate('messages.sender', 'username profile.firstName profile.lastName avatar')
    .sort({ 'metadata.lastActivity': -1 })
    .skip(skip)
    .limit(limit);

    const total = await Chat.countDocuments({ 
      'participants.user': req.user._id 
    });

    res.json({
      chats,
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

// Get specific chat
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id
    })
    .populate('participants.user', 'username profile.firstName profile.lastName avatar role')
    .populate('messages.sender', 'username profile.firstName profile.lastName avatar');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new chat
router.post('/', authenticate, [
  body('type').isIn(['mentorship', 'support', 'group', 'admin_student']),
  body('title').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('participants').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, title, description, participants } = req.body;

    // Validate participants
    const participantIds = participants.map(p => p.user);
    const validUsers = await User.find({ _id: { $in: participantIds } });
    
    if (validUsers.length !== participantIds.length) {
      return res.status(400).json({ error: 'Invalid participants' });
    }

    // Add current user as participant if not included
    const allParticipants = [
      { user: req.user._id, role: req.user.role },
      ...participants.filter(p => p.user.toString() !== req.user._id.toString())
    ];

    const chat = new Chat({
      participants: allParticipants,
      type,
      title,
      description,
      metadata: {
        totalMessages: 0,
        lastActivity: new Date()
      }
    });

    await chat.save();
    await chat.populate('participants.user', 'username profile.firstName profile.lastName avatar role');

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/:chatId/messages', authenticate, [
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('type').optional().isIn(['text', 'image', 'file', 'workout_plan', 'progress_update'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, type = 'text', fileUrl, fileName, fileSize } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = {
      sender: req.user._id,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      isRead: false,
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.metadata.totalMessages = chat.messages.length;
    chat.metadata.lastActivity = new Date();
    chat.metadata.lastMessage = chat.messages[chat.messages.length - 1]._id;

    await chat.save();
    await chat.populate('messages.sender', 'username profile.firstName profile.lastName avatar');

    res.status(201).json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Mark unread messages from other users as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString() && !message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
      }
    });

    // Update participant's last read time
    const participantIndex = chat.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );
    if (participantIndex !== -1) {
      chat.participants[participantIndex].lastRead = new Date();
    }

    await chat.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit message
router.put('/:chatId/messages/:messageId', authenticate, [
  body('content').trim().isLength({ min: 1, max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Can only edit your own messages' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await chat.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:chatId/messages/:messageId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender or admin
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();

    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave chat
router.post('/:chatId/leave', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user._id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const participantIndex = chat.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({ error: 'You are not a participant in this chat' });
    }

    if (!chat.participants[participantIndex].canLeave) {
      return res.status(403).json({ error: 'You cannot leave this chat' });
    }

    chat.participants.pull({ user: req.user._id });

    // If no participants left, archive the chat
    if (chat.participants.length === 0) {
      chat.status = 'archived';
    }

    await chat.save();

    res.json({ message: 'Left chat successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add participant to chat (mentor/admin only)
router.post('/:chatId/participants', authenticate, requireMentorOrAdmin, [
  body('userId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if user is already a participant
    const existingParticipant = chat.participants.find(
      p => p.user.toString() === userId
    );
    if (existingParticipant) {
      return res.status(400).json({ error: 'User is already a participant' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    chat.participants.push({
      user: userId,
      role: user.role,
      joinedAt: new Date()
    });

    await chat.save();
    await chat.populate('participants.user', 'username profile.firstName profile.lastName avatar role');

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
