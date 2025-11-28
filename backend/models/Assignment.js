const mongoose = require('mongoose');
const AssignmentSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  customers: [{
    FirstName: String,
    Phone: String,
    Notes: String
  }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Assignment', AssignmentSchema);
