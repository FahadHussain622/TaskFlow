const express    = require('express');
const router     = express.Router();
const checkUser  = require('../middleware/auth');
const { search } = require('../controllers/searchController');

router.use(checkUser);

router.get('/', search);

module.exports = router;