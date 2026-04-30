const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  content: { type: String, required: true },
  description: { type: String, default: "" },
  label: { type: String, default: "" },
  dueDate: { type: String, default: "" },
  comments: [{ 
    text: String, 
    author: String, 
    date: { type: Date, default: Date.now } 
  }],
  attachments: [{ 
    fileName: String, 
    filePath: String 
  }],
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);