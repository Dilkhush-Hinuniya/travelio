const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed in a real app
  phone: { type: String },
  bio: { type: String },
  preferences: [{ type: String }],
  isAdmin: { type: Boolean, default: false },
  gamification: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
