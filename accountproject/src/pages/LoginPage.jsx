// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import '../styles/pages.css';

export default function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    const res = store.login(email, pass);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    navigate('/dashboard');
  };

  const fill = role => {
    const d = { admin: { email: 'admin@csee.kz', pass: 'Admin123!' }, manager: { email: 'manager1@csee.kz', pass: 'Mgr123!' }, client: { email: 'client1@lab.kz', pass: 'Client123!' } };
    setEmail(d[role].email); setPass(d[role].pass);
  };

  return (
    <div className="auth-page">
      <div className="auth-blob-1" /><div className="auth-blob-2" />
      <div className="auth-inner">
        <div className="auth-logo">
          <div className="auth-logo__icon">🏛️</div>
          <h1 className="auth-logo__title">ЦСЭЭ</h1>
          <p className="auth-logo__sub">Центр стандартизации, экспертизы и оценки</p>
        </div>
        <div className="auth-card">
          <h2 className="auth-card__title">Вход в систему</h2>
          <form className="auth-card__form" onSubmit={handleSubmit}>
            <Input label="Email" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.kz" required />
            <Input label="Пароль" id="pass" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
            {error && <div className="auth-error">⚠️ {error}</div>}
            <Button type="submit" size="lg" disabled={loading} className="btn--full">
              {loading ? '⏳ Входим...' : '→ Войти'}
            </Button>
          </form>
          <div className="auth-card__footer">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></div>
        </div>
        <div className="demo-box">
          <div className="demo-box__label">Демо-аккаунты</div>
          <div className="demo-box__btns">
            {[{ role: 'admin', label: 'Администратор', c: '#4f8ef7' }, { role: 'manager', label: 'Заведующий', c: '#a47fff' }, { role: 'client', label: 'Клиент', c: '#3cc98a' }].map(d => (
              <button key={d.role} className="demo-btn" style={{ border: `1px solid ${d.c}40`, color: d.c }}
                onMouseEnter={e => e.currentTarget.style.background = `${d.c}15`}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => fill(d.role)}>{d.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
