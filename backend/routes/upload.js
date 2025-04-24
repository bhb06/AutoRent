const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // ✅ Import protect

const router = express.Router();

// === Setup multer storage ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.folder || 'default';
    const uploadPath = path.join(__dirname, '..', 'public', 'images', folder);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// === Protected POST route for uploading image and updating user ===
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const folder = req.query.folder || 'misc';
    const imagePath = `/images/${folder}/${req.file.filename}`;

    const userId = req.user._id; // ✅ Authenticated user's ID

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({
      msg: 'Image uploaded & profile updated',
      user: updatedUser
    });

  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
