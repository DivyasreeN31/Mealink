const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register user (for Firebase auth)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('displayName').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, displayName, phone, address, firebaseUid, isGoogleUser } = req.body;
    console.log('Registering user:', { email, displayName, firebaseUid, isGoogleUser });

    // Check if user already exists by email or firebaseUid
    const existingUser = await User.findOne({
      $or: [
        { email },
        { firebaseUid: firebaseUid }
      ]
    });
    
    if (existingUser) {
      console.log('User already exists, updating Firebase UID if needed');
      // Update existing user with Firebase UID if needed
      if (firebaseUid && !existingUser.firebaseUid) {
        existingUser.firebaseUid = firebaseUid;
        await existingUser.save();
        console.log('Updated existing user with Firebase UID');
      }
      
      const userResponse = {
        _id: existingUser._id,
        firebaseUid: existingUser.firebaseUid,
        email: existingUser.email,
        displayName: existingUser.displayName,
        phone: existingUser.phone,
        address: existingUser.address,
        location: existingUser.location,
        notificationSettings: existingUser.notificationSettings,
        isGuest: existingUser.isGuest,
        createdAt: existingUser.createdAt
      };

      return res.status(200).json({
        message: 'User already exists',
        user: userResponse
      });
    }

    // Create new user
    const userData = {
      email,
      displayName,
      phone,
      address,
      firebaseUid
    };

    // Only add password if not a Google user
    if (!isGoogleUser && req.body.password) {
      userData.password = req.body.password;
    }

    console.log('Creating new user with data:', userData);
    const user = new User(userData);
    await user.save();
    console.log('New user created successfully:', user._id);

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      address: user.address,
      location: user.location,
      notificationSettings: user.notificationSettings,
      isGuest: user.isGuest,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration', details: error.message });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      address: user.address,
      location: user.location,
      notificationSettings: user.notificationSettings,
      isGuest: user.isGuest,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user by Firebase UID
router.get('/me/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      address: user.address,
      location: user.location,
      notificationSettings: user.notificationSettings,
      isGuest: user.isGuest,
      createdAt: user.createdAt
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, phone, address, location, notificationSettings } = req.body;

    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (location) updateData.location = location;
    if (notificationSettings) updateData.notificationSettings = notificationSettings;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router; 