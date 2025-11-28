const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const auth = require('../middleware/auth');
const Agent = require('../models/Agent');
const Assignment = require('../models/Assignment');
const { distributeEqual } = require('../utils/distribute');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Upload CSV/XLS/XLSX.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('file');

// POST /upload
router.post('/', auth, (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      // Parse using XLSX (works for csv/xls/xlsx from buffer)
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

      if (!rows.length) return res.status(400).json({ error: 'Empty file' });

      // Basic shape validation
      const sample = rows[0];
      const requiredCols = ['FirstName', 'Phone', 'Notes'];
      for (const col of requiredCols) {
        if (!(col in sample)) return res.status(400).json({ error: `Missing column: ${col}` });
      }

      const agents = await Agent.find();
      if (agents.length < 5) return res.status(400).json({ error: 'Need at least 5 agents' });

      const agentIds = agents.slice(0,5).map(a => a._id); // first 5 per assignment
      const buckets = distributeEqual(rows, agentIds);

      // Save each bucket as an Assignment doc
      const writes = [];
      for (let i = 0; i < agentIds.length; i++) {
        writes.push(Assignment.create({
          agent: agentIds[i],
          customers: buckets[i].map(r => ({
            FirstName: r.FirstName,
            Phone: r.Phone,
            Notes: r.Notes
          }))
        }));
      }
      const saved = await Promise.all(writes);

      res.json({
        ok: true,
        counts: saved.map((a, i) => ({ agent: agents[i].name, customers: a.customers.length }))
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Parsing/Distribution error' });
    }
  });
});

// GET /assignments (per-agent lists)
router.get('/assignments', auth, async (_req, res) => {
  const data = await Assignment.find().populate('agent', 'name email mobile');
  res.json(data);
});

module.exports = router;
