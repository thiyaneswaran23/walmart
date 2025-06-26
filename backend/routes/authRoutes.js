const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const User = require('../models/userSchema.js');

router.post('/signup', async (req, res) => {
  const { name, gender, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, gender, email, password: hashed });
    await newUser.save();

    
    const token = jwt.sign({ id: newUser._id },process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

   
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(420).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(420).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
