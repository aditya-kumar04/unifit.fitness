const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (user.activity.isBanned && user.activity.banExpires > Date.now()) {
      return res.status(403).json({ 
        error: 'Account suspended', 
        reason: user.activity.banReason,
        expires: user.activity.banExpires
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Mentor or Admin role middleware
const requireMentorOrAdmin = (req, res, next) => {
  if (!['mentor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Mentor or Admin role required.' });
  }
  next();
};

// Resource owner or admin middleware
const requireOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
      return next();
    }
    res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
  };
};

module.exports = {
  authenticate,
  requireAdmin,
  requireMentorOrAdmin,
  requireOwnerOrAdmin
};
