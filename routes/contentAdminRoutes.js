const express = require('express');
const router = express.Router();
const { update } = require('../controllers/contentController');
const { adminProtect } = require('../middleware/adminMiddleware');

router.put('/', adminProtect, update);
module.exports = router;