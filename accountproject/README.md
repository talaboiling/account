# ЛабКонтроль — CRM для лабораторных организаций

Веб-приложение для автоматизации процесса от заявки клиента до финального заключения лабораторной организации.

The app is a React frontend (this directory) backed by a real API + database
in `server/` (Express + SQLite). See `server/README.md` for backend details.

---

## Быстрый старт

Two processes: the API server and the React dev server.

```bash
# Terminal 1 — backend (API + SQLite database)
cd server
npm install
npm start        # http://localhost:4001, seeds the DB on first run

# Terminal 2 — frontend
npm install
npm start         # http://localhost:3000, proxies /api to the backend
```

For a single-process deployment, build the frontend and let the backend
serve it:

```bash
npm run build
cd server && npm start   # now serves both the API and the built app on :4001
```

---

## Демо-аккаунты

| Роль            | Email                | Пароль      |
|-----------------|-----------------------|-------------|
| Администратор   | admin@csee.kz         | Admin123!   |
| Администратор 2 | admin2@csee.kz        | Admin456!   |
| Заведующий 1    | manager1@csee.kz      | Mgr123!     |
| Заведующий 2    | manager2@csee.kz      | Mgr456!     |
| Клиент 1        | client1@lab.kz        | Client123!  |
| Клиент 2        | client2@lab.kz        | Client456!  |
| Клиент 3        | client3@lab.kz        | Client789!  |

New clients can also self-register from the login page — registration goes
through a real (in-app, no email service wired up) verification-code step.

---

## Структура проекта

```
src/
├── index.js                    # Точка входа
├── index.css                   # Глобальные стили (dark theme, CSS variables)
├── App.js                      # Роутинг + Guard (доступ по роли)
│
├── api/
│   └── client.js                # fetch-обёртка над backend API (см. server/)
│
├── data/
│   └── store.js                 # Только презентационные константы
│                                 # (labels/цвета статусов заявок и туров)
│
├── context/
│   └── StoreContext.js          # Клиентский кэш данных + все мутации через API,
│                                 # с реальным сервером персистентности (server/)
│
├── components/
│   ├── ui.jsx                  # Переиспользуемые UI-компоненты:
│   │                           #   Button, Badge, StatusBadge, Card
│   │                           #   Input, Select, Textarea, FileUpload (реальная загрузка)
│   │                           #   Modal, Table, Tabs
│   │                           #   PageHeader, InfoRow, EmptyState, Spinner
│   └── layout/
│       └── Layout.jsx          # Sidebar + навигация (role-aware) + мобильный header
│
└── pages/
    ├── LoginPage.jsx           # Вход в систему + демо-аккаунты
    ├── RegisterPage.jsx        # Регистрация клиента + email-верификация (OTP)
    ├── DashboardPage.jsx       # Главная — статистика и последние заявки (3 версии по роли)
    ├── ProgramsPage.jsx        # Список программ (только клиент)
    ├── ApplicationFormPage.jsx # Динамическая форма заявки по программе
    ├── ApplicationsPage.jsx    # Список заявок (поиск, фильтры по статусу)
    ├── ApplicationDetailPage.jsx # Детальная страница заявки + весь workflow
    ├── ToursPage.jsx / TourDetailPage.jsx # Групповые туры (admin/manager)
    ├── NotificationsPage.jsx   # Центр уведомлений
    ├── ArchivePage.jsx         # Общий журнал событий системы (admin)
    └── UsersPage.jsx           # Управление пользователями (только admin)

server/                          # Backend API — см. server/README.md
├── src/
│   ├── db.js                    # SQLite schema (better-sqlite3)
│   ├── seed.js                  # Demo data, seeded once on first run
│   ├── auth.js                  # JWT signing/verification middleware
│   ├── repo.js                  # All business logic (status transitions,
│   │                             #   notifications) against the database
│   └── routes/                  # auth, programs, users, applications, tours,
│                                 #   notifications, uploads
└── data/app.sqlite               # The database file (gitignored)
```

---

## Бизнес-процесс (Workflow)

```
Клиент                    Администратор             Лаборант
  │                            │                        │
  ├─ Регистрация               │                        │
  ├─ Выбор программы           │                        │
  ├─ Заполнение формы          │                        │
  ├─ Подача заявки ──────────► ║ Уведомление            │
  │                            ║                        │
  │                            ╠═ Рассмотрение          │
  │                            ╠═ Назначение лаборанта ─►║
  ◄──────── Уведомление ═══════╣ Подписать/Отклонить    ║
  │                            │                        ║
  │                            │                        ║ Проведение
  │                            │                        ║ исследования
  │                            ◄── Уведомление ═════════╣ Создание протокола
  │                            │                        │
  │                            ╠═ Отправка протокола    │
  ◄──────── Уведомление ═══════╣ клиенту                │
  ║                            │                        │
  ║ Подтверждение ─────────────►│                        │
  │                            ║                        │
  │                            ╠═ Создание заключения   │
  ◄──────── Уведомление ═══════╣ Отправка клиенту       │
  ║                            │                        │
  ║ Подтверждение получения ───►│                        │
  │                            │                        │
  ✓ ПРОЦЕСС ЗАВЕРШЁН           │                        │
```

---

## Роли и права доступа

### Администратор (`admin`)
- Полный доступ ко всем заявкам
- Подписание / отклонение заявок
- Назначение лаборантов на заявки
- Отправка протоколов клиентам
- Создание итоговых заключений
- Управление пользователями
- Доступ к архиву / журналу

### Лаборант (`manager`)
- Видит назначенные ему заявки + все ожидающие
- Создание протоколов испытаний
- Уведомление администраторов
- Доступ к своим протоколам

### Клиент (`client`)
- Регистрация с email-верификацией
- Подача заявок по программам
- Просмотр только своих заявок
- Получение и подтверждение протоколов
- Получение и подтверждение заключений

---

## Программы проверки квалификации

| Код | Программа |
|-----|-----------|
| ПК-ДНК-01 | Определение ДНК животного в пищевых продуктах |
| ПК-ТМ-02  | Определение тяжёлых металлов в водных объектах |
| ПК-КФ-03  | Определение кофеина в безалкогольных напитках |
| ПК-АН-04  | Содержание анионов в водных объектах |
| ПК-pH-05  | Определение водородного показателя в водных объектах |
| ПК-ЖК-06  | Жирнокислотный состав растительного масла |
| ПК-КТ-07  | Определение катионов в водных объектах |
| ПК-ТМ-08  | Определение тяжёлых металлов в пищевых продуктах |
| ПК-ПР-09  | Идентификация паразитов в воде |

Список программ хранится в базе данных (`server/src/seed.js`), а не в коде фронтенда.

---

## Архитектура

Раньше `data/store.js` был in-memory singleton'ом, хранившим все данные и бизнес-логику
прямо в памяти браузера — при обновлении страницы всё терялось. Теперь:

- **`server/`** — реальный backend: Express + SQLite (через `better-sqlite3`).
  Вся бизнес-логика (переходы статусов, авто-создание туров, уведомления) живёт
  в `server/src/repo.js` и выполняется на сервере против базы данных.
  Пароли хранятся как bcrypt-хэши, сессии — через JWT.
- **`src/api/client.js`** — тонкая обёртка над `fetch()` для вызова API.
- **`src/context/StoreContext.js`** — клиентский кэш: читает данные с бэкенда,
  а все мутации (`acceptApplication`, `startTour`, ...) идут через реальные
  API-запросы и обновляют кэш из ответа сервера.
- **`data/store.js`** — теперь содержит только презентационные константы
  (подписи и цвета статусов), не данные.

Подробности backend API — в `server/README.md`.

---

## Уведомления

Типы уведомлений:

| Тип | Получатель | Триггер |
|-----|-----------|---------|
| `application_submitted` | Администраторы | Клиент подал заявку |
| `status_changed` | Клиент | Статус заявки изменён |
| `manager_assigned` | Лаборант | Назначен на заявку |
| `protocol_ready` | Администраторы | Лаборант создал протокол |
| `protocol_sent` | Клиент | Протокол отправлен |
| `protocol_delivered` | Администраторы | Клиент подтвердил протокол |
| `result_sent` | Клиент | Заключение готово |

---

## Разработка и расширение

### Добавление новой программы
1. В `src/data/store.js` добавьте объект в массив `PROGRAMS`
2. Добавьте описание полей формы в объект `PROGRAM_FORMS`

### Добавление новой роли
1. Добавьте навигацию в `Layout.jsx` (объект `ROLE_NAV`)
2. Добавьте проверку прав в `ProtectedRoute` в `App.jsx`
3. Создайте соответствующие страницы

### Кастомизация темы
Все цвета — в CSS-переменных в `src/index.css`:
```css
:root {
  --accent: #4f8ef7;    /* Основной акцент */
  --green: #3cc98a;     /* Успех */
  --yellow: #f5c542;    /* Предупреждение */
  --red: #f75959;       /* Ошибка */
  --purple: #a47fff;    /* Протоколы / лаборант */
}
```
