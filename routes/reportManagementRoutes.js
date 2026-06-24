const express = require('express');
const router = express.Router();
const { getReports, approveReport, rejectReport, deleteReport, getScammers, verifyScammer, unverifyScammer } = require('../controllers/reportManagementController');
const { adminProtect } = require('../middleware/adminMiddleware');

router.use(adminProtect);
router.get('/', getReports);
router.patch('/approve/:id', approveReport);
router.patch('/reject/:id', rejectReport);
router.delete('/:id', deleteReport);
router.get('/scammers', adminProtect, getScammers);

// Scam database
router.get('/scammers', getScammers);
router.patch('/scammers/verify/:id', verifyScammer);
router.patch('/scammers/unverify/:id', unverifyScammer);

module.exports = router;