const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  destId: { type: String },
  destName: { type: String },
  destLocation: { type: String },
  userEmail: { type: String, required: true }, // Reference to user
  userName: { type: String },
  userPhone: { type: String },
  travelers: { type: Number, default: 1 },
  checkIn: { type: String },
  checkOut: { type: String },
  nights: { type: Number, default: 1 },
  total: { type: Number, required: true },
  requests: { type: String },
  status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
