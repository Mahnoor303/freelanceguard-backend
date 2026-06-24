const Scan = require('../models/Scan');

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const scans = await Scan.find({ userId });

    const totalScans = scans.length;
    const safeResults = scans.filter(s => s.riskLevel === 'safe').length;
    const dangerResults = scans.filter(s => s.riskLevel === 'danger').length;
    const cautionResults = scans.filter(s => s.riskLevel === 'caution').length;

    res.json({ totalScans, safeResults, dangerResults, cautionResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };