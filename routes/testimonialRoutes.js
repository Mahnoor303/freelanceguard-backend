const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/testimonialController');

// Public – approved testimonials for landing page
router.get('/approved', ctrl.getApproved);

// User submit (protected)
router.post('/', protect, ctrl.submitTestimonial);

// Admin routes
router.get('/admin/all', adminProtect, ctrl.getAll);
router.patch('/admin/approve/:id', adminProtect, ctrl.approve);
router.patch('/admin/reject/:id', adminProtect, ctrl.reject);

module.exports = router;