const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  googleLocationLink: {
    type: String,
    required: false
  },
  openingTime: {
    type: String, // "08:00 AM"
    required: true
  },
  closingTime: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Branch', branchSchema);
