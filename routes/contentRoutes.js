const express = require('express');
const router = express.Router();
const { getPublic } = require('../controllers/contentController');

router.get('/', getPublic);
module.exports = router;