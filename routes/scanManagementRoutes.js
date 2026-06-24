const express = require('express');
const router = express.Router();
const { getScans, getScan, deleteScan } = require('../controllers/scanManagementController');
const { adminProtect } = require('../middleware/adminMiddleware');

router.use(adminProtect);
router.get('/', getScans);
router.get('/:id', getScan);
router.delete('/:id', deleteScan);

module.exports = router;