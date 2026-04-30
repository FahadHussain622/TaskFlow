const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createCard, moveOrUpdateCard, deleteCard, duplicateCard, uploadAttachment } = require('../controllers/cardController');
const checkUser = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 } // 5MB limit
});

router.use(checkUser);
router.post('/', createCard);
router.put('/:id', moveOrUpdateCard);
router.delete('/:id', deleteCard);
router.post('/:id/duplicate', duplicateCard);
router.post('/:id/upload', upload.single('file'), uploadAttachment);

module.exports = router;