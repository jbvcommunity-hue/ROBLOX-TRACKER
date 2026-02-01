const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    hashedPassword: String,
    googleId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

// Game Schema
const GameSchema = new mongoose.Schema({
    universeId: { type: String, required: true },
    name: { type: String, required: true },
    playing: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

// DeveloperKey Schema
const DeveloperKeySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    permissions: { type: Array, default: [] }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Game: mongoose.model('Game', GameSchema),
    DeveloperKey: mongoose.model('DeveloperKey', DeveloperKeySchema)
};
