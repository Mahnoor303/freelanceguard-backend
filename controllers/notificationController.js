const Notification = require('../models/Notification');

// Manual create (admin sends to users)
const create = async (req, res) => {
  try {
    const { title, message, type, targetUserId } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type,
      createdBy: req.admin._id,
      targetUserId: targetUserId || null,
      isAdminNotif: false,   // visible to users
    });

    // 🔥 Emit real‑time event
    const io = req.app.get('io');
    if (io) {
      io.emit('new-notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification (admin)
const remove = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all admin notifications (auto + manual)
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ isAdminNotif: true })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread admin notification count
const getAdminUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isAdminNotif: true, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all admin notifications as read
const markAdminRead = async (req, res) => {
  try {
    await Notification.updateMany({ isAdminNotif: true, read: false }, { read: true });
    res.json({ message: 'All admin notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  remove,
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminRead,
};