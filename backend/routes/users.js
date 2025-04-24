const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Protect route middleware
const {
  updateUserProfile,  // Controller for updating user profile
  getCurrentBookings, // Controller to fetch active reservations
  getBookingHistory,  // Controller to fetch booking history
} = require('../controllers/authController');

// ✅ Get user profile (fetch)
router.get('/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user); // Send back user data
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

// ✅ Update user profile
router.patch('/update-profile', protect, updateUserProfile);

// ✅ Get current bookings (active reservations)
router.get('/current-bookings', protect, getCurrentBookings);

// ✅ Get booking history (completed/canceled reservations)
router.get('/booking-history', protect, getBookingHistory);

module.exports = router;
