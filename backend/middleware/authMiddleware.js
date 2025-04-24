const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect route: ensures that the user is logged in (JWT is valid)
const protect = async (req, res, next) => {
  let token;

  // Check if the token exists in the header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to req (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Proceed to the route

    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Checking if the account is user or admin
// Allow only **users** to save transactions, **admins** can complete payments or cancel transactions.
const isUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next(); // Allow the user to proceed
  } else {
    res.status(403).json({ message: 'Access denied: Users only' });
  }
};

// Checking if the account is **admin**
// Admins can **complete transactions**, **manage reservations**, etc.
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Admin is allowed to proceed
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

// Checking if the user is allowed to modify their own reservation or if they are admin
const isOwnerOrAdmin = (req, res, next) => {
  if (req.user._id.toString() === req.params.userId || req.user.role === 'admin') {
    next(); // Either user is the owner or is admin
  } else {
    res.status(403).json({ message: 'Access denied: You can only edit your own reservation or an admin can do it' });
  }
};

// Allow **users** to complete their own transaction and **admins** to complete any transaction
const canCompleteTransaction = (req, res, next) => {
  if (req.user.role === 'user' || req.user.role === 'admin') {
    next(); // Both users and admins can complete a transaction
  } else {
    res.status(403).json({ message: 'Access denied: Only users and admins can complete transactions' });
  }
};

module.exports = { protect, isAdmin, isUser, isOwnerOrAdmin, canCompleteTransaction };

// ✅ Get current bookings (active reservations)
exports.getCurrentBookings = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user._id,
      status: { $nin: ['completed', 'canceled'] }, // Only active reservations
    }).populate('selectedCars', 'brand model dailyFee')
      .populate('pickupBranch', 'name address phone')
      .populate('dropBranch', 'name address phone');

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current bookings', error: error.message });
  }
};

// ✅ Get booking history (completed or canceled reservations)
exports.getBookingHistory = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user._id,
      status: { $in: ['completed', 'canceled'] }, // Only completed or canceled reservations
    }).populate('selectedCars', 'brand model dailyFee')
      .populate('pickupBranch', 'name address phone')
      .populate('dropBranch', 'name address phone');

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking history', error: error.message });
  }
};

// ✅ Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, phone, age } = req.body;

    // Find the user by their ID (from the token)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user info
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.age = age || user.age;

    // Save updated user info
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
