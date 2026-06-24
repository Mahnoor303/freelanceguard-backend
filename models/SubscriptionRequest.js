const mongoose = require('mongoose');
const subscriptionRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userEmail: String,
  plan: { type: String, enum: ['pro', 'elite'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: String,
}, { timestamps: true });
module.exports = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);