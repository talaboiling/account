// src/data/store.js
import { v4 as uuidv4 } from 'uuid';

// ─── APPLICATION STATUSES (match sequence diagram steps) ──────────────────
// draft       → client saved but not submitted
// submitted   → client submitted, waiting admin review        [step 1]
// accepted    → admin accepted, notified client               [step 2]
// draft_sent  → admin attached draft contract to client       [step 3]
// signed      → client uploaded signed contract               [step 4]
// active      → admin assigned manager, set active            [steps 5-6]
// in_progress → manager set work status "в работе"            [step 7a]
// completed   → manager set work status "завершён"            [step 7b]
// samples_sent→ admin notified client about sending samples   [step 8]
// samples_received → client confirmed receipt of samples      [step 9]
// protocol_uploaded → client uploaded protocol                [step 10]
// processing  → admin set "обработка протокола"               [step 11]
// finished    → admin uploaded conclusion+report+certificate  [step 12]
// rejected    → admin rejected at any early stage

export const APPLICATION_STATUSES = {
  submitted:          { label: 'Подана',                    color: 'yellow',  step: 1  },
  accepted:           { label: 'Принята',                   color: 'blue',    step: 2  },
  draft_sent:         { label: 'Драфт договора отправлен',  color: 'cyan',    step: 3  },
  signed:             { label: 'Договор подписан',          color: 'purple',  step: 4  },
  active:             { label: 'В действии',                color: 'green',   step: 5  },
  in_progress:        { label: 'В работе',                  color: 'blue',    step: 6  },
  completed:          { label: 'Работа завершена',          color: 'purple',  step: 7  },
  samples_sent:       { label: 'Образцы отправлены',        color: 'cyan',    step: 8  },
  samples_received:   { label: 'Образцы приняты',           color: 'blue',    step: 9  },
  protocol_uploaded:  { label: 'Протокол прикреплён',       color: 'purple',  step: 10 },
  processing:         { label: 'Обработка протокола',       color: 'yellow',  step: 11 },
  finished:           { label: 'Завершено',                 color: 'green',   step: 12 },
  rejected:           { label: 'Отклонена',                 color: 'red',     step: 0  },
};

// ─── PROGRAMS ─────────────────────────────────────────────────────────────
export const PROGRAMS = [
  { id: 'p01', code: 'ПК-ХА-01',  name: 'Химический анализ воды',                 icon: '💧' },
  { id: 'p02', code: 'ПК-МБ-02',  name: 'Микробиологические исследования',         icon: '🦠' },
  { id: 'p03', code: 'ПК-ПП-03',  name: 'Проверка пищевых продуктов',              icon: '🥗' },
  { id: 'p04', code: 'ПК-РА-04',  name: 'Радиологическое обследование',            icon: '☢️' },
  { id: 'p05', code: 'ПК-ЭМ-05',  name: 'Экологический мониторинг',                icon: '🌿' },
  { id: 'p06', code: 'ПК-ВМ-06',  name: 'Физические измерения (шум, вибрация)',    icon: '📡' },
  { id: 'p07', code: 'ПК-СЭЭ-07', name: 'Санитарно-эпидемиологическая экспертиза',icon: '🔬' },
  { id: 'p08', code: 'ПК-ГР-08',  name: 'Анализ грунта и почв',                   icon: '🪨' },
  { id: 'p09', code: 'ПК-ВЗ-09',  name: 'Анализ воздуха рабочей зоны',            icon: '💨' },
  { id: 'p10', code: 'ПК-ОУТ-10', name: 'Оценка условий труда',                   icon: '👷' },
];

// ─── SEED USERS ────────────────────────────────────────────────────────────
const seedUsers = [
  { id: 'admin-1', role: 'admin',   email: 'admin@csee.kz',    password: 'Admin123!', name: 'Иванов Алексей Петрович',      position: 'Главный администратор',    phone: '+7 (727) 123-45-67', verified: true, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'admin-2', role: 'admin',   email: 'admin2@csee.kz',   password: 'Admin456!', name: 'Смирнова Елена Викторовна',    position: 'Заместитель администратора',phone: '+7 (727) 123-45-68', verified: true, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'mgr-1',   role: 'manager', email: 'manager1@csee.kz', password: 'Mgr123!',  name: 'Петров Дмитрий Сергеевич',     position: 'Заведующий лабораторией',  phone: '+7 (727) 234-56-78', verified: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'mgr-2',   role: 'manager', email: 'manager2@csee.kz', password: 'Mgr456!',  name: 'Козлова Наталья Ивановна',     position: 'Старший заведующий',       phone: '+7 (727) 234-56-79', verified: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'client-1',role: 'client',  email: 'client1@lab.kz',   password: 'Client123!',name: 'Захаров Михаил Олегович',     phone: '+7 (701) 111-22-33', orgName: 'ТОО «АналитЛаб»',    verified: true, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'client-2',role: 'client',  email: 'client2@lab.kz',   password: 'Client456!',name: 'Морозова Светлана Дмитриевна',phone: '+7 (701) 444-55-66', orgName: 'ИП Морозова С.Д.',   verified: true, createdAt: '2024-02-15T11:00:00Z' },
];

// ─── SEED APPLICATIONS ─────────────────────────────────────────────────────
const seedApplications = [
  {
    id: 'app-1',
    clientId: 'client-1',
    programId: 'p03',
    status: 'active',
    appNumber: 'ЗАЯ-2024-001',
    formData: {
      objectName:        'Молочная продукция (молоко пастеризованное)',
      indicators:        'Органолептические показатели, КМАФАнМ, БГКП, Жирность',
      measureRange:      'КМАФАнМ: 1×10²–1×10⁶ КОЕ/г; Жирность: 1–6%',
      normDoc:           'ГОСТ 31450-2013, СанПиН 3.2.3685-21',
      deptName:          'Лаборатория контроля качества',
      accreditCert:      'KZ.I.02.1234',
      headName:          'Захаров Михаил Олегович, руководитель лаборатории',
      headContact:       'г. Алматы, ул. Промышленная 5; +7 (701) 111-22-33; m.zakharov@analitlab.kz',
      orgDetails:        'ТОО «АналитЛаб», БИН 123456789012, г. Алматы, ул. Промышленная 5; ИИК KZ11ABCD1234567890; Банк: АО «Казком»; БИК KZKOKZKX',
      directorName:      'Захаров М.О., директор',
    },
    assignedManagerId: 'mgr-1',
    taskNote: 'Провести проверку квалификации по программе ПК-ПП-03. Срок: 30 дней.',
    draftContractUrl:  'draft_contract_app1.pdf',
    signedContractUrl: 'signed_contract_app1.pdf',
    protocolUrl: null,
    conclusionUrl: null, reportUrl: null, certificateUrl: null,
    timeline: [
      { status: 'submitted',  date: '2024-03-01T09:00:00Z', by: 'client-1',  note: '' },
      { status: 'accepted',   date: '2024-03-02T10:00:00Z', by: 'admin-1',   note: 'Заявка соответствует требованиям программы.' },
      { status: 'draft_sent', date: '2024-03-03T11:00:00Z', by: 'admin-1',   note: '' },
      { status: 'signed',     date: '2024-03-04T14:00:00Z', by: 'client-1',  note: '' },
      { status: 'active',     date: '2024-03-05T09:00:00Z', by: 'admin-1',   note: 'Задание передано заведующему Петрову Д.С.' },
    ],
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-05T09:00:00Z',
  },
  {
    id: 'app-2',
    clientId: 'client-2',
    programId: 'p01',
    status: 'submitted',
    appNumber: 'ЗАЯ-2024-002',
    formData: {
      objectName:   'Питьевая вода из централизованного водоснабжения',
      indicators:   'pH, мутность, цветность, нитраты, нитриты, железо общее',
      measureRange: 'pH: 6–9; мутность: 0.5–4 ЕМФ; нитраты: 1–50 мг/л',
      normDoc:      'СанПиН 3.3686-21, ГОСТ Р 51232',
      deptName:     'Испытательная лаборатория вод',
      accreditCert: 'Аттестат №RA.RU.21АЛ43',
      headName:     'Морозова Светлана Дмитриевна, руководитель',
      headContact:  'г. Алматы, пр. Абая 100; +7 (701) 444-55-66; s.morozova@lab.kz',
      orgDetails:   'ИП Морозова С.Д., БИН 234567890123, г. Алматы, пр. Абая 100',
      directorName: 'Морозова С.Д., ИП',
    },
    assignedManagerId: null,
    taskNote: null,
    draftContractUrl: null, signedContractUrl: null,
    protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
    timeline: [
      { status: 'submitted', date: '2024-03-10T14:00:00Z', by: 'client-2', note: '' },
    ],
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
  },
];

const seedNotifications = [
  { id: 'n1', type: 'app_submitted',  targetIds: ['admin-1','admin-2'], relatedId: 'app-1', message: 'Новая заявка ЗАЯ-2024-001 от ТОО «АналитЛаб»', read: true,  createdAt: '2024-03-01T09:00:00Z' },
  { id: 'n2', type: 'status_changed', targetIds: ['client-1'],          relatedId: 'app-1', message: 'Статус заявки ЗАЯ-2024-001 изменён: «Принята»',  read: true,  createdAt: '2024-03-02T10:00:00Z' },
  { id: 'n3', type: 'draft_sent',     targetIds: ['client-1'],          relatedId: 'app-1', message: 'Прикреплён драфт договора по заявке ЗАЯ-2024-001', read: true, createdAt: '2024-03-03T11:00:00Z' },
  { id: 'n4', type: 'app_submitted',  targetIds: ['admin-1','admin-2'], relatedId: 'app-2', message: 'Новая заявка ЗАЯ-2024-002 от ИП Морозова С.Д.',   read: false, createdAt: '2024-03-10T14:00:00Z' },
];

// ─── STORE ─────────────────────────────────────────────────────────────────
class Store {
  constructor() {
    this.users         = [...seedUsers];
    this.applications  = [...seedApplications];
    this.notifications = [...seedNotifications];
    this.programs      = PROGRAMS;
    this.currentUser   = null;
    this.pendingVerifications = {};
    this._listeners    = [];
    this._appCounter   = 3;
  }

  subscribe(fn) { this._listeners.push(fn); return () => { this._listeners = this._listeners.filter(l => l !== fn); }; }
  notify()      { this._listeners.forEach(fn => fn()); }

  // ── AUTH ────────────────────────────────────────────────────────────────
  login(email, password) {
    const u = this.users.find(u => u.email === email && u.password === password);
    if (!u) return { error: 'Неверный email или пароль' };
    if (u.role === 'client' && !u.verified) return { error: 'Email не подтверждён' };
    this.currentUser = u;
    this.notify();
    return { user: u };
  }
  logout() { this.currentUser = null; this.notify(); }

  registerClient(data) {
    if (this.users.find(u => u.email === data.email)) return { error: 'Email уже зарегистрирован' };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const user = { id: uuidv4(), role: 'client', ...data, verified: false, createdAt: new Date().toISOString() };
    this.users.push(user);
    this.pendingVerifications[data.email] = code;
    this.notify();
    return { verificationCode: code };
  }

  verifyEmail(email, code) {
    if (this.pendingVerifications[email] !== code) return { error: 'Неверный код' };
    const u = this.users.find(u => u.email === email);
    if (u) { u.verified = true; delete this.pendingVerifications[email]; }
    this.notify();
    return { success: true };
  }

  // ── APPLICATIONS ────────────────────────────────────────────────────────
  submitApplication(clientId, programId, formData) {
    const prog = this.programs.find(p => p.id === programId);
    const year = new Date().getFullYear();
    const num  = String(this._appCounter++).padStart(3, '0');
    const app  = {
      id: uuidv4(), clientId, programId, status: 'submitted',
      appNumber: `ЗАЯ-${year}-${num}`,
      formData,
      assignedManagerId: null, taskNote: null,
      draftContractUrl: null, signedContractUrl: null,
      protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
      timeline: [{ status: 'submitted', date: new Date().toISOString(), by: clientId, note: '' }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    this.applications.push(app);
    const client = this.getUserById(clientId);
    this._notifyAdmins('app_submitted', app.id, `Новая заявка ${app.appNumber} от ${client?.orgName || client?.name}`);
    this.notify();
    return app;
  }

  // Step 2: Admin accepts
  acceptApplication(appId, adminId, note = '') {
    this._transition(appId, 'accepted', adminId, note);
    const app = this.getAppById(appId);
    this._notifyClient(app, 'status_changed', `Ваша заявка ${app.appNumber} принята к рассмотрению`);
  }

  // Step 3: Admin attaches draft contract
  attachDraftContract(appId, adminId, filename) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.draftContractUrl = filename;
    this._transition(appId, 'draft_sent', adminId, '');
    this._notifyClient(app, 'draft_sent', `Прикреплён драфт договора по заявке ${app.appNumber}`);
  }

  // Step 4: Client uploads signed contract
  uploadSignedContract(appId, clientId, filename) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.signedContractUrl = filename;
    this._transition(appId, 'signed', clientId, '');
    this._notifyAdmins('signed_contract', appId, `Клиент загрузил подписанный договор по заявке ${app.appNumber}`);
  }

  // Step 5+6: Admin assigns manager + task + sets active
  assignManagerAndActivate(appId, adminId, managerId, taskNote) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.assignedManagerId = managerId;
    app.taskNote = taskNote;
    this._transition(appId, 'active', adminId, `Задание передано: ${taskNote}`);
    const mgr = this.getUserById(managerId);
    this._notifyUser(managerId, 'task_assigned', appId, `Вам назначено задание по заявке ${app.appNumber}`);
    this._notifyClient(app, 'status_changed', `Заявка ${app.appNumber} перешла в статус «В действии»`);
  }

  // Step 7: Manager updates work status
  updateWorkStatus(appId, managerId, workStatus, note = '') {
    // workStatus: 'in_progress' | 'completed'
    this._transition(appId, workStatus, managerId, note);
    const app = this.getAppById(appId);
    const label = APPLICATION_STATUSES[workStatus]?.label || workStatus;
    this._notifyAdmins('work_status', appId, `Заведующий обновил статус по заявке ${app.appNumber}: «${label}»`);
  }

  // Step 8: Admin notifies client about sending samples
  notifySamplesSent(appId, adminId, note = '') {
    this._transition(appId, 'samples_sent', adminId, note);
    const app = this.getAppById(appId);
    this._notifyClient(app, 'samples_sent', `По заявке ${app.appNumber}: образцы отправлены. Подтвердите получение.`);
  }

  // Step 9: Client confirms receipt of samples
  confirmSamplesReceived(appId, clientId) {
    this._transition(appId, 'samples_received', clientId, '');
    const app = this.getAppById(appId);
    this._notifyAdmins('samples_received', appId, `Клиент подтвердил получение образцов по заявке ${app.appNumber}`);
  }

  // Step 10: Client uploads protocol
  uploadProtocol(appId, clientId, filename) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.protocolUrl = filename;
    this._transition(appId, 'protocol_uploaded', clientId, '');
    this._notifyAdmins('protocol_uploaded', appId, `Клиент прикрепил протокол по заявке ${app.appNumber}`);
  }

  // Step 11: Admin sets protocol processing status
  setProcessingStatus(appId, adminId, note = '') {
    this._transition(appId, 'processing', adminId, note);
    const app = this.getAppById(appId);
    this._notifyClient(app, 'status_changed', `По заявке ${app.appNumber}: протокол принят в обработку`);
  }

  // Step 12: Admin uploads final documents
  uploadFinalDocuments(appId, adminId, { conclusionUrl, reportUrl, certificateUrl }) {
    const app = this.getAppById(appId);
    if (!app) return;
    if (conclusionUrl)   app.conclusionUrl  = conclusionUrl;
    if (reportUrl)       app.reportUrl      = reportUrl;
    if (certificateUrl)  app.certificateUrl = certificateUrl;
    this._transition(appId, 'finished', adminId, '');
    this._notifyClient(app, 'finished', `По заявке ${app.appNumber} прикреплены заключение, отчёт и свидетельство`);
  }

  // Reject at any stage
  rejectApplication(appId, adminId, note) {
    this._transition(appId, 'rejected', adminId, note);
    const app = this.getAppById(appId);
    this._notifyClient(app, 'status_changed', `Заявка ${app.appNumber} отклонена: ${note}`);
  }

  // ── HELPERS ─────────────────────────────────────────────────────────────
  _transition(appId, status, byId, note) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.status = status;
    app.updatedAt = new Date().toISOString();
    app.timeline.push({ status, date: new Date().toISOString(), by: byId, note });
    this.notify();
  }

  _notifyAdmins(type, relatedId, message) {
    const adminIds = this.users.filter(u => u.role === 'admin').map(u => u.id);
    const notif = { id: uuidv4(), type, targetIds: adminIds, relatedId, message, read: false, createdAt: new Date().toISOString() };
    this.notifications.unshift(notif);
  }

  _notifyClient(app, type, message) {
    const notif = { id: uuidv4(), type, targetIds: [app.clientId], relatedId: app.id, message, read: false, createdAt: new Date().toISOString() };
    this.notifications.unshift(notif);
  }

  _notifyUser(userId, type, relatedId, message) {
    const notif = { id: uuidv4(), type, targetIds: [userId], relatedId, message, read: false, createdAt: new Date().toISOString() };
    this.notifications.unshift(notif);
  }

  // ── QUERIES ─────────────────────────────────────────────────────────────
  getAppById(id)              { return this.applications.find(a => a.id === id); }
  getUserById(id)             { return this.users.find(u => u.id === id); }
  getProgramById(id)          { return this.programs.find(p => p.id === id); }
  getManagers()               { return this.users.filter(u => u.role === 'manager'); }
  getAdmins()                 { return this.users.filter(u => u.role === 'admin'); }
  getClients()                { return this.users.filter(u => u.role === 'client'); }

  getAllApplications() {
    return [...this.applications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  getApplicationsForClient(clientId) {
    return this.applications.filter(a => a.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  // Manager sees only apps assigned to them
  getApplicationsForManager(managerId) {
    return this.applications.filter(a => a.assignedManagerId === managerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getNotificationsForUser(userId) {
    return this.notifications.filter(n => n.targetIds.includes(userId));
  }
  getUnreadCount(userId) {
    return this.notifications.filter(n => n.targetIds.includes(userId) && !n.read).length;
  }
  markNotificationRead(id) {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.read = true;
    this.notify();
  }
  markAllRead(userId) {
    this.notifications.filter(n => n.targetIds.includes(userId)).forEach(n => n.read = true);
    this.notify();
  }
}

export const store = new Store();
