const express = require('express');
const router = express.Router();
const { getUsers, getUser, suspendUser, activateUser, deleteUser } = require('../controllers/userManagementController');
const { adminProtect } = require('../middleware/adminMiddleware');

router.use(adminProtect);
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/suspend/:id', suspendUser);
router.patch('/activate/:id', activateUser);
router.delete('/:id', deleteUser);

module.exports = router;