// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Badge } from '../ui';

const NAV_ADMIN = [
  { path:'/dashboard', icon:'📊', label:'Дашборд' },
  { path:'/applications', icon:'📋', label:'Заявки' },
  { path:'/protocols', icon:'🧪', label:'Протоколы' },
  { path:'/results', icon:'📄', label:'Заключения' },
  { path:'/notifications', icon:'🔔', label:'Уведомления' },
  { path:'/archive', icon:'🗄️', label:'Архив' },
  { path:'/users', icon:'👥', label:'Пользователи' },
];

const NAV_MANAGER = [
  { path:'/dashboard', icon:'📊', label:'Дашборд' },
  { path:'/applications', icon:'📋', label:'Мои заявки' },
  { path:'/protocols', icon:'🧪', label:'Протоколы' },
  { path:'/notifications', icon:'🔔', label:'Уведомления' },
];

const NAV_CLIENT = [
  { path:'/dashboard', icon:'🏠', label:'Главная' },
  { path:'/programs', icon:'🔬', label:'Подать заявку' },
  { path:'/applications', icon:'📋', label:'Мои заявки' },
  { path:'/notifications', icon:'🔔', label:'Уведомления' },
];

const ROLE_NAV = { admin: NAV_ADMIN, manager: NAV_MANAGER, client: NAV_CLIENT };
const ROLE_LABEL = { admin:'Администратор', manager:'Лаборант', client:'Клиент' };

export default function Layout({ children }) {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const nav = ROLE_NAV[user.role] || NAV_CLIENT;
  const unread = store.getUnreadCount(user.id);

  const handleLogout = () => { store.logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'0 0 20px' }}>
      {/* Logo */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', background:'var(--accent)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>⚗️</div>
          <div>
            <div style={{ fontFamily:'var(--font-main)', fontWeight:800, fontSize:'0.95rem', lineHeight:1.2 }}>ЛабКонтроль</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-sub)' }}>CRM Система</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-card2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'var(--accent-dim)', border:'2px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, color:'var(--accent)', flexShrink:0 }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--accent)' }}>{ROLE_LABEL[user.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        {nav.map(item => {
          const active = location.pathname === item.path;
          const isNotif = item.path === '/notifications';
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', padding:'10px 12px', borderRadius:'var(--radius-sm)', marginBottom:'2px', background: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-sub)', fontWeight: active ? 600 : 400, fontSize:'0.875rem', transition:'all var(--transition)', textDecoration:'none', border: active ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent' }}
              onMouseEnter={e => { if(!active) e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text)'; }}
              onMouseLeave={e => { if(!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-sub)'; } }}>
              <span style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'1rem', width:'18px', textAlign:'center' }}>{item.icon}</span>
                {item.label}
              </span>
              {isNotif && unread > 0 && <Badge color="red" style={{ minWidth:'20px', justifyContent:'center' }}>{unread}</Badge>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding:'0 10px' }}>
        <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 12px', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-sub)', fontSize:'0.875rem', cursor:'pointer', transition:'all var(--transition)' }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--red-dim)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='rgba(247,89,89,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-sub)'; e.currentTarget.style.borderColor='var(--border)'; }}>
          <span>🚪</span> Выйти
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{ width:'260px', background:'var(--bg-card)', borderRight:'1px solid var(--border)', position:'fixed', top:0, left:0, height:'100vh', overflowY:'auto', zIndex:100, display:'flex', flexDirection:'column' }}>
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div style={{ display:'none', position:'fixed', top:0, left:0, right:0, height:'var(--header-h)', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', zIndex:100, alignItems:'center', padding:'0 16px', justifyContent:'space-between' }} className="mobile-header">
        <div style={{ fontFamily:'var(--font-main)', fontWeight:800 }}>⚗️ ЛабКонтроль</div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background:'none', border:'none', color:'var(--text)', fontSize:'1.3rem', cursor:'pointer' }}>☰</button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200 }} onClick={() => setMobileOpen(false)}>
          <aside style={{ width:'var(--sidebar-w)', background:'var(--bg-card)', height:'100vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="main-content" style={{ animation:'fadeIn 0.3s ease' }}>
        {children}
      </main>

      <style>{`
        .main-content {
          margin-left: 260px;
          flex: 1;
          min-height: 100vh;
          padding: 28px 32px;
          max-width: calc(100vw - 260px);
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          aside.desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding: calc(64px + 16px) 16px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
