const mongoose = require('mongoose');

const savedReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', required: true },
    reportName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedReport', savedReportSchema);