const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'app.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin','manager','client')),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT,
    phone TEXT,
    org_name TEXT,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pending_verifications (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL REFERENCES programs(id),
    tour_number TEXT NOT NULL,
    status TEXT NOT NULL,
    assigned_manager_id TEXT REFERENCES users(id),
    task_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tour_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id TEXT NOT NULL REFERENCES tours(id),
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    by_user TEXT,
    note TEXT,
    seq INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES users(id),
    program_id TEXT NOT NULL REFERENCES programs(id),
    tour_id TEXT REFERENCES tours(id),
    status TEXT NOT NULL,
    app_number TEXT NOT NULL,
    form_data TEXT NOT NULL,
    assigned_manager_id TEXT REFERENCES users(id),
    task_note TEXT,
    draft_contract_url TEXT,
    signed_contract_url TEXT,
    protocol_url TEXT,
    conclusion_url TEXT,
    report_url TEXT,
    certificate_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS application_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL REFERENCES applications(id),
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    by_user TEXT,
    note TEXT,
    seq INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    related_id TEXT,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notification_targets (
    notification_id TEXT NOT NULL REFERENCES notifications(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    PRIMARY KEY (notification_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS counters (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_applications_client ON applications(client_id);
  CREATE INDEX IF NOT EXISTS idx_applications_tour ON applications(tour_id);
  CREATE INDEX IF NOT EXISTS idx_tours_manager ON tours(assigned_manager_id);
  CREATE INDEX IF NOT EXISTS idx_notif_targets_user ON notification_targets(user_id);
`);

module.exports = db;
