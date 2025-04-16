const express = require('express');
const router = express.Router();
const {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
  markCouponAsUsed
} = require('../controllers/couponController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Admin
router.post('/', protect, isAdmin, createCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);
router.get('/', protect, isAdmin, getAllCoupons);

// User
router.get('/validate/:code', protect, validateCoupon);
router.put('/use', protect, markCouponAsUsed);

module.exports = router;
