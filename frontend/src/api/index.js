// backend/api/index.js
const serverless = require('serverless-http');
const app = require('../server');
const mongoose = require('mongoose');

let connPromise = null;
async function ensureDb() {
  if (!connPromise) {
    connPromise = mongoose.connect(process.env.MONGO_URI);
  }
  return connPromise;
}

const handler = async (req, res) => {
  try {
    await ensureDb();
    return serverless(app)(req, res);
  } catch (err) {
    console.error('Serverless handler error', err);
    res.status(500).send('Server error');
  }
};

module.exports = handler;
