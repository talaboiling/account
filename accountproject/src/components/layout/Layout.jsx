// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Badge } from '../ui';
import '../../styles/layout.css';

const NAV_ADMIN = [
  { path: '/dashboard',     icon: '📊', label: 'Дашборд' },
  { path: '/applications',  icon: '📋', label: 'Заявки' },
  { path: '/protocols',     icon: '🧪', label: 'Протоколы' },
  { path: '/results',       icon: '📄', label: 'Заключения' },
  { path: '/notifications', icon: '🔔', label: 'Уведомления' },
  { path: '/archive',       icon: '🗄️', label: 'Архив' },
  { path: '/users',         icon: '👥', label: 'Пользователи' },
];

const NAV_MANAGER = [
  { path: '/dashboard',     icon: '📊', label: 'Дашборд' },
  { path: '/applications',  icon: '📋', label: 'Мои заявки' },
  { path: '/protocols',     icon: '🧪', label: 'Протоколы' },
  { path: '/notifications', icon: '🔔', label: 'Уведомления' },
];

const NAV_CLIENT = [
  { path: '/dashboard',     icon: '🏠', label: 'Главная' },
  { path: '/programs',      icon: '🔬', label: 'Подать заявку' },
  { path: '/applications',  icon: '📋', label: 'Мои заявки' },
  { path: '/notifications', icon: '🔔', label: 'Уведомления' },
];

const ROLE_NAV   = { admin: NAV_ADMIN, manager: NAV_MANAGER, client: NAV_CLIENT };
const ROLE_LABEL = { admin: 'Администратор', manager: 'Лаборант', client: 'Клиент' };

export default function Layout({ children }) {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const nav    = ROLE_NAV[user.role] || NAV_CLIENT;
  const unread = store.getUnreadCount(user.id);

  const handleLogout = () => { store.logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="sidebar__inner">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">⚗️</div>
        <div>
          <div className="sidebar__logo-name">ЛабКонтроль</div>
          <div className="sidebar__logo-sub">CRM Система</div>
        </div>
      </div>

      {/* User */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">{user.name.charAt(0)}</div>
        <div style={{ overflow: 'hidden' }}>
          <div className="sidebar__user-name">{user.name}</div>
          <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar__nav">
        {nav.map(item => {
          const active   = location.pathname === item.path;
          const isNotif  = item.path === '/notifications';
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`nav-link${active ? ' nav-link--active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="nav-link__icon">{item.icon}</span>
                <span className="nav-link__label">{item.label}</span>
              </span>
              {isNotif && unread > 0 && (
                <Badge color="red" style={{ minWidth: '20px', justifyContent: 'center' }}>
                  {unread}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={handleLogout}>
          <span>🚪</span> Выйти
        </button>
      </div>
    </div>
  );

  return (
    <div className="shell">
      {/* Desktop sidebar */}
      <aside className="sidebar desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="mobile-header">
        <div className="mobile-header__logo">⚗️ ЛабКонтроль</div>
        <button className="mobile-header__toggle" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
