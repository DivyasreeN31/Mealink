const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// POST: Submit donation with image (store image in MongoDB)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Received donation upload request');
    console.log('👤 User:', req.user?._id || 'No user (auth disabled for testing)');
    console.log('📋 Form data:', req.body);
    console.log('🖼️ File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

    const {
      title,
      category,
      description,
      quantity,
      latitude,
      longitude,
      address,
      contactEmail,
      contactPhone,
      isVeg,
      expiryDate,
      condition,
      providerName,
      providerId,
    } = req.body;

    const donationData = {
      title,
      category,
      description,
      quantity: quantity ? Number(quantity) : 1,
      providerName: req.user.displayName,
      providerId: req.user._id,
      contactInfo: {
        email: contactEmail || req.user.email || '',
        phone: contactPhone || '',
      },
      location: {
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        address: address || '',
      },
      isVeg: isVeg === 'true' || isVeg === true,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      condition: condition || '',
    };

    if (req.file) {
      donationData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      console.log('💾 Image stored in donation data:', {
        size: req.file.size,
        type: req.file.mimetype,
        originalName: req.file.originalname
      });
    } else {
      console.log('⚠️ No image file provided in donation upload');
    }

    console.log('📝 Saving donation to MongoDB...');
    const donation = new Donation(donationData);
    await donation.save();
    console.log('✅ Donation saved successfully with ID:', donation._id);

    res.status(201).json({ message: 'Donation saved successfully', donation });
  } catch (error) {
    console.error('❌ Error saving donation:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    res.status(500).json({ 
      error: 'Failed to save donation',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET: Retrieve all donations (excluding full image data for performance)
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find({}, '-image.data').sort({ createdAt: -1 });
    res.status(200).json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// GET: Retrieve a donation by ID (excluding image buffer)
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).select('-image.data');
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.status(200).json({ donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

// GET image by donation ID
router.get('/image/:id', async (req, res) => {
  try {
    console.log('🖼️ Image request for donation ID:', req.params.id);
    
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      console.log('❌ Donation not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    if (!donation.image || !donation.image.data) {
      console.log('❌ No image data found for donation ID:', req.params.id);
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set appropriate headers for image serving
    res.set({
      'Content-Type': donation.image.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Length': donation.image.data.length
    });
    
    console.log('✅ Serving image for donation ID:', req.params.id, 'Size:', donation.image.data.length, 'bytes');
    res.send(donation.image.data);
  } catch (error) {
    console.error('❌ Error serving image for donation ID:', req.params.id, error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

module.exports = router;
