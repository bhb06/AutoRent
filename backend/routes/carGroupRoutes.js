const express = require('express');
const router = express.Router();
const {
  createCarGroup,
  getAllCarGroups,
  getCarGroupById,
  updateCarGroup,
  deleteCarGroup
} = require('../controllers/carGroupController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', protect, isAdmin, createCarGroup);
router.put('/:id', protect, isAdmin, updateCarGroup);
router.delete('/:id', protect, isAdmin, deleteCarGroup);

// Public routes
router.get('/', getAllCarGroups);
router.get('/:id', getCarGroupById);

module.exports = router;
