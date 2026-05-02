const List        = require('../models/List');
const Card        = require('../models/Card');
const Board       = require('../models/Board');
const logActivity = require('../utils/activityLogger');

async function getListsForBoard(req, res) {
  try {
    const { boardId } = req.query;
    if (!boardId) return res.status(400).json({ message: 'Board ID required' });

    const lists = await List.find({ boardId });

    const listsWithCards = await Promise.all(lists.map(async (list) => {
      const cards = await Card.find({ listId: list._id });
      return { ...list.toObject(), cards };
    }));

    res.json(listsWithCards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lists and cards' });
  }
}

async function addListToBoard(req, res) {
  try {
    const newList = new List({
      boardId:  req.body.boardId,
      title:    req.body.title,
      wipLimit: req.body.wipLimit,
    });
    await newList.save();

    const board = await Board.findById(req.body.boardId).select('user title');
    const userId = board?.user || req.user;
    await logActivity(userId, `Created list "${req.body.title}"`, 'list', req.body.boardId);

    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add list' });
  }
}

async function updateList(req, res) {
  try {
    const updated = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.body.title) {
      const board = await Board.findById(updated.boardId).select('user');
      await logActivity(board?.user || req.user, `Renamed list to "${req.body.title}"`, 'list', updated.boardId);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'List update failed' });
  }
}

async function deleteList(req, res) {
  try {
    const list  = await List.findById(req.params.id);
    const title = list?.title || 'Unknown';
    const bId   = list?.boardId;

    await List.findByIdAndDelete(req.params.id);

    const board = bId ? await Board.findById(bId).select('user') : null;
    await logActivity(board?.user || req.user, `Deleted list "${title}"`, 'delete', bId || null);

    res.json({ message: 'List removed' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
}

module.exports = { getListsForBoard, addListToBoard, updateList, deleteList };