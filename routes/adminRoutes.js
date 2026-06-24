const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminMiddleware');

// Public
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);

// Protected
router.get('/me', adminProtect, ctrl.getMe);
router.get('/dashboard', adminProtect, ctrl.dashboard);
router.put('/profile', adminProtect, ctrl.updateProfile);
router.get('/admins', adminProtect, ctrl.getAdmins);
router.delete('/admins/:id', adminProtect, ctrl.deleteAdmin);
router.get('/charts', adminProtect, ctrl.charts);   // 👈 new charts endpoint

module.exports = router;