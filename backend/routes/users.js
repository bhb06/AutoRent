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

// ✅ Export the router (IMPORTANT!)
module.exports = router;
