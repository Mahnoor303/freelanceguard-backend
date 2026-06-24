const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scanType: {
      type: String,
      enum: ['jobPost', 'message', 'contract', 'client'],
      required: true,
    },
    inputText: { type: String, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ['safe', 'caution', 'danger'], required: true },
    redFlags: [{ type: String }],
    safeSigns: [{ type: String }],
    aiSummary: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);