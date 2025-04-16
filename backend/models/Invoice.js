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
    enum: ['cash', 'card', 'online', 'paypal'],
    default: 'cash'
  },
  paid: {
    type: Boolean,
    default: false
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
