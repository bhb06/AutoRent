const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // ✅ This is what you're missing
const { protect } = require('../middleware/authMiddleware');

const {
  register,
  login,
  getMyProfile,
  updateUserProfile,
  getCurrentBookings,
  getBookingHistory
} = require('../controllers/authController');

// ✅ ROUTES
router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/me', protect, getMyProfile);
router.patch('/update-profile', protect, updateUserProfile);
router.get('/current-bookings', protect, getCurrentBookings);
router.get('/booking-history', protect, getBookingHistory);

// ✅ NEW LOGOUT ROUTE
router.post('/logout', protect, (req, res) => {
  // You could blacklist the token here if you're using a token blacklist DB
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
