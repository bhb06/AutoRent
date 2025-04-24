const User = require('../models/User');
const Reservation = require('../models/Reservation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ User Registration
exports.register = async (req, res) => {
  try {
    console.log('📥 Register Payload:', req.body);
    console.log('📎 Uploaded File:', req.file || 'No file uploaded');

    const { username, email, password, phone, age, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists with this email.' });

    const profileImage = req.file
  ? `/images/users/${req.file.filename}`
  : undefined; // ✅ Let Mongoose apply the default


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      age,
      role: role || 'user',
      profileImage
    });

    await newUser.save();

    res.status(201).json({
      message: '✅ User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token: generateToken(newUser)
    });

  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ✅ User Login
exports.login = async (req, res) => {
  console.log('📩 Login Payload:', req.body);

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found with that email');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password did not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: generateToken(user)
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get own user profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// ✅ Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, phone, age } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.age = age || user.age;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// ✅ Get current bookings (active reservations)
exports.getCurrentBookings = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user._id,
      status: { $nin: ['completed', 'canceled'] }
    })
      .populate('selectedCars', 'brand model dailyFee')
      .populate('pickupBranch', 'name address phone')
      .populate('dropBranch', 'name address phone');

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current bookings', error: error.message });
  }
};

// ✅ Get booking history (completed or canceled)
exports.getBookingHistory = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user._id,
      status: { $in: ['completed', 'canceled'] }
    })
      .populate('selectedCars', 'brand model dailyFee')
      .populate('pickupBranch', 'name address phone')
      .populate('dropBranch', 'name address phone');

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking history', error: error.message });
  }
};
