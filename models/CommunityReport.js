const mongoose = require('mongoose');

const communityReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scammerName: {
      type: String,
      required: [true, 'Scammer name is required'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['Upwork', 'Fiverr', 'Freelancer', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityReport', communityReportSchema);