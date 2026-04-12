const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const helmetCsp = require('helmet-csp');
const http = require('http');
require('dotenv').config();

const connectDB = require('./database');
const { logger, stream, requestLogger, errorLogger } = require('./utils/logger');
const { cache, createRateLimiter } = require('./utils/cache');
const initializeSocketIO = require('./utils/socket');

// Import routes
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google-auth');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chats');
const workoutRoutes = require('./routes/workouts');
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');
const nutritionRoutes = require('./routes/nutrition');
const bookingRoutes = require('./routes/booking');
const mentorRoutes = require('./routes/mentor');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Custom CSP with more flexibility for development
app.use(helmetCsp({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", "ws:", "wss:"]
  }
}));

// Performance middleware
app.use(compression());

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
app.use(cors({
  origin: isDevelopment ? true : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream }));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
app.use('/api/auth', authLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const cacheStats = await cache.getStats();
    res.status(200).json({ 
      status: 'OK', 
      message: 'UNIFIT API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '3.0.0',
      cache: cacheStats,
      phase3: true
    });
  } catch (error) {
    res.status(200).json({ 
      status: 'OK', 
      message: 'UNIFIT API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '3.0.0',
      cache: null,
      phase3: true
    });
  }
});

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id || null
  });

  // Don't send error stack in production
  const errorResponse = {
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Initialize Socket.IO
const io = initializeSocketIO(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  logger.info(`🚀 UNIFIT Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔌 Socket.IO server initialized`);
  logger.info(`✅ Phase 3 features enabled`);
});

module.exports = app;
