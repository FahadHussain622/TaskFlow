const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      otp: generatedOtp
    });
    
    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "TaskFlow - Verify Your Account",
      text: `Hello ${name}! Your verification code is: ${generatedOtp}`
    });

    res.status(201).json({ message: "Account created! Please check your email for the OTP." });
  } catch (err) {
    res.status(500).json({ message: "Error in registration" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified === false) {
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token: token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Error in login" });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.otp = "";
    await user.save();

    res.status(200).json({ message: "Email successfully verified! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error during verification" });
  }
}

module.exports = { register, login, verifyEmail };