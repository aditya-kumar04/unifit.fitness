const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Initialize Socket.IO
const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);
    
    // Update user online status
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          'activity.isOnline': false,
          'activity.lastLogin': new Date()
        });
        
        // Notify mentor that user went offline
        if (socket.user.subscription?.mentorId) {
          socket.to(`mentor_${socket.user.subscription.mentorId}`).emit('user_status_change', {
            userId: socket.user._id,
            username: socket.user.username,
            isOnline: false
          });
        }
      } catch (error) {
        console.error('Error updating offline status:', error);
      }
    });

    // Set user online
    socket.on('connect', async () => {
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          'activity.isOnline': true,
          'activity.lastLogin': new Date()
        });

        // Join user's personal room
        socket.join(`user_${socket.user._id}`);
        
        // Join mentor room if assigned
        if (socket.user.subscription?.mentorId) {
          socket.join(`mentor_${socket.user.subscription.mentorId}`);
          
          // Notify mentor that user came online
          socket.to(`mentor_${socket.user.subscription.mentorId}`).emit('user_status_change', {
            userId: socket.user._id,
            username: socket.user.username,
            isOnline: true
          });
        }

        // Join role-based rooms
        socket.join(`role_${socket.user.role}`);

        // Send initial data
        socket.emit('connected', {
          userId: socket.user._id,
          username: socket.user.username,
          role: socket.user.role,
          mentorId: socket.user.subscription?.mentorId
        });
      } catch (error) {
        console.error('Error setting online status:', error);
      }
    });

    // Join chat room
    socket.on('join_chat', async (chatId) => {
      try {
        // Verify user has access to this chat
        const chat = await Chat.findOne({
          _id: chatId,
          'participants.user': socket.user._id
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        socket.join(`chat_${chatId}`);
        socket.currentChatId = chatId;

        // Notify others in chat that user is online
        socket.to(`chat_${chatId}`).emit('user_joined_chat', {
          userId: socket.user._id,
          username: socket.user.username
        });

        // Send current online users in chat
        const chatSockets = await io.in(`chat_${chatId}`).allSockets();
        const onlineUsers = [];
        for (const [socketId, socketData] of chatSockets) {
          if (socketData.user && socketData.user._id !== socket.user._id) {
            onlineUsers.push({
              userId: socketData.user._id,
              username: socketData.user.username
            });
          }
        }
        
        socket.emit('chat_online_users', onlineUsers);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('leave_chat', () => {
      if (socket.currentChatId) {
        socket.leave(`chat_${socket.currentChatId}`);
        socket.to(`chat_${socket.currentChatId}`).emit('user_left_chat', {
          userId: socket.user._id,
          username: socket.user.username
        });
        socket.currentChatId = null;
      }
    });

    // Send typing indicator
    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping: false
      });
    });

    // Handle real-time messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text' } = data;

        // Verify chat access
        const chat = await Chat.findOne({
          _id: chatId,
          'participants.user': socket.user._id
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Create message
        const message = {
          sender: socket.user._id,
          content: content.trim(),
          type,
          createdAt: new Date()
        };

        // Add message to chat
        chat.messages.push(message);
        chat.metadata.totalMessages = chat.messages.length;
        chat.metadata.lastActivity = new Date();
        await chat.save();

        // Populate sender info
        const populatedMessage = {
          ...message,
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            profile: socket.user.profile
          }
        };

        // Broadcast to all users in chat
        io.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: populatedMessage
        });

        // Send notification to offline users
        const offlineParticipants = chat.participants.filter(p => 
          p.user.toString() !== socket.user._id.toString()
        );

        for (const participant of offlineParticipants) {
          const userSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.user && s.user._id.toString() === participant.user.toString());
          
          if (!userSocket) {
            // User is offline, could send push notification here
            io.to(`user_${participant.user}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${socket.user.username}`,
              body: content.substring(0, 100),
              chatId,
              senderId: socket.user._id
            });
          }
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mentor-specific events
    if (socket.user.role === 'mentor') {
      // Mentor can monitor client activity
      socket.on('monitor_client', async (clientId) => {
        try {
          // Verify mentor has access to this client
          const client = await User.findOne({
            _id: clientId,
            'subscription.mentorId': socket.user._id
          });

          if (!client) {
            socket.emit('error', { message: 'Client not found or access denied' });
            return;
          }

          socket.join(`monitor_${clientId}`);
          socket.emit('monitoring_started', { clientId });
        } catch (error) {
          console.error('Error starting client monitoring:', error);
        }
      });

      socket.on('stop_monitoring_client', (clientId) => {
        socket.leave(`monitor_${clientId}`);
        socket.emit('monitoring_stopped', { clientId });
      });
    }

    // Admin events
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
      
      // Admin can monitor all activity
      socket.on('get_system_stats', async () => {
        try {
          const stats = {
            onlineUsers: io.engine.clientsCount,
            totalUsers: await User.countDocuments(),
            activeChats: await Chat.countDocuments({ status: 'active' }),
            newUsersToday: await User.countDocuments({
              'activity.accountCreated': { 
                $gte: new Date(new Date().setHours(0,0,0,0)) 
              }
            })
          };
          
          socket.emit('system_stats', stats);
        } catch (error) {
          console.error('Error getting system stats:', error);
        }
      });
    }

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.username}:`, error);
    });
  });

  return io;
};

module.exports = initializeSocketIO;
