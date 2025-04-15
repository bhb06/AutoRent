const mongoose = require('mongoose');

const carGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  engineSize: { type: Number, required: true },
  doors: { type: Number, required: true },
  passengers: { type: Number, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  gearbox: { type: String, enum: ['Manual', 'Automatic'], required: true },
  AC: { type: Boolean, default: true },
  electricWindows: { type: Boolean, default: true },
  images: { type: [String], default: [] },
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }] // ← this is new
}, { timestamps: true });

module.exports = mongoose.model('CarGroup', carGroupSchema);
