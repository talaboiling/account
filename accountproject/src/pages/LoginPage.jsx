// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import '../styles/pages.css';

export default function LoginPage() {
  const store    = useStore();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = store.login(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate('/dashboard');
  };

  const fillDemo = (role) => {
    const demos = {
      admin:   { email: 'admin@lab.ru',    password: 'Admin123!' },
      manager: { email: 'manager1@lab.ru', password: 'Mgr123!'   },
      client:  { email: 'client1@mail.ru', password: 'Client123!' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].password);
  };

  const demoRoles = [
    { role: 'admin',   label: 'Администратор', color: '#4f8ef7' },
    { role: 'manager', label: 'Лаборант',       color: '#a47fff' },
    { role: 'client',  label: 'Клиент',         color: '#3cc98a' },
  ];

  return (
    <div className="login-page">
      <div className="login-page__bg-blob-1" />
      <div className="login-page__bg-blob-2" />

      <div className="login-page__inner">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__icon">⚗️</div>
          <h1 className="login-logo__title">ЛабКонтроль</h1>
          <p className="login-logo__sub">Система управления лабораторными процессами</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <h2 className="login-card__title">Вход в систему</h2>
          <form className="login-card__form" onSubmit={handleLogin}>
            <Input label="Email" id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="your@email.ru" required />
            <Input label="Пароль" id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && <div className="login-error">⚠️ {error}</div>}
            <Button type="submit" size="lg" disabled={loading} className="btn--full">
              {loading ? '⏳ Входим...' : '→ Войти'}
            </Button>
          </form>
          <div className="login-card__register">
            Нет аккаунта?{' '}
            <Link to="/register">Зарегистрироваться</Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="demo-box">
          <div className="demo-box__label">Демо-аккаунты</div>
          <div className="demo-box__buttons">
            {demoRoles.map(d => (
              <button
                key={d.role}
                className="demo-btn"
                style={{ border: `1px solid ${d.color}40`, color: d.color }}
                onClick={() => fillDemo(d.role)}
                onMouseEnter={e => e.currentTarget.style.background = `${d.color}15`}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
