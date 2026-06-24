const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/testimonialController');

router.get('/', adminProtect, ctrl.getAll);
router.patch('/approve/:id', adminProtect, ctrl.approve);
router.patch('/reject/:id', adminProtect, ctrl.reject);

module.exports = router;