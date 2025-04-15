const express = require('express');
const router = express.Router();
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar
} = require('../controllers/carController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', protect, isAdmin, createCar);
router.put('/:id', protect, isAdmin, updateCar);
router.delete('/:id', protect, isAdmin, deleteCar);

// Public routes
router.get('/', getAllCars);
router.get('/:id', getCarById);

module.exports = router;
