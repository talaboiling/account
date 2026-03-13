// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../components/ui';

export default function RegisterPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=verify
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', orgName:'', password:'', confirm:'' });
  const [verifyCode, setVerifyCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Введите ФИО';
    if (!formData.email.includes('@')) e.email = 'Введите корректный email';
    if (formData.password.length < 6) e.password = 'Минимум 6 символов';
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

  const set = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }));

  if (step === 2) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'400px', animation:'fadeIn 0.3s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>📧</div>
          <h2 style={{ fontFamily:'var(--font-main)', fontSize:'1.3rem', marginBottom:'6px' }}>Подтверждение Email</h2>
          <p style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>Введите код, отправленный на <strong style={{ color:'var(--text)' }}>{pendingEmail}</strong></p>
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
          {/* Demo code display */}
          <div style={{ background:'var(--yellow-dim)', border:'1px solid rgba(245,197,66,0.3)', borderRadius:'var(--radius-sm)', padding:'12px', marginBottom:'16px', fontSize:'0.82rem', color:'var(--yellow)' }}>
            🔑 Демо-режим: ваш код <strong style={{ fontSize:'1.1rem', letterSpacing:'3px' }}>{demoCode}</strong>
          </div>
          <form onSubmit={handleVerify} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <Input label="Код подтверждения" id="code" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder="000000" maxLength={6} required style={{ textAlign:'center', fontSize:'1.3rem', letterSpacing:'6px' }} />
            {error && <div style={{ color:'var(--red)', fontSize:'0.875rem', background:'var(--red-dim)', padding:'8px 12px', borderRadius:'var(--radius-sm)' }}>{error}</div>}
            <Button type="submit" size="lg" disabled={loading} style={{ justifyContent:'center' }}>
              {loading ? 'Проверяем...' : '✓ Подтвердить'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'480px', animation:'fadeIn 0.3s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ display:'inline-flex', width:'52px', height:'52px', background:'var(--accent)', borderRadius:'14px', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', marginBottom:'12px', boxShadow:'0 6px 24px rgba(79,142,247,0.3)' }}>⚗️</div>
          <h1 style={{ fontFamily:'var(--font-main)', fontWeight:800, fontSize:'1.4rem', marginBottom:'4px' }}>ЛабКонтроль</h1>
          <p style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>Создание аккаунта</p>
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow)' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <Input label="ФИО *" id="name" value={formData.name} onChange={set('name')} placeholder="Иванов Иван Иванович" error={errors.name} />
            <Input label="Email *" id="email" type="email" value={formData.email} onChange={set('email')} placeholder="your@email.ru" error={errors.email} />
            <Input label="Телефон" id="phone" type="tel" value={formData.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" />
            <Input label="Организация / ИП" id="orgName" value={formData.orgName} onChange={set('orgName')} placeholder="ООО «Название» или ИП Фамилия" />
            <Input label="Пароль *" id="password" type="password" value={formData.password} onChange={set('password')} placeholder="Минимум 6 символов" error={errors.password} />
            <Input label="Повторите пароль *" id="confirm" type="password" value={formData.confirm} onChange={set('confirm')} placeholder="••••••••" error={errors.confirm} />
            {error && <div style={{ background:'var(--red-dim)', border:'1px solid rgba(247,89,89,0.3)', borderRadius:'var(--radius-sm)', padding:'10px', fontSize:'0.875rem', color:'var(--red)' }}>⚠️ {error}</div>}
            <Button type="submit" size="lg" disabled={loading} style={{ marginTop:'4px', justifyContent:'center' }}>
              {loading ? 'Регистрируем...' : '→ Зарегистрироваться'}
            </Button>
          </form>
          <div style={{ marginTop:'16px', textAlign:'center', fontSize:'0.875rem', color:'var(--text-sub)' }}>
            Уже есть аккаунт?{' '}<Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
