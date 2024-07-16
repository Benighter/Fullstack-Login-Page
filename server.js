const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB:', mongoURI);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const inappropriateWords = ['damn', 'fuck', 'bastard', 'shit', 'bitch', 
                            'fuck', 'cunt', 'bugger', 'idiot', 'sex'];

function checkInappropriateContent(req, res, next) {
  const { username, email } = req.body;
  console.log('Checking username and email:', username, email);

  const checkString = (str) => {
    const words = str.toLowerCase().split(/\W+/);
    return words.filter(word => inappropriateWords.includes(word));
  };

  const inappropriateUsernameWords = checkString(username);
  const inappropriateEmailWords = checkString(email.split('@')[0]);

  if (inappropriateUsernameWords.length > 0) {
    console.log('Registration refused due to inappropriate username');
    return res.status(400).json({ 
      message: `Username contains inappropriate content: ${inappropriateUsernameWords.join(', ')}` 
    });
  }

  if (inappropriateEmailWords.length > 0) {
    console.log('Registration refused due to inappropriate email');
    return res.status(400).json({ 
      message: `Email contains inappropriate content: ${inappropriateEmailWords.join(', ')}` 
    });
  }

  console.log('Username and email passed inappropriate content check');
  next();
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Extracted Token:', token);

  if (token == null) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.sendStatus(403);
    }
    console.log('Token verified successfully. User:', user);
    req.user = user;
    next();
  });
};

app.post('/register', checkInappropriateContent, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Attempting to register user:', { username, email });

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log('User registered successfully:', user);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', email);
    res.json({ token });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

app.get('/protected', authenticateToken, (req, res) => {
  console.log('Accessed protected route. User:', req.user);
  res.json({ message: 'This is protected content. Only authenticated users can see this.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));