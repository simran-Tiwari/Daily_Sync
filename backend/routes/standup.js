const router = require('express').Router();
const Standup = require('../models/Standup');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const today = () => new Date().toISOString().slice(0, 10);

const buildSummary = (standups, members, teamName, date) => {
  const memberMap = Object.fromEntries(members.map(m => [m._id.toString(), m.name]));
  let text = `📋 DailySync — ${teamName} | ${date}\n\n`;
  for (const s of standups) {
    const name = memberMap[s.userId._id?.toString() ?? s.userId.toString()] ?? 'Unknown';
    const mood = s.mood ? ` ${s.mood}` : '';
    text += `👤 ${name}${mood}\n`;
    text += `  ✅ Done: ${s.doneYesterday || '—'}\n`;
    text += `  🎯 Today: ${s.doingToday || '—'}\n`;
    text += `  ⚠️ Blockers: ${s.blockers || 'None'}\n\n`;
  }
  return text.trim();
};

// Submit standup
router.post('/', auth, async (req, res) => {
  try {
    const { teamId, doneYesterday, doingToday, blockers, mood } = req.body;
    const existing = await Standup.findOne({ teamId, userId: req.user.id, date: today() });
    if (existing) return res.status(409).json({ message: 'Already submitted today' });

    let isLate = false;
    const team = await Team.findById(teamId, 'dueTime');
    if (team?.dueTime) {
      const [dueH, dueM] = team.dueTime.split(':').map(Number);
      const now = new Date();
      isLate = now.getHours() > dueH || (now.getHours() === dueH && now.getMinutes() > dueM);
    }

    const standup = await Standup.create({
      teamId, userId: req.user.id, date: today(),
      doneYesterday, doingToday, blockers, mood,
      submittedAt: new Date(), isLate
    });
    res.status(201).json(standup);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Edit standup — 1-hour window
router.put('/:id', auth, async (req, res) => {
  try {
    const standup = await Standup.findById(req.params.id);
    if (!standup) return res.status(404).json({ message: 'Not found' });
    if (standup.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (Date.now() - new Date(standup.submittedAt).getTime() > 3600000)
      return res.status(403).json({ message: 'Edit window has passed (1 hour)' });
    const { doneYesterday, doingToday, blockers, mood } = req.body;
    Object.assign(standup, { doneYesterday, doingToday, blockers, mood });
    await standup.save();
    res.json(standup);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Today's feed
router.get('/:teamId/today', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('members', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const standups = await Standup.find({ teamId, date: today() }).populate('userId', 'name email');
    const submittedIds = standups.map(s => s.userId._id.toString());
    const unsubmitted = team.members.filter(m => !submittedIds.includes(m._id.toString()));
    res.json({
      date: today(), standups, unsubmitted,
      totalMembers: team.members.length, teamName: team.name,
      createdBy: team.createdBy, dueTime: team.dueTime
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// History
router.get('/:teamId/history', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param required' });
    const team = await Team.findById(teamId).populate('members', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const standups = await Standup.find({ teamId, date }).populate('userId', 'name email');
    const submittedIds = standups.map(s => s.userId._id.toString());
    const unsubmitted = team.members.filter(m => !submittedIds.includes(m._id.toString()));
    res.json({ date, standups, unsubmitted, totalMembers: team.members.length });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Summary
router.get('/:teamId/summary', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const date = req.query.date || today();
    const team = await Team.findById(teamId).populate('members', 'name');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const standups = await Standup.find({ teamId, date });
    res.json({ summary: buildSummary(standups, team.members, team.name, date) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Weekly digest
router.get('/:teamId/weekly-digest', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('members', 'name');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const monday = new Date(now); monday.setDate(now.getDate() - ((day + 6) % 7)); monday.setHours(0,0,0,0);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    let summary = `📋 DailySync Weekly Digest — ${team.name}\n${dates[0]} to ${dates[6]}\n\n`;
    for (const date of dates) {
      const standups = await Standup.find({ teamId, date });
      if (!standups.length) continue;
      summary += `📅 ${date}\n${buildSummary(standups, team.members, team.name, date)}\n\n`;
    }
    res.json({ summary: summary.trim() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Toggle reaction
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const standup = await Standup.findById(req.params.id);
    if (!standup) return res.status(404).json({ message: 'Not found' });
    const idx = standup.reactions.findIndex(
      r => r.emoji === emoji && r.userId.toString() === req.user.id
    );
    if (idx > -1) standup.reactions.splice(idx, 1);
    else standup.reactions.push({ emoji, userId: req.user.id });
    await standup.save();
    res.json(standup.reactions);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Resolve blocker
router.patch('/:id/resolve-blocker', auth, async (req, res) => {
  try {
    const standup = await Standup.findByIdAndUpdate(
      req.params.id, { blockerResolved: true }, { new: true }
    );
    if (!standup) return res.status(404).json({ message: 'Not found' });
    res.json(standup);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Streaks per member
router.get('/:teamId/streaks', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('members', 'name');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const streaks = {};
    for (const member of team.members) {
      let streak = 0, d = new Date();
      while (true) {
        const dateStr = d.toISOString().slice(0, 10);
        const found = await Standup.findOne({ teamId, userId: member._id, date: dateStr });
        if (!found) break;
        streak++;
        d.setDate(d.getDate() - 1);
      }
      streaks[member._id.toString()] = streak;
    }
    res.json(streaks);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
