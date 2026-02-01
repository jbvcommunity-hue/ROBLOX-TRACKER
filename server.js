// server.js — full ready-to-use server for Render/Heroku/etc.
// NOTE: Do NOT commit real credentials. Use env vars in Render or a secrets manager.

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Simple middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Only load .env locally / in development:
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

// Config
const PORT = process.env.PORT ? Number(process.env.PORT) : 10000;
const MONGO_ENV_NAME = 'MONGODB_URI'; // change here if your env var name differs
const mongoUri = process.env[MONGO_ENV_NAME];

// Helpful debug logging to clearly show what's set (Render logs show these)
console.log('NODE_ENV =', process.env.NODE_ENV || 'undefined');
console.log(`PORT = ${PORT}`);
console.log(`${MONGO_ENV_NAME} defined =`, mongoUri ? 'yes' : 'no');

// If mongoUri is undefined in production, fail fast with a clear log
if (!mongoUri && process.env.NODE_ENV === 'production') {
  console.error(`[FATAL] ${MONGO_ENV_NAME} is not set. Set it in your Render/host env vars.`);
  // exit with non-zero so the platform marks the deploy unhealthy
  process.exit(1);
}

// Use a dev fallback when not in production — helpful for local testing
const effectiveUri = mongoUri || 'mongodb://127.0.0.1:27017/roblox-tracker';

// Mongoose connection and server start wrapped in async init
async function start() {
  try {
    // Connect to MongoDB
    await mongoose.connect(effectiveUri, {
      // options kept minimal — modern mongoose works without the older flags but these are safe
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Example simple model (so server is actually useful out of the box)
    const PingSchema = new mongoose.Schema({ ts: { type: Date, default: Date.now } });
    const Ping = mongoose.model('Ping', PingSchema);

    // Health route
    app.get('/health', async (req, res) => {
      // quick mongo check (counts docs in tiny collection)
      try {
        await Ping.create({}); // keep lightweight; useful to surface write perms
        res.json({ status: 'ok', db: 'write test succeeded' });
      } catch (err) {
        res.status(500).json({ status: 'error', db: err.message });
      }
    });

    // Example API route
    app.get('/', (req, res) => {
      res.send('ROBLOX-TRACKER server is running');
    });

    // Error handling middleware (basic)
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    });

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown on SIGINT/SIGTERM
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Closing http server and mongoose connection...`);
      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.log('Mongoose disconnected.');
          process.exit(0);
        } catch (e) {
          console.error('Error during mongoose.disconnect:', e);
          process.exit(1);
        }
      });

      // Force exit if still not closed after a timeout
      setTimeout(() => {
        console.error('Forcing shutdown.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();
