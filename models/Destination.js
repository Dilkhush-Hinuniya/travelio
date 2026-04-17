const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  region: { type: String },
  category: { type: String, required: true },
  duration: { type: String },
  bestTime: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  amenities: [{ type: String }],
  tags: [{ type: String }],
  image: { type: String },
  views: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  mood: [{ type: String }],
  hiddenGem: { type: Boolean, default: false },
  gemTags: [{ type: String }],
  crowdLevel: { type: String },
  costIndicator: { type: String },
  weather: {
    temp: String,
    condition: String,
    icon: String,
    bestMonths: [Number],
    avoidMonths: [Number],
    avoidReason: String
  },
  localExperiences: [{
    name: String,
    price: Number,
    duration: String,
    icon: String
  }],
  coordinates: {
    type: [Number], // [latitude, longitude]
    index: '2dsphere'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Destination', destinationSchema);
