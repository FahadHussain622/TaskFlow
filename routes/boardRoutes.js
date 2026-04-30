const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/auth');
const { getAllBoards, createNewBoard, updateBoard, deleteBoard } = require('../controllers/boardController');

router.use(checkUser);

router.get('/', getAllBoards);
router.post('/', createNewBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;