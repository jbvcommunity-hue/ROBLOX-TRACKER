// server.js
// Full, minimal, production-safe Express + Mongoose server

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

/* -------------------- middleware -------------------- */
app.use(helmet());
app.use(cors());
app.use(express.json());

/* -------------------- config -------------------- */
const PORT = Number(process.env.PORT || 10000);
const MONGODB_URI = process.env.MONGODB_URI;

/* -------------------- startup logs -------------------- */
console.log('NODE_ENV =', process.env.NODE_ENV || 'undefined');
console.log('PORT =', PORT);
console.log('MONGODB_URI defined =', MONGODB_URI ? 'yes' : 'no');

/* -------------------- hard fail if missing -------------------- */
if (!MONGODB_URI) {
  console.error('[FATAL] MONGODB_URI is not set in environment variables');
  process.exit(1);
}

/* -------------------- database + server start -------------------- */
async function startServer() {
  try {
    // Connect to MongoDB (no deprecated options)
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    /* -------------------- routes -------------------- */

    app.get('/', (req, res) => {
      res.send('ROBLOX-TRACKER server is running');
    });

    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    /* -------------------- start listening -------------------- */
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    /* -------------------- graceful shutdown -------------------- */
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down...`);
      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.log('MongoDB disconnected');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('MongoDB connection failed');
    console.error(err.message);
    process.exit(1);
  }
}

startServer();
