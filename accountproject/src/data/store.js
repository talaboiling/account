// src/data/store.js
import { v4 as uuidv4 } from 'uuid';

// ─── APPLICATION STATUSES ─────────────────────────────────────────────────
// Steps 1–9 are GROUP (tour-level). Steps 10–12 are INDIVIDUAL per application.
export const APPLICATION_STATUSES = {
  submitted: { label: 'Подана', color: 'yellow', step: 1 },
  accepted: { label: 'Принята', color: 'blue', step: 2 },
  draft_sent: { label: 'Драфт договора отправлен', color: 'cyan', step: 3 },
  signed: { label: 'Договор подписан', color: 'purple', step: 4 },
  active: { label: 'В действии', color: 'green', step: 5 },
  in_progress: { label: 'В работе', color: 'blue', step: 6 },
  completed: { label: 'Работа завершена', color: 'purple', step: 7 },
  samples_sent: { label: 'Образцы отправлены', color: 'cyan', step: 8 },
  samples_received: { label: 'Образцы приняты', color: 'blue', step: 9 },
  // ↓ Individual from here
  protocol_uploaded: { label: 'Протокол прикреплён', color: 'purple', step: 10 },
  processing: { label: 'Обработка протокола', color: 'yellow', step: 11 },
  finished: { label: 'Завершено', color: 'green', step: 12 },
  rejected: { label: 'Отклонена', color: 'red', step: 0 },
};

// ─── CLIENT-FACING STATUS LABELS ──────────────────────────────────────────
// Clients never see tours (their existence, numbers, or work-status
// granularity) — the tour-organization phase (active/in_progress/completed)
// is shown to clients as a single umbrella status.
const CLIENT_STATUS_OVERRIDES = {
  active: { label: 'Организация тура ППК', color: 'blue' },
  in_progress: { label: 'Организация тура ППК', color: 'blue' },
  completed: { label: 'Организация тура ППК', color: 'blue' },
  finished: { label: 'Отчёт получен', color: 'green' },
};

export function getApplicationStatusLabel(status, viewerRole) {
  if (viewerRole === 'client' && CLIENT_STATUS_OVERRIDES[status]) {
    return CLIENT_STATUS_OVERRIDES[status];
  }
  return APPLICATION_STATUSES[status] || { label: status, color: 'default' };
}

// ─── TOUR STATUSES ────────────────────────────────────────────────────────
export const TOUR_STATUSES = {
  forming: { label: 'Набор участников', color: 'yellow' },
  active: { label: 'Тур запущен', color: 'blue' },
  in_progress: { label: 'В работе', color: 'cyan' },
  completed: { label: 'Работа завершена', color: 'purple' },
  samples_sent: { label: 'Образцы отправлены', color: 'green' },
  finished: { label: 'Тур завершён', color: 'green' },
};

// ─── PROGRAMS (9 renamed programs) ────────────────────────────────────────
export const PROGRAMS = [
  { id: 'p01', code: 'ПК-ДНК-01', name: 'Определение ДНК животного в пищевых продуктах', icon: '🧬' },
  { id: 'p02', code: 'ПК-ТМ-02', name: 'Определение тяжёлых металлов в водных объектах', icon: '⚗️' },
  { id: 'p03', code: 'ПК-КФ-03', name: 'Определение кофеина в безалкогольных напитках', icon: '☕' },
  { id: 'p04', code: 'ПК-АН-04', name: 'Содержание анионов в водных объектах', icon: '💧' },
  { id: 'p05', code: 'ПК-pH-05', name: 'Определение водородного показателя в водных объектах', icon: '🔬' },
  { id: 'p06', code: 'ПК-ЖК-06', name: 'Жирнокислотный состав растительного масла', icon: '🫙' },
  { id: 'p07', code: 'ПК-КТ-07', name: 'Определение катионов в водных объектах', icon: '⚡' },
  { id: 'p08', code: 'ПК-ТМ-08', name: 'Определение тяжёлых металлов в пищевых продуктах', icon: '🧪' },
  { id: 'p09', code: 'ПК-ПР-09', name: 'Идентификация паразитов в воде', icon: '🦠' },
];

// ─── SEED USERS ───────────────────────────────────────────────────────────
const seedUsers = [
  { id: 'admin-1', role: 'admin', email: 'admin@csee.kz', password: 'Admin123!', name: 'Иванов Алексей Петрович', position: 'Главный администратор', phone: '+7 (727) 123-45-67', verified: true, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'admin-2', role: 'admin', email: 'admin2@csee.kz', password: 'Admin456!', name: 'Смирнова Елена Викторовна', position: 'Заместитель администратора', phone: '+7 (727) 123-45-68', verified: true, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'mgr-1', role: 'manager', email: 'manager1@csee.kz', password: 'Mgr123!', name: 'Петров Дмитрий Сергеевич', position: 'Заведующий лабораторией', phone: '+7 (727) 234-56-78', verified: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'mgr-2', role: 'manager', email: 'manager2@csee.kz', password: 'Mgr456!', name: 'Козлова Наталья Ивановна', position: 'Старший заведующий', phone: '+7 (727) 234-56-79', verified: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'client-1', role: 'client', email: 'client1@lab.kz', password: 'Client123!', name: 'Захаров Михаил Олегович', phone: '+7 (701) 111-22-33', orgName: 'ТОО «АналитЛаб»', verified: true, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'client-2', role: 'client', email: 'client2@lab.kz', password: 'Client456!', name: 'Морозова Светлана Дмитриевна', phone: '+7 (701) 444-55-66', orgName: 'ИП Морозова С.Д.', verified: true, createdAt: '2024-02-15T11:00:00Z' },
  { id: 'client-3', role: 'client', email: 'client3@lab.kz', password: 'Client789!', name: 'Алиев Нурлан Бекович', phone: '+7 (701) 777-88-99', orgName: 'РГП «КазЛабСтандарт»', verified: true, createdAt: '2024-02-20T10:00:00Z' },
];

// ─── SEED TOURS ───────────────────────────────────────────────────────────
// A tour groups applications of the same program together.
// Steps 1-9 operate at tour level (group notifications).
// Steps 10-12 operate individually per application.
const seedTours = [
  {
    id: 'tour-1',
    programId: 'p01',         // ДНК в пищевых продуктах
    tourNumber: 'ТУР-2024-001',
    status: 'active',
    assignedManagerId: 'mgr-1',
    taskNote: 'Провести тур проверки квалификации по определению ДНК животного в пищевых продуктах. Срок: 45 дней.',
    applicationIds: ['app-1', 'app-3'],
    timeline: [
      { status: 'forming', date: '2024-03-01T08:00:00Z', by: 'admin-1', note: 'Тур открыт для набора участников' },
      { status: 'active', date: '2024-03-06T09:00:00Z', by: 'admin-1', note: 'Тур запущен. Заведующий: Петров Д.С.' },
    ],
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-06T09:00:00Z',
  },
];

// ─── SEED APPLICATIONS ────────────────────────────────────────────────────
const seedApplications = [
  {
    id: 'app-1',
    clientId: 'client-1',
    programId: 'p01',
    tourId: 'tour-1',
    status: 'active',
    appNumber: 'ЗАЯ-2024-001',
    formData: {
      objectName: 'Мясная продукция (колбасные изделия)',
      indicators: 'ДНК свинины, ДНК говядины, ДНК птицы',
      measureRange: 'Порог обнаружения: 0.1% ДНК целевого вида',
      normDoc: 'ГОСТ Р 54374-2011, ISO 21571:2005',
      deptName: 'Лаборатория молекулярно-генетических исследований',
      accreditCert: 'KZ.I.02.1234',
      headName: 'Захаров М.О., руководитель лаборатории',
      headContact: 'г. Алматы, ул. Промышленная 5; +7 (701) 111-22-33; zakharov@analitlab.kz',
      orgDetails: 'ТОО «АналитЛаб», БИН 123456789012, г. Алматы; ИИК KZ11ABCD1234567890; Банк: АО «Казком»; БИК KZKOKZKX',
      directorName: 'Захаров М.О., директор',
    },
    assignedManagerId: 'mgr-1',
    taskNote: null,
    draftContractUrl: 'draft_contract_app1.pdf',
    signedContractUrl: 'signed_contract_app1.pdf',
    protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
    timeline: [
      { status: 'submitted', date: '2024-03-01T09:00:00Z', by: 'client-1', note: '' },
      { status: 'accepted', date: '2024-03-02T10:00:00Z', by: 'admin-1', note: 'Принята.' },
      { status: 'draft_sent', date: '2024-03-03T11:00:00Z', by: 'admin-1', note: '' },
      { status: 'signed', date: '2024-03-04T14:00:00Z', by: 'client-1', note: '' },
      { status: 'active', date: '2024-03-06T09:00:00Z', by: 'admin-1', note: 'Начата организация тура ППК.' },
    ],
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-06T09:00:00Z',
  },
  {
    id: 'app-2',
    clientId: 'client-2',
    programId: 'p04',  // анионы в воде
    tourId: null,
    status: 'submitted',
    appNumber: 'ЗАЯ-2024-002',
    formData: {
      objectName: 'Питьевая вода из централизованного водоснабжения',
      indicators: 'Хлориды, сульфаты, нитраты, нитриты, фториды',
      measureRange: 'Хлориды: 5–250 мг/л; Сульфаты: 10–500 мг/л',
      normDoc: 'ГОСТ 31940-2012, СанПиН 3.3686-21',
      deptName: 'Испытательная лаборатория вод',
      accreditCert: 'RA.RU.21АЛ43',
      headName: 'Морозова С.Д., руководитель',
      headContact: 'г. Алматы, пр. Абая 100; +7 (701) 444-55-66; morozova@lab.kz',
      orgDetails: 'ИП Морозова С.Д., БИН 234567890123, г. Алматы, пр. Абая 100',
      directorName: 'Морозова С.Д., ИП',
    },
    assignedManagerId: null, taskNote: null,
    draftContractUrl: null, signedContractUrl: null,
    protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
    timeline: [{ status: 'submitted', date: '2024-03-10T14:00:00Z', by: 'client-2', note: '' }],
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
  },
  {
    id: 'app-3',
    clientId: 'client-3',
    programId: 'p01', // also DNA — part of tour-1
    tourId: 'tour-1',
    status: 'active',
    appNumber: 'ЗАЯ-2024-003',
    formData: {
      objectName: 'Молочная продукция (сыр)',
      indicators: 'ДНК коровы, ДНК овцы, ДНК козы',
      measureRange: 'Порог обнаружения: 0.1% ДНК целевого вида',
      normDoc: 'ГОСТ Р 54374-2011',
      deptName: 'Лаборатория генетических методов',
      accreditCert: 'KZ.I.03.5678',
      headName: 'Алиев Н.Б., руководитель',
      headContact: 'г. Алматы, ул. Науки 10; +7 (701) 777-88-99; aliev@kazlab.kz',
      orgDetails: 'РГП «КазЛабСтандарт», БИН 345678901234, г. Алматы',
      directorName: 'Алиев Н.Б., директор',
    },
    assignedManagerId: 'mgr-1', taskNote: null,
    draftContractUrl: 'draft_contract_app3.pdf',
    signedContractUrl: 'signed_contract_app3.pdf',
    protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
    timeline: [
      { status: 'submitted', date: '2024-03-01T10:00:00Z', by: 'client-3', note: '' },
      { status: 'accepted', date: '2024-03-02T10:30:00Z', by: 'admin-1', note: 'Принята.' },
      { status: 'draft_sent', date: '2024-03-03T11:30:00Z', by: 'admin-1', note: '' },
      { status: 'signed', date: '2024-03-05T09:00:00Z', by: 'client-3', note: '' },
      { status: 'active', date: '2024-03-06T09:00:00Z', by: 'admin-1', note: 'Начата организация тура ППК.' },
    ],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-06T09:00:00Z',
  },
];

const seedNotifications = [
  { id: 'n1', type: 'app_submitted', targetIds: ['admin-1', 'admin-2'], relatedId: 'app-1', message: 'Новая заявка ЗАЯ-2024-001 от ТОО «АналитЛаб»', read: true, createdAt: '2024-03-01T09:00:00Z' },
  { id: 'n2', type: 'app_submitted', targetIds: ['admin-1', 'admin-2'], relatedId: 'app-3', message: 'Новая заявка ЗАЯ-2024-003 от РГП «КазЛабСтандарт»', read: true, createdAt: '2024-03-01T10:00:00Z' },
  { id: 'n3', type: 'tour_started', targetIds: ['mgr-1'], relatedId: 'tour-1', message: 'Тур ТУР-2024-001 запущен. Программа: ДНК животного в пищевых продуктах.', read: true, createdAt: '2024-03-06T09:00:00Z' },
  { id: 'n3a', type: 'status_changed', targetIds: ['client-1'], relatedId: 'app-1', message: 'Заявка ЗАЯ-2024-001: начат этап «Организация тура ППК».', read: true, createdAt: '2024-03-06T09:00:00Z' },
  { id: 'n3b', type: 'status_changed', targetIds: ['client-3'], relatedId: 'app-3', message: 'Заявка ЗАЯ-2024-003: начат этап «Организация тура ППК».', read: true, createdAt: '2024-03-06T09:00:00Z' },
  { id: 'n4', type: 'app_submitted', targetIds: ['admin-1', 'admin-2'], relatedId: 'app-2', message: 'Новая заявка ЗАЯ-2024-002 от ИП Морозова С.Д.', read: false, createdAt: '2024-03-10T14:00:00Z' },
];

// ─── STORE ────────────────────────────────────────────────────────────────
class Store {
  constructor() {
    this.users = [...seedUsers];
    this.applications = [...seedApplications];
    this.tours = [...seedTours];
    this.notifications = [...seedNotifications];
    this.programs = PROGRAMS;
    this.currentUser = null;
    this.pendingVerifications = {};
    this._listeners = [];
    this._appCounter = 4;
    this._tourCounter = 2;
  }

  subscribe(fn) { this._listeners.push(fn); return () => { this._listeners = this._listeners.filter(l => l !== fn); }; }
  notify() { this._listeners.forEach(fn => fn()); }

  // ── AUTH ──────────────────────────────────────────────────────────────
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

  // ── APPLICATIONS ──────────────────────────────────────────────────────
  submitApplication(clientId, programId, formData) {
    const year = new Date().getFullYear();
    const num = String(this._appCounter++).padStart(3, '0');
    // Auto-assign to existing forming tour for this program (or create one)
    let tour = this.tours.find(t => t.programId === programId && t.status === 'forming');
    if (!tour) {
      tour = this._createTour(programId);
    }
    const app = {
      id: uuidv4(), clientId, programId,
      tourId: tour.id,
      status: 'submitted',
      appNumber: `ЗАЯ-${year}-${num}`,
      formData,
      assignedManagerId: null, taskNote: null,
      draftContractUrl: null, signedContractUrl: null,
      protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
      timeline: [{ status: 'submitted', date: new Date().toISOString(), by: clientId, note: '' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.applications.push(app);
    tour.applicationIds.push(app.id);
    const client = this.getUserById(clientId);
    const prog = this.getProgramById(programId);
    this._notifyAdmins('app_submitted', app.id,
      `Новая заявка ${app.appNumber} от ${client?.orgName || client?.name} → Тур ${tour.tourNumber} (${prog?.name}), участников: ${tour.applicationIds.length}`);
    this.notify();
    return app;
  }

  _createTour(programId) {
    const prog = this.getProgramById(programId);
    const year = new Date().getFullYear();
    const num = String(this._tourCounter++).padStart(3, '0');
    const tour = {
      id: uuidv4(),
      programId,
      tourNumber: `ТУР-${year}-${num}`,
      status: 'forming',
      assignedManagerId: null,
      taskNote: null,
      applicationIds: [],
      timeline: [{ status: 'forming', date: new Date().toISOString(), by: 'system', note: `Тур создан для программы «${prog?.name}»` }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tours.push(tour);
    return tour;
  }

  // ── PER-APPLICATION (steps 2–4, individual contract flow) ────────────

  // Step 2: Admin accepts individual application
  acceptApplication(appId, adminId, note = '') {
    this._transitionApp(appId, 'accepted', adminId, note);
    const app = this.getAppById(appId);
    this._notifyClient(app, 'status_changed', `Ваша заявка ${app.appNumber} принята.`);
  }

  // Step 3: Admin sends draft contract to individual client
  attachDraftContract(appId, adminId, filename) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.draftContractUrl = filename;
    this._transitionApp(appId, 'draft_sent', adminId, '');
    this._notifyClient(app, 'draft_sent', `Прикреплён драфт договора по заявке ${app.appNumber}. Пожалуйста, ознакомьтесь и загрузите подписанный экземпляр.`);
  }

  // Step 4: Client uploads signed contract
  uploadSignedContract(appId, clientId, filename) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.signedContractUrl = filename;
    this._transitionApp(appId, 'signed', clientId, '');
    this._notifyAdmins('signed_contract', appId, `Клиент загрузил подписанный договор по заявке ${app.appNumber}`);
  }

  // ── TOUR-LEVEL ACTIONS (steps 5–9) ───────────────────────────────────

  // Step 5+6: Admin starts tour — assigns manager, sets all apps to active
  startTour(tourId, adminId, managerId, taskNote) {
    const tour = this.getTourById(tourId);
    if (!tour) return;
    tour.assignedManagerId = managerId;
    tour.taskNote = taskNote;
    tour.status = 'active';
    tour.updatedAt = new Date().toISOString();
    tour.timeline.push({ status: 'active', date: new Date().toISOString(), by: adminId, note: `Заведующий: ${this.getUserById(managerId)?.name}. ${taskNote}` });

    // Update all signed apps in this tour to 'active'. Clients never see
    // tours — each affected client gets a per-application notification with
    // no tour number/identifier; only the manager and admins get the
    // tour-aware notification.
    const appsInTour = this.getAppsInTour(tourId);
    const startedApps = [];
    appsInTour.forEach(app => {
      if (app.status === 'signed') {
        app.assignedManagerId = managerId;
        this._transitionApp(app.id, 'active', adminId, 'Начата организация тура ППК.');
        startedApps.push(app);
      }
    });

    startedApps.forEach(app => {
      this._notifyClient(app, 'status_changed', `Заявка ${app.appNumber}: начат этап «Организация тура ППК».`);
    });

    const prog = this.getProgramById(tour.programId);
    this._notifyUser(managerId, 'tour_started', tourId,
      `Тур ${tour.tourNumber} запущен. Программа: «${prog?.name}». Участников: ${appsInTour.length}.`);
    this._notifyAdmins('tour_started', tourId, `Тур ${tour.tourNumber} запущен. Участников: ${appsInTour.length}. Заведующий: ${this.getUserById(managerId)?.name}`);
    this.notify();
  }

  // Step 7: Manager updates tour work status
  updateTourWorkStatus(tourId, managerId, workStatus, note = '') {
    const tour = this.getTourById(tourId);
    if (!tour) return;
    tour.status = workStatus;
    tour.updatedAt = new Date().toISOString();
    tour.timeline.push({ status: workStatus, date: new Date().toISOString(), by: managerId, note });

    // Sync all apps in tour
    const appsInTour = this.getAppsInTour(tourId);
    appsInTour.forEach(app => {
      if (!['rejected', 'finished', 'protocol_uploaded', 'processing'].includes(app.status)) {
        this._transitionApp(app.id, workStatus, managerId, note);
      }
    });

    const label = TOUR_STATUSES[workStatus]?.label || workStatus;
    this._notifyAdmins('work_status', tourId, `Заведующий обновил статус тура ${tour.tourNumber}: «${label}»`);
    this.notify();
  }

  // Step 8: Admin notifies ALL clients in tour about samples being sent
  notifyTourSamplesSent(tourId, adminId, note = '') {
    const tour = this.getTourById(tourId);
    if (!tour) return;
    tour.status = 'samples_sent';
    tour.updatedAt = new Date().toISOString();
    tour.timeline.push({ status: 'samples_sent', date: new Date().toISOString(), by: adminId, note });

    const appsInTour = this.getAppsInTour(tourId);
    const prog = this.getProgramById(tour.programId);
    appsInTour.forEach(app => {
      this._transitionApp(app.id, 'samples_sent', adminId, note);
      this._notifyClient(app, 'samples_sent',
        `Образцы по заявке ${app.appNumber} (${prog?.name}) отправлены. Подтвердите получение.`);
    });

    this.notify();
  }

  // Step 9: Each client confirms receipt individually — but it's still pre-protocol
  confirmSamplesReceived(appId, clientId) {
    this._transitionApp(appId, 'samples_received', clientId, '');
    const app = this.getAppById(appId);
    this._notifyAdmins('samples_received', appId, `${this.getUserById(clientId)?.orgName || this.getUserById(clientId)?.name} подтвердил получение образцов (${app.appNumber})`);
    this.notify();
  }

  // ── INDIVIDUAL STEPS 10–12 ─────────────────────────────────────────────

  // Step 10: Client uploads protocol (individual)
  uploadProtocol(appId, clientId, filename) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.protocolUrl = filename;
    this._transitionApp(appId, 'protocol_uploaded', clientId, '');
    this._notifyAdmins('protocol_uploaded', appId, `Клиент прикрепил протокол по заявке ${app.appNumber}`);
    this.notify();
  }

  // Step 11: Admin accepts protocol for processing (individual)
  setProcessingStatus(appId, adminId, note = '') {
    this._transitionApp(appId, 'processing', adminId, note);
    const app = this.getAppById(appId);
    this._notifyClient(app, 'status_changed', `По заявке ${app.appNumber}: протокол принят в обработку.${note ? ' ' + note : ''}`);
  }

  // Step 12: Admin uploads final docs (individual)
  uploadFinalDocuments(appId, adminId, { conclusionUrl, reportUrl, certificateUrl }) {
    const app = this.getAppById(appId);
    if (!app) return;
    if (conclusionUrl) app.conclusionUrl = conclusionUrl;
    if (reportUrl) app.reportUrl = reportUrl;
    if (certificateUrl) app.certificateUrl = certificateUrl;
    this._transitionApp(appId, 'finished', adminId, '');
    this._notifyClient(app, 'finished', `По заявке ${app.appNumber} прикреплены заключение, отчёт и свидетельство. Процесс завершён.`);
  }

  // Reject individual application
  rejectApplication(appId, adminId, note) {
    this._transitionApp(appId, 'rejected', adminId, note);
    const app = this.getAppById(appId);
    // Remove from tour if present
    if (app.tourId) {
      const tour = this.getTourById(app.tourId);
      if (tour) tour.applicationIds = tour.applicationIds.filter(id => id !== appId);
    }
    this._notifyClient(app, 'status_changed', `Заявка ${app.appNumber} отклонена: ${note}`);
  }

  // ── HELPERS ──────────────────────────────────────────────────────────
  _transitionApp(appId, status, byId, note) {
    const app = this.getAppById(appId);
    if (!app) return;
    app.status = status;
    app.updatedAt = new Date().toISOString();
    app.timeline.push({ status, date: new Date().toISOString(), by: byId, note });
  }

  _notifyAdmins(type, relatedId, message) {
    const ids = this.users.filter(u => u.role === 'admin').map(u => u.id);
    this.notifications.unshift({ id: uuidv4(), type, targetIds: ids, relatedId, message, read: false, createdAt: new Date().toISOString() });
  }

  _notifyClient(app, type, message) {
    this.notifications.unshift({ id: uuidv4(), type, targetIds: [app.clientId], relatedId: app.id, message, read: false, createdAt: new Date().toISOString() });
  }

  _notifyUser(userId, type, relatedId, message) {
    this.notifications.unshift({ id: uuidv4(), type, targetIds: [userId], relatedId, message, read: false, createdAt: new Date().toISOString() });
  }

  // ── QUERIES ───────────────────────────────────────────────────────────
  getAppById(id) { return this.applications.find(a => a.id === id); }
  getTourById(id) { return this.tours.find(t => t.id === id); }
  getUserById(id) { return this.users.find(u => u.id === id); }
  getProgramById(id) { return this.programs.find(p => p.id === id); }
  getManagers() { return this.users.filter(u => u.role === 'manager'); }
  getAdmins() { return this.users.filter(u => u.role === 'admin'); }
  getClients() { return this.users.filter(u => u.role === 'client'); }

  getAppsInTour(tourId) {
    const tour = this.getTourById(tourId);
    if (!tour) return [];
    return tour.applicationIds.map(id => this.getAppById(id)).filter(Boolean);
  }

  // Tours grouped by program with participant counts
  getToursByProgram() {
    const result = {};
    this.programs.forEach(p => { result[p.id] = []; });
    this.tours.forEach(t => {
      if (result[t.programId]) result[t.programId].push(t);
    });
    return result;
  }

  getToursForManager(managerId) {
    return this.tours.filter(t => t.assignedManagerId === managerId);
  }

  getAllApplications() {
    return [...this.applications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  getApplicationsForClient(clientId) {
    return this.applications.filter(a => a.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  getApplicationsForManager(managerId) {
    // Manager sees apps in their assigned tours
    const tourIds = this.tours.filter(t => t.assignedManagerId === managerId).map(t => t.id);
    return this.applications.filter(a => tourIds.includes(a.tourId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
