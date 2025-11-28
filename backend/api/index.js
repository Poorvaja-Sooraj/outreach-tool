// backend/api/index.js
// Minimal Vercel serverless wrapper for the Express app.
// Ensures mongoose connects once and then forwards to the Express app.

const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../app'); // your Express app (exports the app)

const handler = serverless(app);

let isConnected = false;

async function ensureDb() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  isConnected = true;
  console.log('Connected to MongoDB (serverless)');
}

module.exports = async (req, res) => {
  try {
    await ensureDb();
    // Directly call the serverless handler
    return handler(req, res);
  } catch (err) {
    console.error('API wrapper error:', err && err.message ? err.message : err);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain');
    res.end('Internal Server Error');
  }
};
