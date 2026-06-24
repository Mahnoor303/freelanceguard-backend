const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'alert'], default: 'info' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // if specific user, else broadcast
    isAdminNotif: { type: Boolean, default: false },   // true = visible only to admins
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);