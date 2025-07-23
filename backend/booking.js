const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  flightNumber: String,
  origin: String,
  destination: String,
  departureTime: String,
  date: String,
  price: Number,
  bookedAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    name: String,
    email: String,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
