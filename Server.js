const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (replace 'your_database_uri' with your actual MongoDB URI)
mongoose.connect('mongodb+srv://nithusugitamil:guvi_123@guvitask.ovdm51p.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  age: Number,
  gender: String,
  dob: String,
  mobile: String
});

const User = mongoose.model('User', userSchema);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// const sessionSecret = crypto.randomBytes(64).toString('hex');
// app.use(session({ secret: sessionSecret, resave: true, saveUninitialized: true }));
const sessionSecret = 'your_static_secret';
app.use(session({ secret: sessionSecret, resave: true, saveUninitialized: true }));


// Routes
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


app.get('/profile', (req, res) => {
  console.log('Session User:', req.session.user);

  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});


app.post('/update-profile', async (req, res) => {
  try {
    const { age, gender, dob, mobile } = req.body;
    const userId = req.session.user._id;

    await User.findByIdAndUpdate(userId, { age, gender, dob, mobile });

    res.status(200).send('Profile updated successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    } else {
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/login');
    }
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
