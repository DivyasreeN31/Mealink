const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const firebaseUid = req.header('X-Firebase-UID');
    console.log('Auth middleware - Firebase UID:', firebaseUid);

    if (!firebaseUid) {
      console.log('Auth middleware - No Firebase UID provided');
      return res.status(401).json({ error: 'Access denied. No Firebase UID provided.' });
    }

    const user = await User.findOne({ firebaseUid }).select('-password');
    console.log('Auth middleware - Found user:', user ? user._id : 'NOT FOUND');

    if (!user) {
      console.log('Auth middleware - User not found for Firebase UID:', firebaseUid);
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    console.log('Auth middleware - User authenticated:', user._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed.' });
  }
};

module.exports = auth;