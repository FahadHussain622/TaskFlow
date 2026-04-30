const Card = require('../models/Card');

async function createCard(req, res) {
  try {
    const card = new Card({
      listId: req.body.listId,
      content: req.body.content,
      description: req.body.description || "",
      label: req.body.label || "",
      dueDate: req.body.dueDate || ""
    });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: "Card creation failed" });
  }
}

async function moveOrUpdateCard(req, res) {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Card update failed" });
  }
}

async function deleteCard(req, res) {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete card" });
  }
}

async function duplicateCard(req, res) {
  try {
    const originalCard = await Card.findById(req.params.id);
    if (!originalCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    const copyCard = new Card({
      listId: originalCard.listId,
      content: originalCard.content + " (Copy)",
      description: originalCard.description,
      label: originalCard.label,
      dueDate: originalCard.dueDate
    });

    await copyCard.save();
    res.status(201).json(copyCard);
  } catch (err) {
    res.status(500).json({ message: "Could not duplicate card" });
  }
}

async function uploadAttachment(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.attachments.push({
      fileName: req.file.originalname,
      filePath: req.file.path.replace(/\\/g, "/")
    });
    
    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: "Server error during upload" });
  }
}

module.exports = { createCard, moveOrUpdateCard, deleteCard, duplicateCard, uploadAttachment };