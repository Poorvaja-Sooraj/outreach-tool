// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' })); // increase if needed

app.get('/', (_req, res) => res.send('API OK'));
app.use('/auth', require('./routes/auth'));
app.use('/agents', require('./routes/agents'));
app.use('/upload', require('./routes/upload'));

// Export app for serverless wrapper
module.exports = app;

// If running locally (node server.js), connect DB and listen
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      const port = process.env.PORT || 5000;
      app.listen(port, () => console.log('Server running on', port));
      console.log("Connected to MongoDB");
    } catch (e) {
      console.error('DB connection failed', e);
      process.exit(1);
    }
  })();
}
