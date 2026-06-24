const express = require('express');
const router = express.Router();
const { submitReport, getReports, upvoteReport } = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

// Public: view all community reports (even without login)
router.get('/', getReports);

// Protected: submit and upvote
router.post('/', protect, submitReport);
router.patch('/upvote/:id', protect, upvoteReport);

module.exports = router;