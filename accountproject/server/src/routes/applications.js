const express = require('express');
const repo = require('../repo');
const { requireAuth, requireRole } = require('../auth');

const router = express.Router();
router.use(requireAuth);

function canAccessApp(user, app) {
  if (user.role === 'admin') return true;
  if (user.role === 'client') return app.clientId === user.id;
  if (user.role === 'manager') {
    const tour = app.tourId ? repo.getTourById(app.tourId) : null;
    return !!tour && tour.assignedManagerId === user.id;
  }
  return false;
}

router.get('/', (req, res) => {
  const { user } = req;
  const apps = user.role === 'admin' ? repo.getAllApplications()
    : user.role === 'manager' ? repo.getApplicationsForManager(user.id)
    : repo.getApplicationsForClient(user.id);
  res.json({ applications: apps });
});

router.get('/:id', (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Заявка не найдена' });
  if (!canAccessApp(req.user, app)) return res.status(403).json({ error: 'Недостаточно прав' });
  res.json({ application: app });
});

router.post('/', requireRole('client'), (req, res) => {
  const { programId, formData } = req.body || {};
  if (!programId || !formData) return res.status(400).json({ error: 'Не заполнены данные заявки' });
  if (!repo.getProgramById(programId)) return res.status(404).json({ error: 'Программа не найдена' });
  const app = repo.submitApplication(req.user.id, programId, formData);
  res.status(201).json({ application: app });
});

router.post('/:id/accept', requireRole('admin'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'submitted') return res.status(409).json({ error: 'Заявка уже обработана' });
  res.json({ application: repo.acceptApplication(app.id, req.user.id, req.body?.note || '') });
});

router.post('/:id/reject', requireRole('admin'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Заявка не найдена' });
  const note = (req.body?.note || '').trim();
  if (!note) return res.status(400).json({ error: 'Укажите причину отклонения' });
  res.json({ application: repo.rejectApplication(app.id, req.user.id, note) });
});

router.post('/:id/draft-contract', requireRole('admin'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'accepted') return res.status(409).json({ error: 'Неверный статус заявки' });
  const { filename } = req.body || {};
  if (!filename) return res.status(400).json({ error: 'Не указан файл' });
  res.json({ application: repo.attachDraftContract(app.id, req.user.id, filename) });
});

router.post('/:id/signed-contract', requireRole('client'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app || app.clientId !== req.user.id) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'draft_sent') return res.status(409).json({ error: 'Неверный статус заявки' });
  const { filename } = req.body || {};
  if (!filename) return res.status(400).json({ error: 'Не указан файл' });
  res.json({ application: repo.uploadSignedContract(app.id, req.user.id, filename) });
});

router.post('/:id/samples-received', requireRole('client'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app || app.clientId !== req.user.id) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'samples_sent') return res.status(409).json({ error: 'Неверный статус заявки' });
  res.json({ application: repo.confirmSamplesReceived(app.id, req.user.id) });
});

router.post('/:id/protocol', requireRole('client'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app || app.clientId !== req.user.id) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'samples_received') return res.status(409).json({ error: 'Неверный статус заявки' });
  const { filename } = req.body || {};
  if (!filename) return res.status(400).json({ error: 'Не указан файл' });
  res.json({ application: repo.uploadProtocol(app.id, req.user.id, filename) });
});

router.post('/:id/processing', requireRole('admin'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'protocol_uploaded') return res.status(409).json({ error: 'Неверный статус заявки' });
  res.json({ application: repo.setProcessingStatus(app.id, req.user.id, req.body?.note || '') });
});

router.post('/:id/final-documents', requireRole('admin'), (req, res) => {
  const app = repo.getAppById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Заявка не найдена' });
  if (app.status !== 'processing') return res.status(409).json({ error: 'Неверный статус заявки' });
  const { conclusionUrl, reportUrl, certificateUrl } = req.body || {};
  if (!conclusionUrl || !reportUrl || !certificateUrl) return res.status(400).json({ error: 'Загрузите все документы' });
  res.json({ application: repo.uploadFinalDocuments(app.id, req.user.id, { conclusionUrl, reportUrl, certificateUrl }) });
});

module.exports = router;
