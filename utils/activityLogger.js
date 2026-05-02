const Activity = require('../models/Activity');

async function logActivity(userId, text, type = 'card', boardId = null) {
  try {
    await Activity.create({ userId, text, type, boardId: boardId || null });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

module.exports = logActivity;