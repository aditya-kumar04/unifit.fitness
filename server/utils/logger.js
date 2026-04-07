const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'unifit-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream object for Morgan HTTP logger
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id || null
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id || null
  });
  
  next(err);
};

// Security event logging
const securityLogger = {
  logLogin: (userId, ip, userAgent, success) => {
    logger.info('Login Attempt', {
      userId,
      ip,
      userAgent,
      success,
      timestamp: new Date().toISOString()
    });
  },
  
  logFailedAuth: (ip, userAgent, reason) => {
    logger.warn('Failed Authentication', {
      ip,
      userAgent,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  logSuspiciousActivity: (userId, activity, details) => {
    logger.warn('Suspicious Activity', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  logBan: (userId, reason, duration) => {
    logger.info('User Banned', {
      userId,
      reason,
      duration,
      timestamp: new Date().toISOString()
    });
  }
};

// Business event logging
const businessLogger = {
  logWorkoutCompleted: (userId, workoutId, duration) => {
    logger.info('Workout Completed', {
      userId,
      workoutId,
      duration,
      timestamp: new Date().toISOString()
    });
  },
  
  logMealLogged: (userId, calories, protein) => {
    logger.info('Meal Logged', {
      userId,
      calories,
      protein,
      timestamp: new Date().toISOString()
    });
  },
  
  logProgressPhoto: (userId, photoType) => {
    logger.info('Progress Photo Uploaded', {
      userId,
      photoType,
      timestamp: new Date().toISOString()
    });
  },
  
  logBookingCreated: (userId, mentorId, bookingType) => {
    logger.info('Booking Created', {
      userId,
      mentorId,
      bookingType,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  stream,
  requestLogger,
  errorLogger,
  securityLogger,
  businessLogger
};
