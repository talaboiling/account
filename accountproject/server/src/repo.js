const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { toPublicUser } = require('./auth');

const now = () => new Date().toISOString();

// ── Serialization ──────────────────────────────────────────────────────

function serializeApp(row) {
  if (!row) return null;
  const timeline = db.prepare(
    'SELECT status, date, by_user AS by, note FROM application_timeline WHERE application_id = ? ORDER BY seq ASC'
  ).all(row.id);
  return {
    id: row.id,
    clientId: row.client_id,
    programId: row.program_id,
    tourId: row.tour_id,
    status: row.status,
    appNumber: row.app_number,
    formData: JSON.parse(row.form_data),
    assignedManagerId: row.assigned_manager_id,
    taskNote: row.task_note,
    draftContractUrl: row.draft_contract_url,
    signedContractUrl: row.signed_contract_url,
    protocolUrl: row.protocol_url,
    conclusionUrl: row.conclusion_url,
    reportUrl: row.report_url,
    certificateUrl: row.certificate_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline,
  };
}

function serializeTour(row) {
  if (!row) return null;
  const timeline = db.prepare(
    'SELECT status, date, by_user AS by, note FROM tour_timeline WHERE tour_id = ? ORDER BY seq ASC'
  ).all(row.id);
  const applicationIds = db.prepare(
    'SELECT id FROM applications WHERE tour_id = ? ORDER BY created_at ASC'
  ).all(row.id).map(r => r.id);
  return {
    id: row.id,
    programId: row.program_id,
    tourNumber: row.tour_number,
    status: row.status,
    assignedManagerId: row.assigned_manager_id,
    taskNote: row.task_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline,
    applicationIds,
  };
}

function serializeNotification(row) {
  const targetIds = db.prepare('SELECT user_id FROM notification_targets WHERE notification_id = ?')
    .all(row.id).map(r => r.user_id);
  return {
    id: row.id,
    type: row.type,
    relatedId: row.related_id,
    message: row.message,
    read: !!row.read,
    createdAt: row.created_at,
    targetIds,
  };
}

// ── Queries ─────────────────────────────────────────────────────────────

const getUserRow = id => db.prepare('SELECT * FROM users WHERE id = ?').get(id);
const getUserById = id => toPublicUser(getUserRow(id));
const getAllUsers = () => db.prepare('SELECT * FROM users ORDER BY created_at ASC').all().map(toPublicUser);
const getProgramById = id => db.prepare('SELECT * FROM programs WHERE id = ?').get(id);
const getAllPrograms = () => db.prepare('SELECT * FROM programs ORDER BY id ASC').all();

const getAppById = id => serializeApp(db.prepare('SELECT * FROM applications WHERE id = ?').get(id));
const getTourById = id => serializeTour(db.prepare('SELECT * FROM tours WHERE id = ?').get(id));

const getAllApplications = () =>
  db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all().map(serializeApp);

const getApplicationsForClient = clientId =>
  db.prepare('SELECT * FROM applications WHERE client_id = ? ORDER BY created_at DESC').all(clientId).map(serializeApp);

const getApplicationsForManager = managerId => {
  const tourIds = db.prepare('SELECT id FROM tours WHERE assigned_manager_id = ?').all(managerId).map(r => r.id);
  if (tourIds.length === 0) return [];
  const placeholders = tourIds.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM applications WHERE tour_id IN (${placeholders}) ORDER BY created_at DESC`)
    .all(...tourIds).map(serializeApp);
};

const getAllTours = () => db.prepare('SELECT * FROM tours ORDER BY created_at DESC').all().map(serializeTour);

const getAppsInTour = tourId =>
  db.prepare('SELECT * FROM applications WHERE tour_id = ? ORDER BY created_at ASC').all(tourId).map(serializeApp);

const getNotificationsForUser = userId => {
  const rows = db.prepare(`
    SELECT n.* FROM notifications n
    JOIN notification_targets t ON t.notification_id = n.id
    WHERE t.user_id = ?
    ORDER BY n.created_at DESC
  `).all(userId);
  return rows.map(serializeNotification);
};

const getAllNotifications = () =>
  db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all().map(serializeNotification);

const getUnreadCount = userId => db.prepare(`
  SELECT COUNT(*) AS n FROM notifications n
  JOIN notification_targets t ON t.notification_id = n.id
  WHERE t.user_id = ? AND n.read = 0
`).get(userId).n;

// ── Notifications ──────────────────────────────────────────────────────

function createNotification(type, relatedId, message, targetIds) {
  const id = uuidv4();
  db.prepare('INSERT INTO notifications (id, type, related_id, message, read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
    .run(id, type, relatedId, message, now());
  const insertTarget = db.prepare('INSERT INTO notification_targets (notification_id, user_id) VALUES (?, ?)');
  targetIds.forEach(uid => insertTarget.run(id, uid));
  return id;
}

const notifyAdmins = (type, relatedId, message) => {
  const adminIds = db.prepare("SELECT id FROM users WHERE role = 'admin'").all().map(r => r.id);
  createNotification(type, relatedId, message, adminIds);
};

const notifyClient = (app, type, message) => createNotification(type, app.id, message, [app.clientId]);
const notifyUser = (userId, type, relatedId, message) => createNotification(type, relatedId, message, [userId]);

function markNotificationRead(id, userId) {
  const belongs = db.prepare('SELECT 1 FROM notification_targets WHERE notification_id = ? AND user_id = ?').get(id, userId);
  if (!belongs) return false;
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
  return true;
}

function markAllRead(userId) {
  db.prepare(`
    UPDATE notifications SET read = 1
    WHERE id IN (SELECT notification_id FROM notification_targets WHERE user_id = ?)
  `).run(userId);
}

// ── Counters ────────────────────────────────────────────────────────────

function nextCounter(key) {
  const row = db.prepare('SELECT value FROM counters WHERE key = ?').get(key);
  const value = row ? row.value : 1;
  db.prepare('INSERT INTO counters (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?')
    .run(key, value + 1, value + 1);
  return value;
}

// ── Application lifecycle ──────────────────────────────────────────────

function transitionApp(appId, status, byId, note) {
  db.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?').run(status, now(), appId);
  const seq = db.prepare('SELECT COUNT(*) AS n FROM application_timeline WHERE application_id = ?').get(appId).n;
  db.prepare('INSERT INTO application_timeline (application_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, ?)')
    .run(appId, status, now(), byId, note || '', seq);
}

function createTour(programId) {
  const prog = getProgramById(programId);
  const year = new Date().getFullYear();
  const num = String(nextCounter('tour')).padStart(3, '0');
  const id = uuidv4();
  const ts = now();
  db.prepare(`
    INSERT INTO tours (id, program_id, tour_number, status, assigned_manager_id, task_note, created_at, updated_at)
    VALUES (?, ?, ?, 'forming', NULL, NULL, ?, ?)
  `).run(id, programId, `ТУР-${year}-${num}`, ts, ts);
  db.prepare('INSERT INTO tour_timeline (tour_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, 0)')
    .run(id, 'forming', ts, 'system', `Тур создан для программы «${prog?.name}»`);
  return getTourById(id);
}

const submitApplication = db.transaction((clientId, programId, formData) => {
  const year = new Date().getFullYear();
  const num = String(nextCounter('app')).padStart(3, '0');
  let tour = db.prepare("SELECT * FROM tours WHERE program_id = ? AND status = 'forming'").get(programId);
  tour = tour ? serializeTour(tour) : createTour(programId);

  const id = uuidv4();
  const ts = now();
  const appNumber = `ЗАЯ-${year}-${num}`;
  db.prepare(`
    INSERT INTO applications (
      id, client_id, program_id, tour_id, status, app_number, form_data,
      assigned_manager_id, task_note, draft_contract_url, signed_contract_url,
      protocol_url, conclusion_url, report_url, certificate_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'submitted', ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?)
  `).run(id, clientId, programId, tour.id, appNumber, JSON.stringify(formData), ts, ts);
  db.prepare('INSERT INTO application_timeline (application_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, 0)')
    .run(id, 'submitted', ts, clientId, '');

  const client = getUserById(clientId);
  const prog = getProgramById(programId);
  const participantCount = db.prepare('SELECT COUNT(*) AS n FROM applications WHERE tour_id = ?').get(tour.id).n;
  notifyAdmins('app_submitted', id,
    `Новая заявка ${appNumber} от ${client?.orgName || client?.name} → Тур ${tour.tourNumber} (${prog?.name}), участников: ${participantCount}`);

  return getAppById(id);
});

function acceptApplication(appId, adminId, note) {
  transitionApp(appId, 'accepted', adminId, note);
  const app = getAppById(appId);
  notifyClient(app, 'status_changed', `Ваша заявка ${app.appNumber} принята.`);
  return app;
}

function attachDraftContract(appId, adminId, filename) {
  db.prepare('UPDATE applications SET draft_contract_url = ? WHERE id = ?').run(filename, appId);
  transitionApp(appId, 'draft_sent', adminId, '');
  const app = getAppById(appId);
  notifyClient(app, 'draft_sent', `Прикреплён драфт договора по заявке ${app.appNumber}. Пожалуйста, ознакомьтесь и загрузите подписанный экземпляр.`);
  return app;
}

function uploadSignedContract(appId, clientId, filename) {
  db.prepare('UPDATE applications SET signed_contract_url = ? WHERE id = ?').run(filename, appId);
  transitionApp(appId, 'signed', clientId, '');
  const app = getAppById(appId);
  notifyAdmins('signed_contract', appId, `Клиент загрузил подписанный договор по заявке ${app.appNumber}`);
  return app;
}

const startTour = db.transaction((tourId, adminId, managerId, taskNote) => {
  const manager = getUserById(managerId);
  db.prepare("UPDATE tours SET assigned_manager_id = ?, task_note = ?, status = 'active', updated_at = ? WHERE id = ?")
    .run(managerId, taskNote, now(), tourId);
  let tour = getTourById(tourId);
  const seq = db.prepare('SELECT COUNT(*) AS n FROM tour_timeline WHERE tour_id = ?').get(tourId).n;
  db.prepare('INSERT INTO tour_timeline (tour_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, ?)')
    .run(tourId, 'active', now(), adminId, `Заведующий: ${manager?.name}. ${taskNote}`, seq);

  // Clients never see tours — each affected client gets a per-application
  // notification with no tour number/identifier; only the manager and
  // admins get the tour-aware notification.
  const appsInTour = getAppsInTour(tourId);
  const startedApps = [];
  appsInTour.forEach(app => {
    if (app.status === 'signed') {
      db.prepare('UPDATE applications SET assigned_manager_id = ? WHERE id = ?').run(managerId, app.id);
      transitionApp(app.id, 'active', adminId, 'Начата организация тура ППК.');
      startedApps.push(app);
    }
  });

  startedApps.forEach(app => {
    notifyClient(app, 'status_changed', `Заявка ${app.appNumber}: начат этап «Организация тура ППК».`);
  });

  const prog = getProgramById(tour.programId);
  notifyUser(managerId, 'tour_started', tourId,
    `Тур ${tour.tourNumber} запущен. Программа: «${prog?.name}». Участников: ${appsInTour.length}.`);
  notifyAdmins('tour_started', tourId, `Тур ${tour.tourNumber} запущен. Участников: ${appsInTour.length}. Заведующий: ${manager?.name}`);

  return getTourById(tourId);
});

function updateTourWorkStatus(tourId, managerId, workStatus, note) {
  db.prepare('UPDATE tours SET status = ?, updated_at = ? WHERE id = ?').run(workStatus, now(), tourId);
  const seq = db.prepare('SELECT COUNT(*) AS n FROM tour_timeline WHERE tour_id = ?').get(tourId).n;
  db.prepare('INSERT INTO tour_timeline (tour_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, ?)')
    .run(tourId, workStatus, now(), managerId, note || '', seq);

  const appsInTour = getAppsInTour(tourId);
  const skip = ['rejected', 'finished', 'protocol_uploaded', 'processing'];
  appsInTour.forEach(app => {
    if (!skip.includes(app.status)) transitionApp(app.id, workStatus, managerId, note);
  });

  const tour = getTourById(tourId);
  notifyAdmins('work_status', tourId, `Заведующий обновил статус тура ${tour.tourNumber}: «${workStatus}»`);
  return tour;
}

function notifyTourSamplesSent(tourId, adminId, note) {
  db.prepare("UPDATE tours SET status = 'samples_sent', updated_at = ? WHERE id = ?").run(now(), tourId);
  const seq = db.prepare('SELECT COUNT(*) AS n FROM tour_timeline WHERE tour_id = ?').get(tourId).n;
  db.prepare('INSERT INTO tour_timeline (tour_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, ?)')
    .run(tourId, 'samples_sent', now(), adminId, note || '', seq);

  const appsInTour = getAppsInTour(tourId);
  const tour = getTourById(tourId);
  const prog = getProgramById(tour.programId);
  appsInTour.forEach(app => {
    transitionApp(app.id, 'samples_sent', adminId, note);
    notifyClient(app, 'samples_sent',
      `Образцы по заявке ${app.appNumber} (${prog?.name}) отправлены. Подтвердите получение.`);
  });

  return tour;
}

function confirmSamplesReceived(appId, clientId) {
  transitionApp(appId, 'samples_received', clientId, '');
  const app = getAppById(appId);
  const client = getUserById(clientId);
  notifyAdmins('samples_received', appId, `${client?.orgName || client?.name} подтвердил получение образцов (${app.appNumber})`);
  return app;
}

function uploadProtocol(appId, clientId, filename) {
  db.prepare('UPDATE applications SET protocol_url = ? WHERE id = ?').run(filename, appId);
  transitionApp(appId, 'protocol_uploaded', clientId, '');
  const app = getAppById(appId);
  notifyAdmins('protocol_uploaded', appId, `Клиент прикрепил протокол по заявке ${app.appNumber}`);
  return app;
}

function setProcessingStatus(appId, adminId, note) {
  transitionApp(appId, 'processing', adminId, note);
  const app = getAppById(appId);
  notifyClient(app, 'status_changed', `По заявке ${app.appNumber}: протокол принят в обработку.${note ? ' ' + note : ''}`);
  return app;
}

function uploadFinalDocuments(appId, adminId, { conclusionUrl, reportUrl, certificateUrl }) {
  const sets = [];
  const params = [];
  if (conclusionUrl) { sets.push('conclusion_url = ?'); params.push(conclusionUrl); }
  if (reportUrl) { sets.push('report_url = ?'); params.push(reportUrl); }
  if (certificateUrl) { sets.push('certificate_url = ?'); params.push(certificateUrl); }
  if (sets.length) db.prepare(`UPDATE applications SET ${sets.join(', ')} WHERE id = ?`).run(...params, appId);
  transitionApp(appId, 'finished', adminId, '');
  const app = getAppById(appId);
  notifyClient(app, 'finished', `По заявке ${app.appNumber} прикреплены заключение, отчёт и свидетельство. Процесс завершён.`);
  return app;
}

function rejectApplication(appId, adminId, note) {
  transitionApp(appId, 'rejected', adminId, note);
  const app = getAppById(appId);
  notifyClient(app, 'status_changed', `Заявка ${app.appNumber} отклонена: ${note}`);
  return app;
}

module.exports = {
  getUserRow, getUserById, getAllUsers, getProgramById, getAllPrograms,
  getAppById, getTourById, getAllApplications, getApplicationsForClient, getApplicationsForManager,
  getAllTours, getAppsInTour,
  getNotificationsForUser, getAllNotifications, getUnreadCount, markNotificationRead, markAllRead,
  submitApplication, acceptApplication, attachDraftContract, uploadSignedContract,
  startTour, updateTourWorkStatus, notifyTourSamplesSent, confirmSamplesReceived,
  uploadProtocol, setProcessingStatus, uploadFinalDocuments, rejectApplication,
};
