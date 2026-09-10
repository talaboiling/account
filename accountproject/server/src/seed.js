const bcrypt = require('bcryptjs');
const db = require('./db');

const PROGRAMS = [
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

const seedUsers = [
  { id: 'admin-1', role: 'admin', email: 'admin@csee.kz', password: 'Admin123!', name: 'Иванов Алексей Петрович', position: 'Главный администратор', phone: '+7 (727) 123-45-67', verified: 1, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'admin-2', role: 'admin', email: 'admin2@csee.kz', password: 'Admin456!', name: 'Смирнова Елена Викторовна', position: 'Заместитель администратора', phone: '+7 (727) 123-45-68', verified: 1, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'mgr-1', role: 'manager', email: 'manager1@csee.kz', password: 'Mgr123!', name: 'Петров Дмитрий Сергеевич', position: 'Заведующий лабораторией', phone: '+7 (727) 234-56-78', verified: 1, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'mgr-2', role: 'manager', email: 'manager2@csee.kz', password: 'Mgr456!', name: 'Козлова Наталья Ивановна', position: 'Старший заведующий', phone: '+7 (727) 234-56-79', verified: 1, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'client-1', role: 'client', email: 'client1@lab.kz', password: 'Client123!', name: 'Захаров Михаил Олегович', phone: '+7 (701) 111-22-33', orgName: 'ТОО «АналитЛаб»', verified: 1, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'client-2', role: 'client', email: 'client2@lab.kz', password: 'Client456!', name: 'Морозова Светлана Дмитриевна', phone: '+7 (701) 444-55-66', orgName: 'ИП Морозова С.Д.', verified: 1, createdAt: '2024-02-15T11:00:00Z' },
  { id: 'client-3', role: 'client', email: 'client3@lab.kz', password: 'Client789!', name: 'Алиев Нурлан Бекович', phone: '+7 (701) 777-88-99', orgName: 'РГП «КазЛабСтандарт»', verified: 1, createdAt: '2024-02-20T10:00:00Z' },
];

const seedTours = [
  {
    id: 'tour-1', programId: 'p01', tourNumber: 'ТУР-2024-001', status: 'active',
    assignedManagerId: 'mgr-1',
    taskNote: 'Провести тур проверки квалификации по определению ДНК животного в пищевых продуктах. Срок: 45 дней.',
    createdAt: '2024-03-01T08:00:00Z', updatedAt: '2024-03-06T09:00:00Z',
    timeline: [
      { status: 'forming', date: '2024-03-01T08:00:00Z', by: 'admin-1', note: 'Тур открыт для набора участников' },
      { status: 'active', date: '2024-03-06T09:00:00Z', by: 'admin-1', note: 'Тур запущен. Заведующий: Петров Д.С.' },
    ],
  },
];

const seedApplications = [
  {
    id: 'app-1', clientId: 'client-1', programId: 'p01', tourId: 'tour-1', status: 'active', appNumber: 'ЗАЯ-2024-001',
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
    assignedManagerId: 'mgr-1', taskNote: null,
    draftContractUrl: 'draft_contract_app1.pdf', signedContractUrl: 'signed_contract_app1.pdf',
    protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
    createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-06T09:00:00Z',
    timeline: [
      { status: 'submitted', date: '2024-03-01T09:00:00Z', by: 'client-1', note: '' },
      { status: 'accepted', date: '2024-03-02T10:00:00Z', by: 'admin-1', note: 'Принята. Включена в ТУР-2024-001.' },
      { status: 'draft_sent', date: '2024-03-03T11:00:00Z', by: 'admin-1', note: '' },
      { status: 'signed', date: '2024-03-04T14:00:00Z', by: 'client-1', note: '' },
      { status: 'active', date: '2024-03-06T09:00:00Z', by: 'admin-1', note: 'Тур ТУР-2024-001 запущен.' },
    ],
  },
  {
    id: 'app-2', clientId: 'client-2', programId: 'p04', tourId: null, status: 'submitted', appNumber: 'ЗАЯ-2024-002',
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
    createdAt: '2024-03-10T14:00:00Z', updatedAt: '2024-03-10T14:00:00Z',
    timeline: [{ status: 'submitted', date: '2024-03-10T14:00:00Z', by: 'client-2', note: '' }],
  },
  {
    id: 'app-3', clientId: 'client-3', programId: 'p01', tourId: 'tour-1', status: 'active', appNumber: 'ЗАЯ-2024-003',
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
    draftContractUrl: 'draft_contract_app3.pdf', signedContractUrl: 'signed_contract_app3.pdf',
    protocolUrl: null, conclusionUrl: null, reportUrl: null, certificateUrl: null,
    createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-06T09:00:00Z',
    timeline: [
      { status: 'submitted', date: '2024-03-01T10:00:00Z', by: 'client-3', note: '' },
      { status: 'accepted', date: '2024-03-02T10:30:00Z', by: 'admin-1', note: 'Принята. Включена в ТУР-2024-001.' },
      { status: 'draft_sent', date: '2024-03-03T11:30:00Z', by: 'admin-1', note: '' },
      { status: 'signed', date: '2024-03-05T09:00:00Z', by: 'client-3', note: '' },
      { status: 'active', date: '2024-03-06T09:00:00Z', by: 'admin-1', note: 'Тур ТУР-2024-001 запущен.' },
    ],
  },
];

const seedNotifications = [
  { id: 'n1', type: 'app_submitted', targetIds: ['admin-1', 'admin-2'], relatedId: 'app-1', message: 'Новая заявка ЗАЯ-2024-001 от ТОО «АналитЛаб»', read: 1, createdAt: '2024-03-01T09:00:00Z' },
  { id: 'n2', type: 'app_submitted', targetIds: ['admin-1', 'admin-2'], relatedId: 'app-3', message: 'Новая заявка ЗАЯ-2024-003 от РГП «КазЛабСтандарт»', read: 1, createdAt: '2024-03-01T10:00:00Z' },
  { id: 'n3', type: 'tour_started', targetIds: ['client-1', 'client-3', 'mgr-1'], relatedId: 'tour-1', message: 'Тур ТУР-2024-001 запущен. Программа: ДНК животного в пищевых продуктах.', read: 1, createdAt: '2024-03-06T09:00:00Z' },
  { id: 'n4', type: 'app_submitted', targetIds: ['admin-1', 'admin-2'], relatedId: 'app-2', message: 'Новая заявка ЗАЯ-2024-002 от ИП Морозова С.Д.', read: 0, createdAt: '2024-03-10T14:00:00Z' },
];

function seed() {
  const already = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (already > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, email, password_hash, name, position, phone, org_name, verified, created_at)
    VALUES (@id, @role, @email, @passwordHash, @name, @position, @phone, @orgName, @verified, @createdAt)
  `);
  const insertProgram = db.prepare('INSERT INTO programs (id, code, name, icon) VALUES (?, ?, ?, ?)');
  const insertTour = db.prepare(`
    INSERT INTO tours (id, program_id, tour_number, status, assigned_manager_id, task_note, created_at, updated_at)
    VALUES (@id, @programId, @tourNumber, @status, @assignedManagerId, @taskNote, @createdAt, @updatedAt)
  `);
  const insertTourTimeline = db.prepare(`
    INSERT INTO tour_timeline (tour_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertApp = db.prepare(`
    INSERT INTO applications (
      id, client_id, program_id, tour_id, status, app_number, form_data,
      assigned_manager_id, task_note, draft_contract_url, signed_contract_url,
      protocol_url, conclusion_url, report_url, certificate_url, created_at, updated_at
    ) VALUES (
      @id, @clientId, @programId, @tourId, @status, @appNumber, @formData,
      @assignedManagerId, @taskNote, @draftContractUrl, @signedContractUrl,
      @protocolUrl, @conclusionUrl, @reportUrl, @certificateUrl, @createdAt, @updatedAt
    )
  `);
  const insertAppTimeline = db.prepare(`
    INSERT INTO application_timeline (application_id, status, date, by_user, note, seq) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, type, related_id, message, read, created_at) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertTarget = db.prepare('INSERT INTO notification_targets (notification_id, user_id) VALUES (?, ?)');
  const insertCounter = db.prepare('INSERT INTO counters (key, value) VALUES (?, ?)');

  const tx = db.transaction(() => {
    for (const p of PROGRAMS) insertProgram.run(p.id, p.code, p.name, p.icon);

    for (const u of seedUsers) {
      insertUser.run({
        id: u.id, role: u.role, email: u.email,
        passwordHash: bcrypt.hashSync(u.password, 10),
        name: u.name, position: u.position || null, phone: u.phone || null,
        orgName: u.orgName || null, verified: u.verified, createdAt: u.createdAt,
      });
    }

    for (const t of seedTours) {
      insertTour.run({
        id: t.id, programId: t.programId, tourNumber: t.tourNumber, status: t.status,
        assignedManagerId: t.assignedManagerId || null, taskNote: t.taskNote || null,
        createdAt: t.createdAt, updatedAt: t.updatedAt,
      });
      t.timeline.forEach((ev, i) => insertTourTimeline.run(t.id, ev.status, ev.date, ev.by, ev.note || '', i));
    }

    for (const a of seedApplications) {
      insertApp.run({
        id: a.id, clientId: a.clientId, programId: a.programId, tourId: a.tourId,
        status: a.status, appNumber: a.appNumber, formData: JSON.stringify(a.formData),
        assignedManagerId: a.assignedManagerId, taskNote: a.taskNote,
        draftContractUrl: a.draftContractUrl, signedContractUrl: a.signedContractUrl,
        protocolUrl: a.protocolUrl, conclusionUrl: a.conclusionUrl,
        reportUrl: a.reportUrl, certificateUrl: a.certificateUrl,
        createdAt: a.createdAt, updatedAt: a.updatedAt,
      });
      a.timeline.forEach((ev, i) => insertAppTimeline.run(a.id, ev.status, ev.date, ev.by, ev.note || '', i));
    }

    for (const n of seedNotifications) {
      insertNotif.run(n.id, n.type, n.relatedId, n.message, n.read, n.createdAt);
      n.targetIds.forEach(uid => insertTarget.run(n.id, uid));
    }

    insertCounter.run('app', seedApplications.length + 1);
    insertCounter.run('tour', seedTours.length + 1);
  });

  tx();
  // eslint-disable-next-line no-console
  console.log('Database seeded with initial demo data.');
}

module.exports = { seed, PROGRAMS };
