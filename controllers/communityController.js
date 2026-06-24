const CommunityReport = require('../models/CommunityReport');

// @desc    Submit a new scam report
// @route   POST /api/community
const submitReport = async (req, res) => {
  try {
    const { scammerName, platform, description } = req.body;
    const report = await CommunityReport.create({
      userId: req.user._id,
      scammerName,
      platform,
      description,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all community reports
// @route   GET /api/community
const getReports = async (req, res) => {
  try {
    const reports = await CommunityReport.find()
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote a report
// @route   PATCH /api/community/upvote/:id
const upvoteReport = async (req, res) => {
  try {
    const report = await CommunityReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Check if user already upvoted
    const userId = req.user._id;
    if (report.upvotedBy.includes(userId)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    report.upvotes += 1;
    report.upvotedBy.push(userId);
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitReport, getReports, upvoteReport };