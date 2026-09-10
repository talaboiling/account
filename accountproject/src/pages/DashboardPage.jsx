// src/pages/DashboardPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Badge, StatusBadge, Button } from '../components/ui';
import '../styles/pages.css';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__icon">{icon}</span>
        <div className="stat-card__dot" style={{ background: color }} />
      </div>
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

function AppMiniRow({ app, store, navigate }) {
  const prog = store.getProgramById(app.programId);
  const client = store.getUserById(app.clientId);
  const tour = app.tourId ? store.getTourById(app.tourId) : null;
  return (
    <div className="app-row-mini" onClick={() => navigate(`/applications/${app.id}`)}>
      <div className="app-row-mini__left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="app-row-mini__num">{app.appNumber}</span>
          {tour && <Badge color="cyan" className="badge--xs">{tour.tourNumber}</Badge>}
        </div>
        <span className="app-row-mini__name">{prog?.name}</span>
        {client && <span className="app-row-mini__org">{client.orgName || client.name}</span>}
      </div>
      <div className="app-row-mini__right">
        <StatusBadge status={app.status} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();

  const allApps = store.getAllApplications();
  const myApps = user.role === 'client' ? store.getApplicationsForClient(user.id)
    : user.role === 'manager' ? store.getApplicationsForManager(user.id)
      : allApps;

  const myTours = user.role === 'manager'
    ? store.getToursForManager(user.id)
    : store.tours;

  const unread = store.getUnreadCount(user.id);
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; };

  return (
    <div className="fade-in">
      <div className="dashboard__greeting" style={{ marginBottom: '24px' }}>
        <h1>{greet()}, {user.name.split(' ')[1] || user.name}! 👋</h1>
        <p>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Admin stats */}
      {user.role === 'admin' && (
        <>
          <div className="stats-grid">
            <StatCard icon="🗂️" label="Всего туров" value={store.tours.length} color="var(--accent)" />
            <StatCard icon="⚡" label="Активных туров" value={store.tours.filter(t => t.status === 'active').length} color="var(--green)" />
            <StatCard icon="⏳" label="Набор участников" value={store.tours.filter(t => t.status === 'forming').length} color="var(--yellow)" />
            <StatCard icon="📋" label="Всего заявок" value={allApps.length} color="var(--accent)" />
            <StatCard icon="🏁" label="Завершено" value={allApps.filter(a => a.status === 'finished').length} color="var(--purple)" />
            <StatCard icon="🔔" label="Уведомлений" value={unread} color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} sub="непрочитанных" />
          </div>
          {/* Program participation summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
              Участники по программам
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
              {store.programs.map(prog => {
                const progApps = allApps.filter(a => a.programId === prog.id);
                const progTours = store.tours.filter(t => t.programId === prog.id);
                if (progApps.length === 0) return null;
                return (
                  <div key={prog.id} style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/tours')}>
                    <span style={{ fontSize: '1.2rem' }}>{prog.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prog.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '2px' }}>{prog.code}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-main)', fontWeight: 800, color: 'var(--accent)' }}>{progApps.length}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{progTours.length} {progTours.length === 1 ? 'тур' : 'туров'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Manager stats */}
      {user.role === 'manager' && (
        <div className="stats-grid">
          <StatCard icon="🗂️" label="Мои туры" value={myTours.length} color="var(--accent)" />
          <StatCard icon="⚙️" label="В работе" value={myTours.filter(t => t.status === 'in_progress').length} color="var(--yellow)" />
          <StatCard icon="✅" label="Завершено" value={myTours.filter(t => t.status === 'completed').length} color="var(--green)" />
          <StatCard icon="🔔" label="Уведомлений" value={unread} color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} sub="непрочитанных" />
        </div>
      )}

      {/* Client stats */}
      {user.role === 'client' && (
        <>
          <div className="stats-grid">
            <StatCard icon="📋" label="Мои заявки" value={myApps.length} color="var(--accent)" />
            <StatCard icon="⏳" label="На рассмотрении" value={myApps.filter(a => ['submitted', 'accepted'].includes(a.status)).length} color="var(--yellow)" />
            <StatCard icon="⚙️" label="В процессе" value={myApps.filter(a => !['submitted', 'accepted', 'rejected', 'finished'].includes(a.status)).length} color="var(--cyan)" />
            <StatCard icon="🏁" label="Завершено" value={myApps.filter(a => a.status === 'finished').length} color="var(--green)" />
          </div>
          <div className="cta-banner">
            <div>
              <h3>Подать заявку на участие</h3>
              <p>Выберите программу проверки квалификации и заполните форму участника (Ф-02-ВП-31)</p>
            </div>
            <Button onClick={() => navigate('/programs')} size="lg">🔬 Выбрать программу</Button>
          </div>
        </>
      )}

      {/* Recent list */}
      <div className="recent-box">
        <div className="recent-box__header">
          <h3 className="recent-box__title">
            {user.role === 'manager' ? 'Последние заявки в моих турах'
              : user.role === 'client' ? 'Мои заявки'
                : 'Последние заявки'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>Все →</Button>
        </div>
        {myApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-sub)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
            <div style={{ fontWeight: 600 }}>
              {user.role === 'manager' ? 'Заданий пока нет' : 'Заявок пока нет'}
            </div>
            {user.role === 'client' && <Button onClick={() => navigate('/programs')} style={{ marginTop: '12px' }}>Подать заявку</Button>}
          </div>
        ) : (
          <div className="recent-box__list">
            {myApps.slice(0, 6).map(app => (
              <AppMiniRow key={app.id} app={app} store={store} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
