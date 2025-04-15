const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarGroup',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  dailyFee: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  availability: {
    type: Boolean,
    default: true
  },
  plateNumber: {
    type: String,
    unique: true,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
