const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path if your model is located elsewhere

// ✅ PATCH /api/users/update-profile-image
router.patch('/update-profile-image', async (req, res) => {
  try {
    const { userId, imagePath } = req.body;

    if (!userId || !imagePath) {
      return res.status(400).json({ msg: 'userId and imagePath are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.profileImage = imagePath;
    await user.save();

    res.json({
      msg: '✅ Profile image updated',
      profileImage: user.profileImage,
    });
  } catch (err) {
    res.status(500).json({
      msg: '❌ Error updating profile image',
      error: err.message,
    });
  }
});

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, phone, age, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Create a new user
    const newUser = new User({
      username,
      email,
      password, // Ensure you hash the password
      phone,
      age,
      role
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ✅ Export the router (IMPORTANT!)
module.exports = router;
