// auth-config.js

const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Google OAuth Configuration
const googleOAuthConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
};

// JWT Secret Management
const jwtSecret = process.env.JWT_SECRET;

// Password Hashing Utilities
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Session Token Generation/Validation Functions
const generateSessionToken = (user) => {
    return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
};

const validateSessionToken = (token) => {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (error) {
        return null;
    }
};

module.exports = {
    googleOAuthConfig,
    hashPassword,
    comparePassword,
    generateSessionToken,
    validateSessionToken
};