const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SERVER_URL || 'http://localhost:5001'}/api/auth/google/callback`
);

// Initiate Google OAuth flow
router.get('/google/auth-url', (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'consent',
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Google OAuth callback
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Find or create user
    let user = await User.findOne({
      $or: [{ 'oauth.googleId': googleId }, { email }],
    });

    if (!user) {
      // Create new user from Google info
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);

      user = new User({
        username,
        email,
        password: 'oauth-user', // OAuth users don't have passwords
        role: 'student',
        oauth: {
          googleId,
          provider: 'google',
        },
        profile: {
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          avatar: picture,
          fitnessLevel: 'beginner',
          fitnessGoals: [],
        },
      });

      await user.save();
    } else if (!user.oauth?.googleId) {
      // Link Google to existing account
      user.oauth = {
        googleId,
        provider: 'google',
      };
      await user.save();
    }

    // Update last login
    user.activity.lastLogin = new Date();
    user.activity.loginCount += 1;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// Verify Google token (alternative method - direct token verification)
router.post('/google/verify', async (req, res) => {
  try {
    const { token: idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the token
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Find or create user
    let user = await User.findOne({
      $or: [{ 'oauth.googleId': googleId }, { email }],
    });

    if (!user) {
      // Create new user
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);

      user = new User({
        username,
        email,
        password: 'oauth-user',
        role: 'student',
        oauth: {
          googleId,
          provider: 'google',
        },
        profile: {
          firstName: name ? name.split(' ')[0] : '',
          lastName: name ? name.split(' ').slice(1).join(' ') : '',
          avatar: picture,
          fitnessLevel: 'beginner',
          fitnessGoals: [],
        },
      });

      await user.save();
    } else if (!user.oauth?.googleId) {
      user.oauth = {
        googleId,
        provider: 'google',
      };
      await user.save();
    }

    // Update last login
    user.activity.lastLogin = new Date();
    user.activity.loginCount += 1;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
