const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const { hashPassword, comparePassword, generateSessionToken, validateSessionToken, googleOAuthConfig } = require('./auth-config');
const { User, Game } = require('./db-schema');

const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  const decoded = validateSessionToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  req.user = decoded;
  next();
};

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = new User({ username, email, hashedPassword });
    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await comparePassword(password, user.hashedPassword)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = generateSessionToken(user);
    res.json({ token, user: { username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Roblox proxy endpoints
app.get('/api/roblox/place-details', async (req, res) => {
  const placeIds = req.query.placeIds.split(',');
  try {
    const url = `https://games.roblox.com/v1/games/multiget-place-details?${placeIds.map(id => `placeIds=${id}`).join('&')}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Roblox' });
  }
});

app.get('/api/roblox/game-icons', async (req, res) => {
  const universeIds = req.query.universeIds;
  try {
    const response = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds}&returnPolicy=PlaceHolder&size=150x150&format=Png`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Roblox' });
  }
});

app.get('/api/roblox/game-details', async (req, res) => {
  const universeIds = req.query.universeIds;
  try {
    const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Roblox' });
  }
});

app.get('/api/roblox/user-details', async (req, res) => {
  const userId = req.query.userId;
  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Roblox' });
  }
});

app.get('/api/roblox/user-headshot', async (req, res) => {
  const userIds = req.query.userIds;
  try {
    const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Roblox' });
  }
});

// Total players scrape
app.get('/api/players', async (req, res) => {
  try {
    const response = await fetch('https://romonitorstats.com/');
    const html = await response.text();
    const $ = cheerio.load(html);
    const peakText = $('h4:contains("Peak Concurrent Users")').text().trim();
    const match = peakText.match(/(\d+\.\d+)M/);
    const count = match ? parseFloat(match[1]) * 1000000 : 3000000;
    res.json({ playerCount: Math.floor(count) });
  } catch (error) {
    res.json({ playerCount: 3000000 });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
