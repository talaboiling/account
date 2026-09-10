const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { signToken, toPublicUser, requireAuth } = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Укажите email и пароль' });

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  if (row.role === 'client' && !row.verified) {
    return res.status(403).json({ error: 'Email не подтверждён' });
  }
  const user = toPublicUser(row);
  res.json({ token: signToken(user), user });
});

router.post('/register', (req, res) => {
  const { name, orgName, phone, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Заполните все обязательные поля' });

  const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email уже зарегистрирован' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO users (id, role, email, password_hash, name, position, phone, org_name, verified, created_at)
    VALUES (?, 'client', ?, ?, ?, NULL, ?, ?, 0, ?)
  `).run(id, email, bcrypt.hashSync(password, 10), name, phone || null, orgName || null, new Date().toISOString());

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.prepare(`
    INSERT INTO pending_verifications (email, code, created_at) VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET code = excluded.code, created_at = excluded.created_at
  `).run(email, code, new Date().toISOString());

  // No real mail service is wired up (see README) — the code is returned directly
  // so the demo verification flow works end to end.
  res.json({ verificationCode: code });
});

router.post('/verify-email', (req, res) => {
  const { email, code } = req.body || {};
  const row = db.prepare('SELECT * FROM pending_verifications WHERE email = ?').get(email);
  if (!row || row.code !== code) return res.status(400).json({ error: 'Неверный код' });

  db.prepare('UPDATE users SET verified = 1 WHERE email = ?').run(email);
  db.prepare('DELETE FROM pending_verifications WHERE email = ?').run(email);
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;
