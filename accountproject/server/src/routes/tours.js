const express = require('express');
const repo = require('../repo');
const { requireAuth, requireRole } = require('../auth');

const router = express.Router();
router.use(requireAuth, requireRole('admin', 'manager'));

// Admins and managers can both browse every tour (matches the original UI,
// which never restricted the tour list/detail views by assignment — only
// the action buttons are gated to the assigned manager).
router.get('/', (req, res) => {
  res.json({ tours: repo.getAllTours() });
});

router.get('/:id', (req, res) => {
  const tour = repo.getTourById(req.params.id);
  if (!tour) return res.status(404).json({ error: 'Тур не найден' });
  res.json({ tour });
});

router.post('/:id/start', requireRole('admin'), (req, res) => {
  const tour = repo.getTourById(req.params.id);
  if (!tour) return res.status(404).json({ error: 'Тур не найден' });
  if (tour.status !== 'forming') return res.status(409).json({ error: 'Тур уже запущен' });
  const { managerId, taskNote } = req.body || {};
  if (!managerId || !taskNote?.trim()) return res.status(400).json({ error: 'Укажите заведующего и задание' });
  if (!repo.getUserById(managerId) || repo.getUserById(managerId).role !== 'manager') {
    return res.status(400).json({ error: 'Заведующий не найден' });
  }
  res.json({ tour: repo.startTour(tour.id, req.user.id, managerId, taskNote) });
});

router.post('/:id/work-status', (req, res) => {
  const tour = repo.getTourById(req.params.id);
  if (!tour) return res.status(404).json({ error: 'Тур не найден' });
  if (req.user.role === 'manager' && tour.assignedManagerId !== req.user.id) {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  const { workStatus, note } = req.body || {};
  if (!['in_progress', 'completed'].includes(workStatus)) return res.status(400).json({ error: 'Недопустимый статус' });
  res.json({ tour: repo.updateTourWorkStatus(tour.id, req.user.id, workStatus, note || '') });
});

router.post('/:id/samples-sent', requireRole('admin'), (req, res) => {
  const tour = repo.getTourById(req.params.id);
  if (!tour) return res.status(404).json({ error: 'Тур не найден' });
  if (tour.status !== 'completed') return res.status(409).json({ error: 'Неверный статус тура' });
  res.json({ tour: repo.notifyTourSamplesSent(tour.id, req.user.id, req.body?.note || '') });
});

module.exports = router;
