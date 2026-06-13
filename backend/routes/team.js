const router = require('express').Router();
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');

const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;
    let inviteCode, exists;
    do { inviteCode = genCode(); exists = await Team.findOne({ inviteCode }); } while (exists);
    const team = await Team.create({ name, inviteCode, members: [req.user.id], createdBy: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { teams: team._id } });
    res.status(201).json(team);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/join', auth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!team) return res.status(404).json({ message: 'Invalid invite code' });
    if (team.members.includes(req.user.id)) return res.status(409).json({ message: 'Already a member' });
    team.members.push(req.user.id);
    await team.save();
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { teams: team._id } });
    res.json(team);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('teams');
    res.json(user.teams);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:teamId/members', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('members', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team.members);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: remove member
router.delete('/:teamId/members/:userId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Admin only' });
    team.members = team.members.filter(m => m.toString() !== req.params.userId);
    await team.save();
    await User.findByIdAndUpdate(req.params.userId, { $pull: { teams: team._id } });
    res.json({ message: 'Member removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: regenerate invite code
router.post('/:teamId/regenerate-code', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Admin only' });
    let inviteCode, exists;
    do { inviteCode = genCode(); exists = await Team.findOne({ inviteCode }); } while (exists);
    team.inviteCode = inviteCode;
    await team.save();
    res.json({ inviteCode });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: update due time
router.put('/:teamId/settings', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Admin only' });
    team.dueTime = req.body.dueTime || '';
    await team.save();
    res.json({ dueTime: team.dueTime });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
