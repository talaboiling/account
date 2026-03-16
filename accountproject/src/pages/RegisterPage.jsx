// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import '../styles/pages.css';

export default function RegisterPage() {
  const store    = useStore();
  const navigate = useNavigate();
  const [step,        setStep]        = useState(1);
  const [formData,    setFormData]    = useState({ name: '', email: '', phone: '', orgName: '', password: '', confirm: '' });
  const [verifyCode,  setVerifyCode]  = useState('');
  const [demoCode,    setDemoCode]    = useState('');
  const [errors,      setErrors]      = useState({});
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [pendingEmail,setPendingEmail]= useState('');

  const validate = () => {
    const e = {};
    if (!formData.name.trim())            e.name    = 'Введите ФИО';
    if (!formData.email.includes('@'))    e.email   = 'Введите корректный email';
    if (formData.password.length < 6)    e.password = 'Минимум 6 символов';
    if (formData.password !== formData.confirm) e.confirm = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = store.registerClient({ ...formData });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setPendingEmail(formData.email);
    setDemoCode(result.verificationCode);
    setStep(2);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = store.verifyEmail(pendingEmail, verifyCode);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    store.login(pendingEmail, formData.password);
    navigate('/dashboard');
  };

  const set = k => e => setFormData(f => ({ ...f, [k]: e.target.value }));

  if (step === 2) return (
    <div className="verify-page">
      <div className="verify-page__inner">
        <div className="verify-header">
          <div className="verify-header__icon">📧</div>
          <h2 className="verify-header__title">Подтверждение Email</h2>
          <p className="verify-header__sub">
            Введите код, отправленный на <strong>{pendingEmail}</strong>
          </p>
        </div>
        <div className="login-card">
          <div className="verify-code-hint">
            🔑 Демо-режим: ваш код <strong>{demoCode}</strong>
          </div>
          <form className="login-card__form" onSubmit={handleVerify}>
            <Input label="Код подтверждения" id="code" value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
              placeholder="000000" maxLength={6} required />
            {error && <div className="login-error">{error}</div>}
            <Button type="submit" size="lg" disabled={loading} className="btn--full">
              {loading ? 'Проверяем...' : '✓ Подтвердить'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="register-page">
      <div className="register-page__inner">
        <div className="register-logo">
          <div className="register-logo__icon">⚗️</div>
          <h1 className="register-logo__title">ЛабКонтроль</h1>
          <p className="register-logo__sub">Создание аккаунта</p>
        </div>
        <div className="register-card">
          <form className="register-card__form" onSubmit={handleSubmit}>
            <Input label="ФИО *"            id="name"     value={formData.name}     onChange={set('name')}     placeholder="Иванов Иван Иванович"     error={errors.name} />
            <Input label="Email *"          id="email"    type="email" value={formData.email}    onChange={set('email')}    placeholder="your@email.ru"            error={errors.email} />
            <Input label="Телефон"          id="phone"    type="tel"   value={formData.phone}    onChange={set('phone')}    placeholder="+7 (___) ___-__-__" />
            <Input label="Организация / ИП" id="orgName"  value={formData.orgName}  onChange={set('orgName')}  placeholder="ООО «Название» или ИП Фамилия" />
            <Input label="Пароль *"         id="password" type="password" value={formData.password} onChange={set('password')} placeholder="Минимум 6 символов"       error={errors.password} />
            <Input label="Повторите пароль *" id="confirm" type="password" value={formData.confirm}  onChange={set('confirm')}  placeholder="••••••••"                  error={errors.confirm} />
            {error && <div className="login-error">⚠️ {error}</div>}
            <Button type="submit" size="lg" disabled={loading} className="btn--full">
              {loading ? 'Регистрируем...' : '→ Зарегистрироваться'}
            </Button>
          </form>
          <div className="register-card__login">
            Уже есть аккаунт?{' '}<Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
