const mongoose = require('mongoose');

const standupSchema = new mongoose.Schema({
  teamId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:            { type: String, required: true },
  doneYesterday:   { type: String, default: '' },
  doingToday:      { type: String, default: '' },
  blockers:        { type: String, default: '' },
  blockerResolved: { type: Boolean, default: false },
  mood:            { type: String, default: '' },
  reactions:       [{ emoji: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  submittedAt:     { type: Date, default: Date.now },
  isLate:          { type: Boolean, default: false }
});

standupSchema.index({ teamId: 1, userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Standup', standupSchema);
