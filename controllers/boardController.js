const Board = require('../models/Board');

async function getAllBoards(req, res) {
  try {
    const userBoards = await Board.find({ user: req.user });
    res.json(userBoards);
  } catch (err) {
    res.status(500).json({ message: "Could not get boards" });
  }
}

async function createNewBoard(req, res) {
  try {
    const { title, desc, color } = req.body;
    const board = new Board({
      title: title,
      desc: desc,
      color: color,
      user: req.user
    });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: "Could not create board" });
  }
}

async function updateBoard(req, res) {
  try {
    const updated = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
}

async function deleteBoard(req, res) {
  try {
    await Board.findByIdAndDelete(req.params.id);
    res.json({ message: "Board deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
}

module.exports = { getAllBoards, createNewBoard, updateBoard, deleteBoard };