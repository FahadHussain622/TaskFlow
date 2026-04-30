const List = require('../models/List');
const Card = require('../models/Card');

async function getListsForBoard(req, res) {
  try {
    const { boardId } = req.query;
    if (!boardId) return res.status(400).json({ message: "Board ID required" });

    const lists = await List.find({ boardId });

    const listsWithCards = await Promise.all(lists.map(async (list) => {
      const cards = await Card.find({ listId: list._id });
      return {
        ...list.toObject(), 
        cards: cards        
      };
    }));

    res.json(listsWithCards);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lists and cards" });
  }
}

async function addListToBoard(req, res) {
  try {
    const newList = new List({
      boardId: req.body.boardId,
      title: req.body.title,
      wipLimit: req.body.wipLimit
    });
    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ message: "Failed to add list" });
  }
}

async function updateList(req, res) {
  try {
    const updated = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "List update failed" });
  }
}

async function deleteList(req, res) {
  try {
    await List.findByIdAndDelete(req.params.id);
    res.json({ message: "List removed" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
}

module.exports = { getListsForBoard, addListToBoard, updateList, deleteList };