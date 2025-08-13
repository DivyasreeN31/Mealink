const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env from config.env if present
const envPath = path.join(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const providedMongoUri = process.env.MONGO_URI;
const mongoUri = providedMongoUri && !/</.test(providedMongoUri)
  ? providedMongoUri
  : 'mongodb://127.0.0.1:27017/donation-app';

console.log('🔍 MongoDB URI:', mongoUri);
console.log('🔍 Environment MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
const donationRoutes = require('./routes/donations');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Test image endpoint
app.get('/api/test-image', (req, res) => {
  res.json({ 
    message: 'Image serving is working!',
    endpoints: {
      'GET /api/donations/image/:id': 'Serve donation image by ID',
      'POST /api/donations': 'Create donation with image upload'
    }
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.db.databaseName
  });
});

// Start server with automatic fallback if the port is busy
const DEFAULT_PORT = Number(process.env.PORT) || 8000;
const MAX_PORT_TRIES = 5;

function startServer(port, attempt = 1) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attempt < MAX_PORT_TRIES) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Trying port ${nextPort}... (${attempt}/${MAX_PORT_TRIES - 1})`);
      startServer(nextPort, attempt + 1);
    } else if (err && err.code === 'EADDRINUSE') {
      console.error(`All attempted ports are busy (tried ${MAX_PORT_TRIES} ports starting from ${DEFAULT_PORT}).`);
      process.exit(1);
    } else if (err) {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
