const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  members:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueTime:    { type: String, default: '' }   // "HH:MM" e.g. "10:00"
});

module.exports = mongoose.model('Team', teamSchema);
