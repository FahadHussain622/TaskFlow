const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/auth');
const {getListsForBoard, addListToBoard, updateList, deleteList } = require('../controllers/listController');

router.use(checkUser);

router.post('/', addListToBoard);
router.put('/:id', updateList);
router.delete('/:id', deleteList);
router.get('/', getListsForBoard);

module.exports = router;