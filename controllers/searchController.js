const Board = require('../models/Board');
const List  = require('../models/List');
const Card  = require('../models/Card');

async function search(req, res) {
  try {
    const userId  = req.user;
    const { q, label, due, boardId, type = 'all' } = req.query;

    const boardFilter = { user: userId };
    if (boardId) boardFilter._id = boardId;

    if (q && (type === 'boards' || type === 'all')) {
      boardFilter.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { desc:        { $regex: q, $options: 'i' } },
      ];
    }

    let matchedBoards = [];
    if (type === 'boards' || type === 'all') {
      matchedBoards = await Board.find(boardFilter)
        .select('_id title desc color isArchived createdAt')
        .lean();
    }

    const allUserBoards = await Board.find({ user: userId }).select('_id').lean();
    const allowedBoardIds = allUserBoards.map(b => b._id);

    let matchedCards = [];
    if (type === 'cards' || type === 'all') {

      const listFilter = { boardId: boardId ? boardId : { $in: allowedBoardIds } };
      const lists = await List.find(listFilter).select('_id title boardId').lean();
      const listIds = lists.map(l => l._id);

      const cardFilter = { listId: { $in: listIds } };

      if (q) {
        cardFilter.$or = [
          { content:     { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ];
      }

      if (label) cardFilter.label = label;

      if (due === 'today' || due === 'week') {
        const now   = new Date();
        const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                        'Jul','Aug','Sep','Oct','Nov','Dec'];

        const targetDates = [];

        if (due === 'today') {
          targetDates.push(`${MONTHS[now.getMonth()]} ${now.getDate()}`);
        } else {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            targetDates.push(`${MONTHS[d.getMonth()]} ${d.getDate()}`);
          }
        }

        cardFilter.dueDate = { $in: targetDates };
      }

      const rawCards = await Card.find(cardFilter)
        .select('_id content description label dueDate attachments listId createdAt')
        .lean();

      const listMap  = {};
      lists.forEach(l => { listMap[l._id.toString()] = l; });

      const boardMap = {};
      allUserBoards.forEach(b => { boardMap[b._id.toString()] = b; });

      const boardDocs = await Board.find({ user: userId })
        .select('_id title').lean();
      const boardTitleMap = {};
      boardDocs.forEach(b => { boardTitleMap[b._id.toString()] = b.title; });

      matchedCards = rawCards.map(card => {
        const list  = listMap[card.listId.toString()]  || {};
        const bId   = list.boardId ? list.boardId.toString() : '';
        return {
          ...card,
          listTitle:  list.title  || '',
          boardId:    bId,
          boardTitle: boardTitleMap[bId] || '',
        };
      });
    }

    res.json({
      boards: matchedBoards,
      cards:  matchedCards,
      total:  matchedBoards.length + matchedCards.length,
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed' });
  }
}

module.exports = { search };