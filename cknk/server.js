const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulated database (use a real database like MongoDB, MySQL in production)
const users = [];

// Registration Endpoint
app.post('/signup', async (req, res) => {
  const { fullName, email, password, allergyInfo, preferences } = req.body;

  // Basic validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  // Check if user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user data
    const newUser = { fullName, email, password: hashedPassword, allergyInfo, preferences };
    users.push(newUser);

    // Respond to the client
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
