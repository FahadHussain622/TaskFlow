const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Board    = require('../models/Board');
const List     = require('../models/List');
const Card     = require('../models/Card');

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch profile' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim())  return res.status(400).json({ message: 'Name is required' });
    if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });

    const conflict = await User.findOne({ email: email.trim(), _id: { $ne: req.user } });
    if (conflict) return res.status(400).json({ message: 'That email is already in use by another account' });

    const updated = await User.findByIdAndUpdate(
      req.user,
      { name: name.trim(), email: email.trim() },
      { new: true }
    ).select('-password -otp');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Could not update profile' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new passwords are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    if (currentPassword === newPassword)
      return res.status(400).json({ message: 'New password must differ from the current one' });

    const salt     = await bcrypt.genSalt(10);
    user.password  = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not change password' });
  }
}

async function uploadAvatar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const avatarPath = req.file.path.replace(/\\/g, '/');

    const updated = await User.findByIdAndUpdate(
      req.user,
      { avatar: avatarPath },
      { new: true }
    ).select('-password -otp');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Could not upload avatar' });
  }
}

async function deleteAccount(req, res) {
  try {
    const boards = await Board.find({ user: req.user });

    for (const board of boards) {
      const lists = await List.find({ boardId: board._id });
      for (const list of lists) {
        await Card.deleteMany({ listId: list._id });
      }
      await List.deleteMany({ boardId: board._id });
    }

    await Board.deleteMany({ user: req.user });
    await User.findByIdAndDelete(req.user);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete account' });
  }
}

module.exports = { getProfile, updateProfile, changePassword, uploadAvatar, deleteAccount };