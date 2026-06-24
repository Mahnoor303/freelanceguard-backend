const CommunityReport = require('../models/CommunityReport');

const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await CommunityReport.find(filter).populate('userId', 'name').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveReport = async (req, res) => {
  try {
    const report = await CommunityReport.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verified: true },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectReport = async (req, res) => {
  try {
    const report = await CommunityReport.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', verified: false },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    await CommunityReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Scam database (verified scammers)
const getScammers = async (req, res) => {
  try {
    const scammers = await CommunityReport.find({ verified: true }).populate('userId', 'name');
    res.json(scammers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyScammer = async (req, res) => {
  try {
    const report = await CommunityReport.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unverifyScammer = async (req, res) => {
  try {
    const report = await CommunityReport.findByIdAndUpdate(req.params.id, { verified: false }, { new: true });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReports, approveReport, rejectReport, deleteReport, getScammers, verifyScammer, unverifyScammer };