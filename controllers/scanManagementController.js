const Scan = require('../models/Scan');

const getScans = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { scanType: type } : {};
    const scans = await Scan.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id).populate('userId', 'name email');
    if (!scan) return res.status(404).json({ message: 'Scan not found' });
    res.json(scan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScan = async (req, res) => {
  try {
    await Scan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getScans, getScan, deleteScan };