const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const User = require('../models/User');
const Booking = require('../models/Booking');



// --- DESTINATIONS ---

// Get all destinations
router.get('/destinations', async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;
    
    const destinations = await Destination.find(filters).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single destination
router.get('/destinations/:id', async (req, res) => {
  try {
    const destination = await Destination.findOne({ id: req.params.id });
    if (!destination) return res.status(404).json({ error: 'Destination not found' });
    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new destination
router.post('/destinations', async (req, res) => {
  try {
    const newDestination = new Destination(req.body);
    await newDestination.save();
    res.status(201).json(newDestination);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update destination
router.put('/destinations/:id', async (req, res) => {
  try {
    const updated = await Destination.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Destination not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete destination
router.delete('/destinations/:id', async (req, res) => {
  try {
    const deleted = await Destination.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Destination not found' });
    res.json({ message: 'Destination deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- USERS ---

// Register / Create User
router.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); // plaintext password for demo purposes!
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Convert to simple object to drop passwords
    const userResponse = Object.assign({}, user.toJSON());
    delete userResponse.password;

    res.json({ message: 'Login successful', user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- BOOKINGS ---

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const filters = {};
    if (req.query.userEmail) filters.userEmail = req.query.userEmail;
    
    const bookings = await Booking.find(filters).sort({ timestamp: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
