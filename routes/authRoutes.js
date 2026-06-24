const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const User = require('../models/User');

// Public
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected
router.get('/me', protect, getMe);

router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.freelanceNiche = req.body.freelanceNiche || user.freelanceNiche;
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      freelanceNiche: user.freelanceNiche,
      avatar: user.avatar,
      totalScans: user.totalScans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;