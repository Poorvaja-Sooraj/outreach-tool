const express = require('express');
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const router = express.Router();

/**
 * POST /agents
 * Creates a new agent after validating phone and hashing password.
 * Protected by auth middleware.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Basic required fields check
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields required: name, email, mobile, password' });
    }

    // Phone validation using libphonenumber-js
    // Accepts inputs like "+919876543210" or "9876543210" (but country code is recommended)
    const phoneObj = parsePhoneNumberFromString(mobile || '');
    if (!phoneObj || !phoneObj.isValid()) {
      return res.status(400).json({
        error: 'Invalid mobile phone number. Include country code, e.g. +919876543210'
      });
    }

    // Normalize to E.164 format for storage (+<country><number>)
    const mobileNormalized = phoneObj.number;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create agent with normalized mobile
    const agent = await Agent.create({
      name,
      email,
      mobile: mobileNormalized,
      passwordHash
    });

    // Do not return passwordHash
    const safeAgent = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      createdAt: agent.createdAt || null
    };

    return res.json(safeAgent);

  } catch (e) {
    // Duplicate key (unique email) error code from MongoDB
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Agent email already exists' });
    }
    console.error('Error creating agent:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /agents
 * Returns list of agents (without passwordHash)
 */
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-passwordHash -__v');
    res.json(agents);
  } catch (e) {
    console.error('Error fetching agents:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
