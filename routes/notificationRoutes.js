const express = require('express');
const router = express.Router();
const {
  create,
  remove,
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminRead,
} = require('../controllers/notificationController');
const { adminProtect } = require('../middleware/adminMiddleware');

router.use(adminProtect);

// Manual send
router.post('/', create);

// List all admin notifications (auto + manual)
router.get('/', getAdminNotifications);

// Delete
router.delete('/:id', remove);

// Unread count
router.get('/unread-count', getAdminUnreadCount);

// Mark all read
router.patch('/mark-read', markAdminRead);

module.exports = router;