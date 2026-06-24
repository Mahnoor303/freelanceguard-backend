const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAllRead,
} = require('../controllers/userNotificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-read', markAllRead);

module.exports = router;