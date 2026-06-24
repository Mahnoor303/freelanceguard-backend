const express = require('express');
const router = express.Router();
const { createScan, getHistory, deleteScan } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all scan routes are protected

// Specialized routes for each type (to keep frontend simple)
router.post('/job', createScan);
router.post('/message', createScan);
router.post('/contract', createScan);
router.post('/client', createScan);

router.get('/history', getHistory);
router.delete('/:id', deleteScan);
router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });
    if (scan.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Unauthorized' });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;