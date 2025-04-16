const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  dropBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },  
  pickupDate: {
    type: Date,
    required: true
  },
  dropDate: {
    type: Date,
    required: true
  },
  selectedCars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  }],
  services: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['reserved', 'canceled', 'completed'],
    default: 'reserved'
  },  
  totalPrice: {
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
