const express   = require('express');
const router    = express.Router();
const checkUser = require('../middleware/auth');
const { getStats, getActivity } = require('../controllers/dashboardController');

router.use(checkUser);

router.get('/stats', getStats);

router.get('/activity', getActivity);

module.exports = router;