const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user');
const generateToken = require('./generateTokens');
const { authenticateToken } = require("./middleware/authenticateToken");

const router = express.Router();

router.put('/update-profile', async (req, res) => {
    const body = JSON.parse(req.body);
  const { id, name, email, phoneNumber } = body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phoneNumber },
      { new: true }
    );

    res.json({ updatedUser });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});



router.post("/register", async (req, res) => {
    const body = JSON.parse(req.body)
  const { name, email, phoneNumber, password } = body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
    const body = JSON.parse(req.body);

    const { email, password } = body;

  console.log(req);

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    console.log(token);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
