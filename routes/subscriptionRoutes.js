const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const subCtrl = require('../controllers/subscriptionController');

// User routes
router.post('/request-upgrade', protect, subCtrl.requestUpgrade);
router.get('/my-status', protect, subCtrl.getMyRequestStatus);
router.get('/details', protect, subCtrl.getSubscription);
router.post('/confirm-payment', protect, subCtrl.confirmPayment);   // 👈 this is missing

// Admin routes
const { adminProtect } = require('../middleware/adminMiddleware');
router.get('/admin/requests', adminProtect, subCtrl.getAllRequests);
router.patch('/admin/requests/:id/approve', adminProtect, subCtrl.approveRequest);
router.patch('/admin/requests/:id/reject', adminProtect, subCtrl.rejectRequest);

module.exports = router;