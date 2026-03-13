// src/data/store.js
// Central in-memory store simulating a backend database

import { v4 as uuidv4 } from 'uuid';

const PROGRAMS = [
  { id: 'prog-1', name: 'Санитарно-эпидемиологическая экспертиза', code: 'СЭЭ', icon: '🔬' },
  { id: 'prog-2', name: 'Производственный контроль', code: 'ПК', icon: '🏭' },
  { id: 'prog-3', name: 'Проверка пищевых продуктов', code: 'ПП', icon: '🥗' },
  { id: 'prog-4', name: 'Анализ воды и водных ресурсов', code: 'АВ', icon: '💧' },
  { id: 'prog-5', name: 'Обследование коммунальных объектов', code: 'ОКО', icon: '🏢' },
  { id: 'prog-6', name: 'Радиологическое обследование', code: 'РО', icon: '☢️' },
  { id: 'prog-7', name: 'Токсикологический анализ', code: 'ТА', icon: '⚗️' },
  { id: 'prog-8', name: 'Микробиологические исследования', code: 'МИ', icon: '🦠' },
  { id: 'prog-9', name: 'Экологический мониторинг', code: 'ЭМ', icon: '🌿' },
  { id: 'prog-10', name: 'Оценка условий труда', code: 'ОУТ', icon: '👷' },
];

const PROGRAM_FORMS = {
  'prog-1': [
    { id: 'org_name', label: 'Наименование организации', type: 'text', required: true },
    { id: 'org_address', label: 'Адрес объекта', type: 'text', required: true },
    { id: 'activity_type', label: 'Вид деятельности', type: 'text', required: true },
    { id: 'inspection_reason', label: 'Основание для экспертизы', type: 'textarea', required: true },
    { id: 'contact_person', label: 'Контактное лицо', type: 'text', required: true },
    { id: 'phone', label: 'Телефон', type: 'tel', required: true },
  ],
  'prog-2': [
    { id: 'enterprise_name', label: 'Наименование предприятия', type: 'text', required: true },
    { id: 'industry', label: 'Отрасль производства', type: 'select', required: true, options: ['Пищевая промышленность','Химическая промышленность','Машиностроение','Строительство','Прочее'] },
    { id: 'employee_count', label: 'Количество сотрудников', type: 'number', required: true },
    { id: 'hazard_class', label: 'Класс опасности производства', type: 'select', required: true, options: ['I класс','II класс','III класс','IV класс'] },
    { id: 'last_inspection', label: 'Дата последней проверки', type: 'date', required: false },
    { id: 'notes', label: 'Дополнительные сведения', type: 'textarea', required: false },
  ],
  'prog-3': [
    { id: 'product_name', label: 'Наименование продукции', type: 'text', required: true },
    { id: 'manufacturer', label: 'Производитель', type: 'text', required: true },
    { id: 'batch_number', label: 'Номер партии', type: 'text', required: true },
    { id: 'production_date', label: 'Дата производства', type: 'date', required: true },
    { id: 'sample_quantity', label: 'Количество образцов (кг)', type: 'number', required: true },
    { id: 'test_type', label: 'Вид испытания', type: 'select', required: true, options: ['Микробиологический','Физико-химический','Органолептический','Комплексный'] },
    { id: 'storage_conditions', label: 'Условия хранения', type: 'textarea', required: true },
  ],
  'prog-4': [
    { id: 'source_type', label: 'Тип источника воды', type: 'select', required: true, options: ['Централизованное водоснабжение','Скважина','Колодец','Открытый водоём','Иное'] },
    { id: 'location', label: 'Местоположение источника', type: 'text', required: true },
    { id: 'usage_purpose', label: 'Цель использования воды', type: 'select', required: true, options: ['Питьевая','Техническая','Сельскохозяйственная','Рекреационная'] },
    { id: 'sample_volume', label: 'Объём пробы (л)', type: 'number', required: true },
    { id: 'sampling_date', label: 'Дата отбора пробы', type: 'date', required: true },
    { id: 'parameters', label: 'Исследуемые показатели', type: 'textarea', required: true },
  ],
  'prog-5': [
    { id: 'object_type', label: 'Тип объекта', type: 'select', required: true, options: ['Жилой дом','Школа','Детский сад','Больница','Торговый центр','Офисное здание','Прочее'] },
    { id: 'object_address', label: 'Адрес объекта', type: 'text', required: true },
    { id: 'area_sqm', label: 'Площадь (м²)', type: 'number', required: true },
    { id: 'occupancy', label: 'Количество посетителей/жильцов', type: 'number', required: true },
    { id: 'complaint_reason', label: 'Причина обращения', type: 'textarea', required: true },
    { id: 'urgency', label: 'Срочность', type: 'select', required: true, options: ['Стандартная','Срочная','Экстренная'] },
  ],
  'prog-6': [
    { id: 'object_name', label: 'Наименование объекта', type: 'text', required: true },
    { id: 'object_address', label: 'Адрес объекта', type: 'text', required: true },
    { id: 'radiation_source', label: 'Источник излучения', type: 'select', required: true, options: ['Рентгеновское оборудование','Радиоактивные материалы','Естественный фон','Иное'] },
    { id: 'measurement_area', label: 'Площадь обследования (м²)', type: 'number', required: true },
    { id: 'reason', label: 'Основание для обследования', type: 'textarea', required: true },
    { id: 'previous_results', label: 'Результаты предыдущих измерений', type: 'textarea', required: false },
  ],
  'prog-7': [
    { id: 'substance_name', label: 'Наименование вещества/материала', type: 'text', required: true },
    { id: 'substance_origin', label: 'Происхождение вещества', type: 'text', required: true },
    { id: 'analysis_type', label: 'Вид анализа', type: 'select', required: true, options: ['Качественный','Количественный','Скрининговый'] },
    { id: 'sample_form', label: 'Форма образца', type: 'select', required: true, options: ['Жидкость','Порошок','Таблетки','Газ','Твёрдое вещество'] },
    { id: 'quantity', label: 'Количество образца', type: 'text', required: true },
    { id: 'suspected_substances', label: 'Предполагаемые токсичные вещества', type: 'textarea', required: false },
  ],
  'prog-8': [
    { id: 'sample_type', label: 'Тип образца', type: 'select', required: true, options: ['Пища','Вода','Воздух','Почва','Биоматериал','Смывы с поверхности'] },
    { id: 'sampling_location', label: 'Место отбора пробы', type: 'text', required: true },
    { id: 'sampling_date', label: 'Дата отбора', type: 'date', required: true },
    { id: 'target_microorganisms', label: 'Определяемые микроорганизмы', type: 'textarea', required: true },
    { id: 'sample_count', label: 'Количество образцов', type: 'number', required: true },
    { id: 'storage_temp', label: 'Температура хранения при транспортировке (°C)', type: 'number', required: true },
  ],
  'prog-9': [
    { id: 'monitoring_area', label: 'Район мониторинга', type: 'text', required: true },
    { id: 'area_size', label: 'Площадь территории (га)', type: 'number', required: true },
    { id: 'pollution_type', label: 'Тип загрязнения', type: 'select', required: true, options: ['Атмосферный воздух','Почва','Водоёмы','Шумовое загрязнение','Комплексное'] },
    { id: 'pollution_source', label: 'Источник загрязнения', type: 'text', required: true },
    { id: 'monitoring_duration', label: 'Период мониторинга (дней)', type: 'number', required: true },
    { id: 'objectives', label: 'Цели и задачи мониторинга', type: 'textarea', required: true },
  ],
  'prog-10': [
    { id: 'workplace_name', label: 'Наименование рабочего места', type: 'text', required: true },
    { id: 'department', label: 'Подразделение/отдел', type: 'text', required: true },
    { id: 'worker_count', label: 'Количество работников на данном месте', type: 'number', required: true },
    { id: 'work_type', label: 'Вид выполняемых работ', type: 'textarea', required: true },
    { id: 'hazard_factors', label: 'Имеющиеся вредные факторы', type: 'select', required: true, options: ['Химические','Физические','Биологические','Психофизиологические','Комплекс факторов'] },
    { id: 'existing_class', label: 'Действующий класс условий труда (если известен)', type: 'select', required: false, options: ['Не установлен','1 (оптимальный)','2 (допустимый)','3.1 (вредный)','3.2 (вредный)','3.3 (вредный)','3.4 (вредный)','4 (опасный)'] },
  ],
};

// Initial seed data
const seedAdmins = [
  { id: 'admin-1', role: 'admin', email: 'admin@lab.ru', password: 'Admin123!', name: 'Иванов Алексей Петрович', position: 'Главный администратор', phone: '+7 (495) 123-45-67', createdAt: '2024-01-01T08:00:00Z' },
  { id: 'admin-2', role: 'admin', email: 'admin2@lab.ru', password: 'Admin456!', name: 'Смирнова Елена Викторовна', position: 'Заместитель администратора', phone: '+7 (495) 123-45-68', createdAt: '2024-01-01T08:00:00Z' },
];

const seedManagers = [
  { id: 'mgr-1', role: 'manager', email: 'manager1@lab.ru', password: 'Mgr123!', name: 'Петров Дмитрий Сергеевич', position: 'Старший лаборант', specialization: ['prog-1','prog-2','prog-8'], phone: '+7 (495) 234-56-78', createdAt: '2024-01-05T08:00:00Z' },
  { id: 'mgr-2', role: 'manager', email: 'manager2@lab.ru', password: 'Mgr456!', name: 'Козлова Наталья Ивановна', position: 'Лаборант-химик', specialization: ['prog-3','prog-4','prog-7'], phone: '+7 (495) 234-56-79', createdAt: '2024-01-05T08:00:00Z' },
  { id: 'mgr-3', role: 'manager', email: 'manager3@lab.ru', password: 'Mgr789!', name: 'Новиков Андрей Александрович', position: 'Эколог-инспектор', specialization: ['prog-5','prog-6','prog-9','prog-10'], phone: '+7 (495) 234-56-80', createdAt: '2024-01-06T08:00:00Z' },
];

const seedClients = [
  { id: 'client-1', role: 'client', email: 'client1@mail.ru', password: 'Client123!', name: 'Захаров Михаил Олегович', phone: '+7 (916) 111-22-33', orgName: 'ООО "ПищеПром"', verified: true, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'client-2', role: 'client', email: 'client2@mail.ru', password: 'Client456!', name: 'Морозова Светлана Дмитриевна', phone: '+7 (916) 444-55-66', orgName: 'ИП Морозова', verified: true, createdAt: '2024-02-15T11:00:00Z' },
];

const seedApplications = [
  {
    id: 'app-1', clientId: 'client-1', programId: 'prog-3', status: 'signed',
    formData: { product_name: 'Молоко пастеризованное 3.2%', manufacturer: 'ООО ПищеПром', batch_number: 'Б-2024-001', production_date: '2024-03-01', sample_quantity: '5', test_type: 'Комплексный', storage_conditions: 'Хранение при t +4°C' },
    assignedManagerId: 'mgr-2', sampleCode: 'ЛАБ-2024-003-ПП',
    createdAt: '2024-03-05T09:00:00Z', updatedAt: '2024-03-06T10:00:00Z',
    adminNote: 'Заявка принята к рассмотрению', protocolReady: true, resultReady: true, protocolDelivered: true,
    protocolId: 'proto-1', resultId: 'result-1',
  },
  {
    id: 'app-2', clientId: 'client-1', programId: 'prog-8', status: 'pending',
    formData: { sample_type: 'Смывы с поверхности', sampling_location: 'Производственный цех №2, ул. Промышленная 5', sampling_date: '2024-03-10', target_microorganisms: 'БГКП, S.aureus, Salmonella', sample_count: '10', storage_temp: '4' },
    assignedManagerId: 'mgr-1', sampleCode: 'ЛАБ-2024-008-МИ',
    createdAt: '2024-03-10T14:00:00Z', updatedAt: '2024-03-10T14:00:00Z',
    adminNote: '', protocolReady: false, resultReady: false, protocolDelivered: false,
  },
  {
    id: 'app-3', clientId: 'client-2', programId: 'prog-5', status: 'signed',
    formData: { object_type: 'Детский сад', object_address: 'ул. Садовая 15, Москва', area_sqm: '850', occupancy: '120', complaint_reason: 'Плановая проверка перед учебным годом', urgency: 'Стандартная' },
    assignedManagerId: 'mgr-3', sampleCode: 'ЛАБ-2024-005-ОКО',
    createdAt: '2024-03-08T11:00:00Z', updatedAt: '2024-03-09T09:00:00Z',
    adminNote: 'Назначен выезд на 15 марта', protocolReady: false, resultReady: false, protocolDelivered: false,
  },
];

const seedProtocols = [
  {
    id: 'proto-1', applicationId: 'app-1', managerId: 'mgr-2',
    content: 'Протокол испытаний №ПИ-2024-003\n\nОбразец: Молоко пастеризованное 3.2%\nПроизводитель: ООО ПищеПром\nПартия: Б-2024-001\n\nРезультаты испытаний:\n- Органолептические показатели: соответствуют норме\n- КМАФАнМ: 2,5×10² КОЕ/г (норма ≤1×10⁵)\n- БГКП: не обнаружены\n- Сальмонелла: не обнаружена\n- Жирность: 3.21% (норма 3.2±0.1%)\n\nЗАКЛЮЧЕНИЕ: Образцы соответствуют требованиям ГОСТ 31450-2013.',
    status: 'delivered', createdAt: '2024-03-15T14:00:00Z',
  },
];

const seedResults = [
  {
    id: 'result-1', applicationId: 'app-1', adminId: 'admin-1', protocolId: 'proto-1',
    content: 'ЗАКЛЮЧЕНИЕ №З-2024-003\n\nНа основании протокола испытаний №ПИ-2024-003 и результатов лабораторных исследований:\n\nОбразцы продукции "Молоко пастеризованное 3.2%" производства ООО "ПищеПром" (партия Б-2024-001) СООТВЕТСТВУЮТ требованиям действующей нормативно-технической документации.\n\nВыдано заключение о соответствии продукции санитарным нормам и правилам.',
    deliveredToClient: true, clientConfirmed: true,
    createdAt: '2024-03-20T11:00:00Z',
  },
];

const seedNotifications = [
  { id: 'notif-1', type: 'application_submitted', targetRoles: ['admin'], targetIds: ['admin-1','admin-2'], relatedId: 'app-1', message: 'Новая заявка от клиента Захаров М.О. по программе "Проверка пищевых продуктов"', read: true, createdAt: '2024-03-05T09:00:00Z' },
  { id: 'notif-2', type: 'status_changed', targetRoles: ['client'], targetIds: ['client-1'], relatedId: 'app-1', message: 'Статус вашей заявки изменён на "Подписана"', read: true, createdAt: '2024-03-06T10:00:00Z' },
  { id: 'notif-3', type: 'protocol_ready', targetRoles: ['admin'], targetIds: ['admin-1','admin-2'], relatedId: 'proto-1', message: 'Протокол по заявке №app-1 готов. Лаборант: Козлова Н.И.', read: true, createdAt: '2024-03-15T14:00:00Z' },
  { id: 'notif-4', type: 'result_sent', targetRoles: ['client'], targetIds: ['client-1'], relatedId: 'result-1', message: 'Результаты по вашей заявке готовы и отправлены', read: true, createdAt: '2024-03-20T11:00:00Z' },
  { id: 'notif-5', type: 'application_submitted', targetRoles: ['admin','manager'], targetIds: ['admin-1','admin-2','mgr-1'], relatedId: 'app-2', message: 'Новая заявка от клиента Захаров М.О. по программе "Микробиологические исследования"', read: false, createdAt: '2024-03-10T14:00:00Z' },
  { id: 'notif-6', type: 'application_submitted', targetRoles: ['admin','manager'], targetIds: ['admin-1','admin-2','mgr-3'], relatedId: 'app-3', message: 'Новая заявка от клиента Морозова С.Д. по программе "Обследование коммунальных объектов"', read: false, createdAt: '2024-03-08T11:00:00Z' },
];

// ---- STORE CLASS ----
class Store {
  constructor() {
    this.users = [...seedAdmins, ...seedManagers, ...seedClients];
    this.applications = [...seedApplications];
    this.protocols = [...seedProtocols];
    this.results = [...seedResults];
    this.notifications = [...seedNotifications];
    this.programs = PROGRAMS;
    this.programForms = PROGRAM_FORMS;
    this.currentUser = null;
    this.pendingVerifications = {};
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // AUTH
  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return { error: 'Неверный email или пароль' };
    if (user.role === 'client' && !user.verified) return { error: 'Email не подтверждён. Проверьте почту.' };
    this.currentUser = user;
    this.notify();
    return { user };
  }

  logout() {
    this.currentUser = null;
    this.notify();
  }

  registerClient(data) {
    if (this.users.find(u => u.email === data.email)) return { error: 'Email уже зарегистрирован' };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const id = uuidv4();
    const user = { id, role: 'client', email: data.email, password: data.password, name: data.name, phone: data.phone || '', orgName: data.orgName || '', verified: false, createdAt: new Date().toISOString() };
    this.users.push(user);
    this.pendingVerifications[data.email] = code;
    this.notify();
    return { userId: id, verificationCode: code };
  }

  verifyEmail(email, code) {
    if (this.pendingVerifications[email] !== code) return { error: 'Неверный код подтверждения' };
    const user = this.users.find(u => u.email === email);
    if (user) { user.verified = true; delete this.pendingVerifications[email]; }
    this.notify();
    return { success: true };
  }

  // APPLICATIONS
  submitApplication(clientId, programId, formData) {
    const program = this.programs.find(p => p.id === programId);
    const sampleCode = `ЛАБ-${new Date().getFullYear()}-${String(this.applications.length + 1).padStart(3,'0')}-${program.code}`;
    const app = { id: uuidv4(), clientId, programId, status: 'pending', formData, assignedManagerId: null, sampleCode, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), adminNote: '', protocolReady: false, resultReady: false, protocolDelivered: false };
    this.applications.push(app);
    const client = this.users.find(u => u.id === clientId);
    const admins = this.users.filter(u => u.role === 'admin');
    admins.forEach(admin => {
      this.addNotification({ type: 'application_submitted', targetRoles: ['admin'], targetIds: [admin.id], relatedId: app.id, message: `Новая заявка от ${client?.name} по программе "${program.name}"` });
    });
    this.notify();
    return app;
  }

  updateApplicationStatus(appId, status, adminNote, managerId) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;
    app.status = status;
    if (adminNote !== undefined) app.adminNote = adminNote;
    if (managerId !== undefined) app.assignedManagerId = managerId;
    app.updatedAt = new Date().toISOString();
    const statusLabel = status === 'signed' ? 'Подписана' : status === 'rejected' ? 'Отклонена' : 'На рассмотрении';
    this.addNotification({ type: 'status_changed', targetRoles: ['client'], targetIds: [app.clientId], relatedId: appId, message: `Статус вашей заявки (${app.sampleCode}) изменён на "${statusLabel}"` });
    this.notify();
  }

  assignManager(appId, managerId) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;
    app.assignedManagerId = managerId;
    app.updatedAt = new Date().toISOString();
    const mgr = this.users.find(u => u.id === managerId);
    this.addNotification({ type: 'manager_assigned', targetRoles: ['manager'], targetIds: [managerId], relatedId: appId, message: `Вам назначена заявка ${app.sampleCode}. Клиент: ${this.users.find(u=>u.id===app.clientId)?.name}` });
    this.notify();
  }

  // PROTOCOLS
  createProtocol(applicationId, managerId, content) {
    const proto = { id: uuidv4(), applicationId, managerId, content, status: 'pending', createdAt: new Date().toISOString() };
    this.protocols.push(proto);
    const app = this.applications.find(a => a.id === applicationId);
    if (app) { app.protocolReady = true; app.protocolId = proto.id; app.updatedAt = new Date().toISOString(); }
    const mgr = this.users.find(u => u.id === managerId);
    const admins = this.users.filter(u => u.role === 'admin');
    admins.forEach(admin => {
      this.addNotification({ type: 'protocol_ready', targetRoles: ['admin'], targetIds: [admin.id], relatedId: proto.id, message: `Протокол по заявке ${app?.sampleCode} готов. Лаборант: ${mgr?.name}` });
    });
    this.notify();
    return proto;
  }

  sendProtocolToClient(applicationId, adminId) {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return;
    const proto = this.protocols.find(p => p.id === app.protocolId);
    if (proto) proto.status = 'sent';
    this.addNotification({ type: 'protocol_sent', targetRoles: ['client'], targetIds: [app.clientId], relatedId: applicationId, message: `Протокол по вашей заявке ${app.sampleCode} готов и отправлен вам` });
    this.notify();
  }

  confirmProtocolDelivery(applicationId, clientId) {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return;
    app.protocolDelivered = true;
    const proto = this.protocols.find(p => p.id === app.protocolId);
    if (proto) proto.status = 'delivered';
    const admins = this.users.filter(u => u.role === 'admin');
    admins.forEach(admin => {
      this.addNotification({ type: 'protocol_delivered', targetRoles: ['admin'], targetIds: [admin.id], relatedId: applicationId, message: `Клиент подтвердил получение протокола по заявке ${app.sampleCode}` });
    });
    this.notify();
  }

  // RESULTS
  createResult(applicationId, adminId, content) {
    const app = this.applications.find(a => a.id === applicationId);
    const result = { id: uuidv4(), applicationId, adminId, protocolId: app?.protocolId, content, deliveredToClient: false, clientConfirmed: false, createdAt: new Date().toISOString() };
    this.results.push(result);
    if (app) { app.resultReady = true; app.resultId = result.id; app.updatedAt = new Date().toISOString(); }
    this.addNotification({ type: 'result_sent', targetRoles: ['client'], targetIds: [app?.clientId], relatedId: result.id, message: `Итоговое заключение по вашей заявке ${app?.sampleCode} готово и отправлено` });
    this.notify();
    return result;
  }

  confirmResultDelivery(resultId, clientId) {
    const result = this.results.find(r => r.id === resultId);
    if (!result) return;
    result.clientConfirmed = true;
    const app = this.applications.find(a => a.id === result.applicationId);
    this.notify();
  }

  // NOTIFICATIONS
  addNotification(data) {
    const notif = { id: uuidv4(), ...data, read: false, createdAt: new Date().toISOString() };
    this.notifications.unshift(notif);
  }

  markNotificationRead(notifId) {
    const n = this.notifications.find(n => n.id === notifId);
    if (n) n.read = true;
    this.notify();
  }

  markAllRead(userId) {
    this.notifications.filter(n => n.targetIds.includes(userId)).forEach(n => n.read = true);
    this.notify();
  }

  getNotificationsForUser(userId) {
    return this.notifications.filter(n => n.targetIds.includes(userId)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getUnreadCount(userId) {
    return this.notifications.filter(n => n.targetIds.includes(userId) && !n.read).length;
  }

  // GETTERS
  getApplicationsForClient(clientId) {
    return this.applications.filter(a => a.clientId === clientId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getApplicationsForManager(managerId) {
    return this.applications.filter(a => a.assignedManagerId === managerId || a.status === 'pending').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllApplications() {
    return [...this.applications].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getManagers() { return this.users.filter(u => u.role === 'manager'); }
  getAdmins() { return this.users.filter(u => u.role === 'admin'); }
  getClients() { return this.users.filter(u => u.role === 'client'); }
  getProgramById(id) { return this.programs.find(p => p.id === id); }
  getUserById(id) { return this.users.find(u => u.id === id); }
  getProtocolByAppId(appId) { const app = this.applications.find(a => a.id === appId); return app?.protocolId ? this.protocols.find(p => p.id === app.protocolId) : null; }
  getResultByAppId(appId) { const app = this.applications.find(a => a.id === appId); return app?.resultId ? this.results.find(r => r.id === app.resultId) : null; }
}

export const store = new Store();
export { PROGRAMS, PROGRAM_FORMS };
