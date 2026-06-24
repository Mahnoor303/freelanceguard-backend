const express = require('express');
const router = express.Router();
const { saveReport, getReports, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/save', saveReport);
router.get('/', getReports);
router.delete('/:id', deleteReport);

module.exports = router;