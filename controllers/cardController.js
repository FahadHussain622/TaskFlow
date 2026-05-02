const Card        = require('../models/Card');
const List        = require('../models/List');
const Board       = require('../models/Board');
const logActivity = require('../utils/activityLogger');

async function resolveContext(listId) {
  try {
    const list  = await List.findById(listId).select('boardId');
    if (!list) return {};
    const board = await Board.findById(list.boardId).select('user');
    return { boardId: list.boardId, userId: board?.user };
  } catch {
    return {};
  }
}

async function createCard(req, res) {
  try {
    const card = new Card({
      listId:      req.body.listId,
      content:     req.body.content,
      description: req.body.description || '',
      label:       req.body.label       || '',
      dueDate:     req.body.dueDate     || '',
    });
    await card.save();

    const { userId, boardId } = await resolveContext(req.body.listId);
    await logActivity(userId || req.user, `Added card "${req.body.content}"`, 'card', boardId);

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Card creation failed' });
  }
}

async function moveOrUpdateCard(req, res) {
  try {
    const before  = await Card.findById(req.params.id).select('listId content');
    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.body.listId && before && before.listId.toString() !== req.body.listId) {
      const destList = await List.findById(req.body.listId).select('title boardId');
      const board    = destList ? await Board.findById(destList.boardId).select('user') : null;
      await logActivity(
        board?.user || req.user,
        `Moved "${before.content}" to ${destList?.title || 'another list'}`,
        'card',
        destList?.boardId || null,
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Card update failed' });
  }
}

async function deleteCard(req, res) {
  try {
    const card = await Card.findById(req.params.id).select('content listId');
    const { userId, boardId } = card ? await resolveContext(card.listId) : {};

    await Card.findByIdAndDelete(req.params.id);

    await logActivity(userId || req.user, `Deleted card "${card?.content || ''}"`, 'delete', boardId);

    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete card' });
  }
}

async function duplicateCard(req, res) {
  try {
    const original = await Card.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Card not found' });

    const copy = new Card({
      listId:      original.listId,
      content:     original.content + ' (Copy)',
      description: original.description,
      label:       original.label,
      dueDate:     original.dueDate,
    });
    await copy.save();

    const { userId, boardId } = await resolveContext(original.listId);
    await logActivity(userId || req.user, `Duplicated card "${original.content}"`, 'card', boardId);

    res.status(201).json(copy);
  } catch (err) {
    res.status(500).json({ message: 'Could not duplicate card' });
  }
}

async function uploadAttachment(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    card.attachments.push({
      fileName: req.file.originalname,
      filePath: req.file.path.replace(/\\/g, '/'),
    });
    await card.save();

    const { userId, boardId } = await resolveContext(card.listId);
    await logActivity(userId || req.user, `Attached "${req.file.originalname}" to "${card.content}"`, 'card', boardId);

    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error during upload' });
  }
}

module.exports = { createCard, moveOrUpdateCard, deleteCard, duplicateCard, uploadAttachment };