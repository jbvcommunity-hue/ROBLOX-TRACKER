// server.js

// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Connect to Database
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roblox-tracker';
mongoose.connect(dbURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Google OAuth callback endpoint
app.get('/auth/google/callback', (req, res) => {
    // Handle Google OAuth callback
    res.json({ message: 'Google OAuth callback - implement with your credentials' });
});

// Manual signup
app.post('/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Manual login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (isValid) {
            const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_this';
            const token = jwt.sign(
                { id: user._id, username: user.username }, 
                jwtSecret, 
                { expiresIn: '24h' }
            );
            res.json({ 
                token, 
                user: { 
                    id: user._id, 
                    username: user.username, 
                    email: user.email 
                } 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Protect routes
const authenticateJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_this';
    
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Account management endpoints
app.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/logout', authenticateJWT, (req, res) => {
    // Client-side should remove token
    res.json({ message: 'Logged out successfully' });
});

app.delete('/account', authenticateJWT, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Enhanced game data endpoint
app.get('/games', async (req, res) => {
    try {
        // Fetch and return game data with metadata
        // This would integrate with Roblox API
        res.json({ 
            message: 'Game data endpoint - integrate with Roblox API',
            games: []
        });
    } catch (error) {
        console.error('Games error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Player count endpoint
app.get('/api/players', (req, res) => {
    // This would fetch real data from Roblox API
    res.json({ playerCount: Math.floor(Math.random() * 10000) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
});