// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Alert } from '../components/ui';
import '../styles/pages.css';

export default function RegisterPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', orgName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [devCode, setDevCode] = useState('');
  const [code, setCode] = useState('');

  const update = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleRegister = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    const { email, password, name, orgName, phone } = form;
    const res = await store.registerClient({ email, password, name, orgName, phone });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setDevCode(res.verificationCode);
    setStep('verify');
  };

  const handleVerify = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await store.verifyEmail(form.email, code);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    navigate('/login');
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
          {step === 'form' ? (
            <>
              <h2 className="auth-card__title">Регистрация клиента</h2>
              <form className="auth-card__form" onSubmit={handleRegister}>
                <Input label="ФИО" id="name" value={form.name} onChange={update('name')} placeholder="Иванов Иван Иванович" required />
                <Input label="Организация" id="orgName" value={form.orgName} onChange={update('orgName')} placeholder="ТОО «Компания»" required />
                <Input label="Телефон" id="phone" value={form.phone} onChange={update('phone')} placeholder="+7 (7XX) XXX-XX-XX" required />
                <Input label="Email" id="email" type="email" value={form.email} onChange={update('email')} placeholder="your@email.kz" required />
                <Input label="Пароль" id="password" type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required />
                {error && <div className="auth-error">⚠️ {error}</div>}
                <Button type="submit" size="lg" disabled={loading} className="btn--full">
                  {loading ? '⏳ Регистрируем...' : '→ Зарегистрироваться'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-card__title">Подтверждение email</h2>
              <Alert color="blue" text={`Код подтверждения отправлен на ${form.email}.`} />
              <form className="auth-card__form" onSubmit={handleVerify}>
                <Input label="Код подтверждения" id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="123456" required />
                {error && <div className="auth-error">⚠️ {error}</div>}
                <Button type="submit" size="lg" disabled={loading} className="btn--full">
                  {loading ? '⏳ Проверяем...' : '→ Подтвердить'}
                </Button>
              </form>
            </>
          )}
          <div className="auth-card__footer">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
        </div>
        {step === 'verify' && devCode && (
          <div className="demo-box">
            <div className="demo-box__label">Демо-режим (письмо не отправляется реально)</div>
            <div className="demo-box__btns">
              <div className="demo-btn" style={{ cursor: 'default' }}>Код: {devCode}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
