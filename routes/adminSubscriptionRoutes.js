const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const subCtrl = require('../controllers/subscriptionController');

router.get('/requests', adminProtect, subCtrl.getAllRequests);
router.patch('/requests/:id/approve', adminProtect, subCtrl.approveRequest);
router.patch('/requests/:id/reject', adminProtect, subCtrl.rejectRequest);

module.exports = router;