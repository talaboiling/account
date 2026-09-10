// src/components/layout/Layout.jsx
import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Badge } from '../ui';
import '../../styles/layout.css';

const NAV = {
  admin: [
    { path: '/dashboard', icon: '📊', label: 'Дашборд' },
    { path: '/tours', icon: '🗂️', label: 'Туры' },
    { path: '/applications', icon: '📋', label: 'Заявки' },
    { path: '/notifications', icon: '🔔', label: 'Уведомления' },
    { path: '/archive', icon: '🗄️', label: 'Архив' },
    { path: '/users', icon: '👥', label: 'Пользователи' },
  ],
  manager: [
    { path: '/dashboard', icon: '📊', label: 'Дашборд' },
    { path: '/tours', icon: '🗂️', label: 'Мои туры' },
    { path: '/applications', icon: '📋', label: 'Заявки' },
    { path: '/notifications', icon: '🔔', label: 'Уведомления' },
  ],
  client: [
    { path: '/dashboard', icon: '🏠', label: 'Главная' },
    { path: '/programs', icon: '🔬', label: 'Подать заявку' },
    { path: '/applications', icon: '📋', label: 'Мои заявки' },
    { path: '/notifications', icon: '🔔', label: 'Уведомления' },
  ],
};

const ROLE_LABEL = { admin: 'Администратор', manager: 'Заведующий', client: 'Клиент' };

export default function Layout({ children }) {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!store.error) return;
    const t = setTimeout(() => store.clearError(), 6000);
    return () => clearTimeout(t);
  }, [store.error, store]);

  if (!user) return null;

  const nav = NAV[user.role] || NAV.client;
  const unread = store.getUnreadCount(user.id);

  const SidebarInner = () => (
    <div className="sidebar__inner">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">🏛️</div>
        <div>
          <div className="sidebar__logo-name">ЦСЭЭ</div>
          <div className="sidebar__logo-sub">Провайдерские услуги</div>
        </div>
      </div>
      <div className="sidebar__user">
        <div className="sidebar__avatar">{user.name.charAt(0)}</div>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div className="sidebar__user-name">{user.name}</div>
          <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        {nav.map(item => {
          const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const isNotif = item.path === '/notifications';
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={`nav-link${active ? ' nav-link--active' : ''}`}>
              <span className="nav-link__inner">
                <span className="nav-link__icon">{item.icon}</span>
                {item.label}
              </span>
              {isNotif && unread > 0 && <Badge color="red" className="badge--xs">{unread}</Badge>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={() => { store.logout(); navigate('/login'); }}>
          <span>🚪</span> Выйти
        </button>
      </div>
    </div>
  );

  return (
    <div className="shell">
      <aside className="sidebar"><SidebarInner /></aside>
      <div className="mobile-header">
        <div className="mobile-header__logo">🏛️ ЦСЭЭ</div>
        <button className="mobile-header__toggle" onClick={() => setMobileOpen(o => !o)}>☰</button>
      </div>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar sidebar--mobile" onClick={e => e.stopPropagation()}><SidebarInner /></aside>
        </div>
      )}
      <main className="main-content">
        {store.error && (
          <div className="alert alert--red" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span>⚠️ {store.error}</span>
            <button className="modal__close" onClick={() => store.clearError()}>×</button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
