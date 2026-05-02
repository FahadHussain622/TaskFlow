const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const checkUser = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
} = require('../controllers/userController');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user}-${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const okExt  = allowed.test(path.extname(file.originalname).toLowerCase());
    const okMime = allowed.test(file.mimetype);
    okExt && okMime
      ? cb(null, true)
      : cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  },
});

router.use(checkUser);

router.get   ('/me',       getProfile);
router.put   ('/me',       updateProfile);
router.put   ('/password', changePassword);
router.post  ('/avatar',   avatarUpload.single('avatar'), uploadAvatar);
router.delete('/me',       deleteAccount);

module.exports = router;