const Notification = require('../models/Notification');

// Get notifications for logged‑in user (broadcast + targeted)
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      isAdminNotif: false,   // only user‑facing notifications
      $or: [
        { targetUserId: req.user._id },
        { targetUserId: null },   // broadcast
      ],
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      isAdminNotif: false,
      read: false,
      $or: [{ targetUserId: req.user._id }, { targetUserId: null }],
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all user notifications as read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        isAdminNotif: false,
        read: false,
        $or: [{ targetUserId: req.user._id }, { targetUserId: null }],
      },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserNotifications, getUnreadCount, markAllRead };