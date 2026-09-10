const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const repo = require('../repo');
const { requireAuth, requireRole, toPublicUser } = require('../auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ users: repo.getAllUsers() });
});

router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, email, phone, position, role } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Заполните ФИО и email' });
  if (!['admin', 'manager'].includes(role)) return res.status(400).json({ error: 'Недопустимая роль' });

  const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email уже используется' });

  const password = `Pass${Math.floor(1000 + Math.random() * 9000)}!`;
  const id = uuidv4();
  db.prepare(`
    INSERT INTO users (id, role, email, password_hash, name, position, phone, org_name, verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1, ?)
  `).run(id, role, email, bcrypt.hashSync(password, 10), name, position || null, phone || null, new Date().toISOString());

  const user = toPublicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
  res.status(201).json({ user, password });
});

module.exports = router;
