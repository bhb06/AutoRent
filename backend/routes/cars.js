const express = require('express');
const router = express.Router();

const {
    createCar,
    getAllCars,
    getCarById,
    updateCar,
    deleteCar,
    getCarByModel // Add this line
} = require('../controllers/carController');

const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Admin-only routes
router.post('/', protect, isAdmin, upload.single('image'), createCar);
router.put('/:id', protect, isAdmin, updateCar);
router.delete('/:id', protect, isAdmin, deleteCar);

// Public routes
router.get('/', getAllCars);
router.get('/:id', getCarById);

module.exports = router;