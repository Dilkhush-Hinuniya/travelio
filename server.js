require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelio';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger payloads for image base64 strings
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // Drop any old indexes (like firebaseUid) that are no longer in the schema
    const User = require('./models/User');
    await User.syncIndexes();
    console.log('✅ MongoDB indexes synced');
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Static files and Frontend
app.use(express.static(path.join(__dirname)));

// Serve User Panel
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'user.html'));
});

// Serve Admin Panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`👮 Admin interface on http://localhost:${PORT}/admin`);
});
