const express = require('express');
const User = require('../models/user'); // Assuming the User model is in 'models/user.js'
const router = express.Router();
// POST /users - Create a new user
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();
    // Return the created user (without password)
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;