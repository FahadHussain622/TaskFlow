const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const cron       = require('node-cron');
const nodemailer = require('nodemailer');
const connectDB  = require('./config/db');
require('dotenv').config();

const Card  = require('./models/Card');
const List  = require('./models/List');
const Board = require('./models/Board');
const User  = require('./models/User');

const authRoutes      = require('./routes/authRoutes');
const boardRoutes     = require('./routes/boardRoutes');
const listRoutes      = require('./routes/listRoutes');
const cardRoutes      = require('./routes/cardRoutes');
const searchRoutes    = require('./routes/searchRoutes');
const userRoutes      = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      authRoutes);
app.use('/api/boards',    boardRoutes);
app.use('/api/lists',     listRoutes);
app.use('/api/cards',     cardRoutes);
app.use('/api/search',    searchRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/dashboard', dashboardRoutes);

cron.schedule('0 9 * * *', async () => {
  try {
    const today    = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dueCards = await Card.find({ dueDate: today });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    for (const card of dueCards) {
      const list = await List.findById(card.listId);
      if (!list) continue;
      const board = await Board.findById(list.boardId);
      if (!board) continue;
      const user = await User.findById(board.user);
      if (!user || !user.email) continue;

      await transporter.sendMail({
        from:    process.env.EMAIL_USER,
        to:      user.email,
        subject: `TaskFlow Reminder: "${card.content}" is due today!`,
        text:    `Hi ${user.name},\n\nYour task "${card.content}" on the board "${board.title}" is due today.\nLog in to complete it: http://localhost:5173\n\n— TaskFlow`,
      });
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));