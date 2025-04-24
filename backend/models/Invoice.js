const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['saved', 'paid', 'canceled'], // Possible status values
    default: 'saved'
  },
  quotationRequested: {
    type: Boolean,
    default: false
  },
  couponCode: {
    type: String,
    default: null
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
