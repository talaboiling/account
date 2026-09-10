const express = require('express');
const repo = require('../repo');
const { requireAuth, requireRole } = require('../auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ notifications: repo.getNotificationsForUser(req.user.id) });
});

router.get('/all', requireRole('admin'), (req, res) => {
  res.json({ notifications: repo.getAllNotifications() });
});

router.post('/:id/read', (req, res) => {
  const ok = repo.markNotificationRead(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ error: 'Уведомление не найдено' });
  res.json({ success: true });
});

router.post('/read-all', (req, res) => {
  repo.markAllRead(req.user.id);
  res.json({ success: true });
});

module.exports = router;
