const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const TOKEN_TTL = '30d';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    email: row.email,
    name: row.name,
    position: row.position || null,
    phone: row.phone || null,
    orgName: row.org_name || null,
    verified: !!row.verified,
    createdAt: row.created_at,
  };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Сессия недействительна, войдите снова' });
  }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
  if (!row) return res.status(401).json({ error: 'Пользователь не найден' });
  req.user = toPublicUser(row);
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Недостаточно прав' });
    next();
  };
}

module.exports = { signToken, toPublicUser, requireAuth, requireRole, JWT_SECRET };
