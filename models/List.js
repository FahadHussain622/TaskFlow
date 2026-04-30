const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  wipLimit: { type: Number, default: null },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' }
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);