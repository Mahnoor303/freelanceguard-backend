const router = require('express').Router();
const ctrl = require('../controllers/contactController');
router.post('/', ctrl.submit);
module.exports = router;