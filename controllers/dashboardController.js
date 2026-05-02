const Board    = require('../models/Board');
const List     = require('../models/List');
const Card     = require('../models/Card');
const Activity = require('../models/Activity');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function thisWeekDateStrings() {
  const now  = new Date();
  const sun  = new Date(now);
  sun.setDate(now.getDate() - now.getDay());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    dates.push(`${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return dates;
}

async function getStats(req, res) {
  try {
    const userId = req.user;

    const boards = await Board.find({ user: userId }).select('_id').lean();
    const boardIds = boards.map(b => b._id);

    const lists = await List.find({ boardId: { $in: boardIds } }).select('_id title').lean();
    const listIds = lists.map(l => l._id);

    const cards = await Card.find({ listId: { $in: listIds } })
      .select('label dueDate listId')
      .lean();

    const doneListIds = new Set(
      lists
        .filter(l => ['done', 'completed', 'finished'].some(k => l.title.toLowerCase().includes(k)))
        .map(l => l._id.toString())
    );

    const weekDates = new Set(thisWeekDateStrings());

    let completed    = 0;
    let highPriority = 0;
    let features     = 0;
    let bugs         = 0;
    let dueThisWeek  = 0;

    for (const card of cards) {
      if (doneListIds.has(card.listId.toString())) completed++;
      if (card.label === 'High Priority') highPriority++;
      if (card.label === 'Feature')       features++;
      if (card.label === 'Bug')           bugs++;
      if (card.dueDate && weekDates.has(card.dueDate)) dueThisWeek++;
    }

    res.json({
      boards:      boardIds.length,
      totalTasks:  cards.length,
      completed,
      highPriority,
      features,
      bugs,
      dueThisWeek,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Could not load dashboard stats' });
  }
}

async function getActivity(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const items = await Activity.find({ userId: req.user })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = items.map(item => ({
      id:      item._id,
      text:    item.text,
      type:    item.type,
      boardId: item.boardId,
      time:    relativeTime(item.createdAt),
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Dashboard activity error:', err);
    res.status(500).json({ message: 'Could not load activity' });
  }
}

function relativeTime(date) {
  const diffMs  = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24)  return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7)   return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

module.exports = { getStats, getActivity };