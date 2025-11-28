// backend/api/index.js
const serverless = require('serverless-http');
const app = require('../server');
const mongoose = require('mongoose');

let connPromise = null;

async function ensureDb() {
  if (!connPromise) {
    connPromise = mongoose.connect(process.env.MONGO_URI, {
      // optional: useUnifiedTopology etc. Mongoose v7 handles defaults
    }).catch(err => {
      console.error('Mongo connect error', err);
      throw err;
    });
  }
  return connPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDb();
    // Hand off to serverless wrapper
    return serverless(app)(req, res);
  } catch (e) {
    console.error('Error in handler', e);
    res.status(500).send('Server error');
  }
};
