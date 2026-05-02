const Board       = require('../models/Board');
const logActivity = require('../utils/activityLogger');

async function getAllBoards(req, res) {
  try {
    const userBoards = await Board.find({ user: req.user });
    res.json(userBoards);
  } catch (err) {
    res.status(500).json({ message: 'Could not get boards' });
  }
}

async function createNewBoard(req, res) {
  try {
    const { title, desc, color } = req.body;
    const board = new Board({ title, desc, color, user: req.user });
    await board.save();

    await logActivity(req.user, `Created board "${title}"`, 'board', board._id);

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Could not create board' });
  }
}

async function updateBoard(req, res) {
  try {
    const updated = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.body.title) {
      await logActivity(req.user, `Renamed board to "${req.body.title}"`, 'board', updated._id);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
}

async function deleteBoard(req, res) {
  try {
    const board = await Board.findById(req.params.id);
    const title = board?.title || 'Unknown';

    await Board.findByIdAndDelete(req.params.id);

    await logActivity(req.user, `Deleted board "${title}"`, 'delete');

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
}

module.exports = { getAllBoards, createNewBoard, updateBoard, deleteBoard };