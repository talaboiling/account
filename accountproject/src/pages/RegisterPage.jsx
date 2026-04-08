// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import '../styles/pages.css';

export default function RegisterPage() {
  const store    = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fd, setFd]     = useState({ name:'', email:'', phone:'', orgName:'', password:'', confirm:'' });
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [errors, setErrors]   = useState({});
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setFd(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!fd.name.trim())          e.name     = 'Введите ФИО';
    if (!fd.email.includes('@'))  e.email    = 'Введите корректный email';
    if (!fd.orgName.trim())       e.orgName  = 'Введите наименование организации';
    if (fd.password.length < 6)  e.password = 'Минимум 6 символов';
    if (fd.password !== fd.confirm) e.confirm = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 450));
    const res = store.registerClient({ name:fd.name, email:fd.email, phone:fd.phone, orgName:fd.orgName, password:fd.password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setPendingEmail(fd.email);
    setDemoCode(res.verificationCode);
    setStep(2);
  };

  const handleVerify = async e => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    const res = store.verifyEmail(pendingEmail, code);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    store.login(pendingEmail, fd.password);
    navigate('/dashboard');
  };

  if (step === 2) return (
    <div className="auth-page">
      <div className="auth-inner">
        <div className="verify-icon">📧</div>
        <div className="verify-title">Подтверждение Email</div>
        <div className="verify-sub">Введите код, отправленный на <strong>{pendingEmail}</strong></div>
        <div className="auth-card">
          <div className="verify-hint">🔑 Демо-код: <strong>{demoCode}</strong></div>
          <form className="auth-card__form" onSubmit={handleVerify}>
            <Input label="Код подтверждения" id="code" value={code} onChange={e=>setCode(e.target.value)} placeholder="000000" maxLength={6} required />
            {error && <div className="auth-error">{error}</div>}
            <Button type="submit" size="lg" disabled={loading} className="btn--full">
              {loading ? 'Проверяем...' : '✓ Подтвердить'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-inner auth-inner--wide">
        <div className="auth-logo">
          <div className="auth-logo__icon">🏛️</div>
          <h1 className="auth-logo__title">Регистрация</h1>
          <p className="auth-logo__sub">ЦСЭЭ — Провайдерские услуги</p>
        </div>
        <div className="auth-card">
          <h2 className="auth-card__title">Создание аккаунта участника</h2>
          <form className="auth-card__form" onSubmit={handleRegister}>
            <Input label="ФИО руководителя *"       id="name"     value={fd.name}     onChange={set('name')}     placeholder="Иванов Иван Иванович"     error={errors.name} />
            <Input label="Наименование организации *" id="orgName" value={fd.orgName}  onChange={set('orgName')}  placeholder="ТОО «Название» / ИП Фамилия" error={errors.orgName} />
            <Input label="Email *"                   id="email"    type="email" value={fd.email} onChange={set('email')} placeholder="your@email.kz" error={errors.email} />
            <Input label="Телефон"                   id="phone"    type="tel"   value={fd.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" />
            <Input label="Пароль *"                  id="password" type="password" value={fd.password} onChange={set('password')} placeholder="Минимум 6 символов" error={errors.password} />
            <Input label="Повторите пароль *"        id="confirm"  type="password" value={fd.confirm}  onChange={set('confirm')}  placeholder="••••••••" error={errors.confirm} />
            {error && <div className="auth-error">⚠️ {error}</div>}
            <Button type="submit" size="lg" disabled={loading} className="btn--full">
              {loading ? 'Регистрируем...' : '→ Зарегистрироваться'}
            </Button>
          </form>
          <div className="auth-card__footer">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
        </div>
      </div>
    </div>
  );
}
