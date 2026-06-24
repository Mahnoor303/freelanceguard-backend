const SavedReport = require('../models/SavedReport');

// @desc    Save a report (bookmark a scan)
// @route   POST /api/reports/save
const saveReport = async (req, res) => {
  try {
    const { scanId, reportName } = req.body;
    const report = await SavedReport.create({
      userId: req.user._id,
      scanId,
      reportName,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all saved reports for user
// @route   GET /api/reports
const getReports = async (req, res) => {
  try {
    const reports = await SavedReport.find({ userId: req.user._id })
      .populate('scanId')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a saved report
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await SavedReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await report.remove();
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveReport, getReports, deleteReport };