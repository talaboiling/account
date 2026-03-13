// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../components/ui';

export default function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      admin: { email:'admin@lab.ru', password:'Admin123!' },
      manager: { email:'manager1@lab.ru', password:'Mgr123!' },
      client: { email:'client1@mail.ru', password:'Client123!' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].password);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', overflow:'hidden' }}>
      {/* Background decoration */}
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(60,201,138,0.04) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'420px', animation:'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{ display:'inline-flex', width:'60px', height:'60px', background:'var(--accent)', borderRadius:'16px', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', marginBottom:'14px', boxShadow:'0 8px 32px rgba(79,142,247,0.35)' }}>⚗️</div>
          <h1 style={{ fontFamily:'var(--font-main)', fontWeight:800, fontSize:'1.6rem', marginBottom:'4px' }}>ЛабКонтроль</h1>
          <p style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>Система управления лабораторными процессами</p>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow)' }}>
          <h2 style={{ fontFamily:'var(--font-main)', fontSize:'1.1rem', marginBottom:'20px' }}>Вход в систему</h2>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <Input label="Email" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.ru" required />
            <Input label="Пароль" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && (
              <div style={{ background:'var(--red-dim)', border:'1px solid rgba(247,89,89,0.3)', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:'0.875rem', color:'var(--red)' }}>⚠️ {error}</div>
            )}
            <Button type="submit" size="lg" disabled={loading} style={{ marginTop:'4px', justifyContent:'center' }}>
              {loading ? '⏳ Входим...' : '→ Войти'}
            </Button>
          </form>

          <div style={{ marginTop:'16px', textAlign:'center', fontSize:'0.875rem', color:'var(--text-sub)' }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Зарегистрироваться</Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop:'20px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px' }}>
          <div style={{ fontSize:'0.75rem', color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700, marginBottom:'10px' }}>Демо-аккаунты</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[{role:'admin',label:'Администратор',color:'#4f8ef7'},{role:'manager',label:'Лаборант',color:'#a47fff'},{role:'client',label:'Клиент',color:'#3cc98a'}].map(d => (
              <button key={d.role} onClick={() => fillDemo(d.role)} style={{ padding:'6px 12px', borderRadius:'var(--radius-sm)', background:'transparent', border:`1px solid ${d.color}40`, color:d.color, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background=`${d.color}15`}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
