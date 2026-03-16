// src/pages/DashboardPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Badge, StatusBadge, Button } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
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

function AppRow({ app, store, onClick }) {
  const client  = store.getUserById(app.clientId);
  const program = store.getProgramById(app.programId);
  const manager = store.getUserById(app.assignedManagerId);
  return (
    <div className="app-row" onClick={onClick}>
      <div className="app-row__info">
        <span className="app-row__code">{app.sampleCode}</span>
        <span className="app-row__name">{program?.name}</span>
        {client && <span className="app-row__client">{client.name}</span>}
      </div>
      <div className="app-row__meta">
        {manager && <Badge color="purple">{manager.name.split(' ')[0]}</Badge>}
        <StatusBadge status={app.status} />
        <span className="app-row__date">
          {format(new Date(app.createdAt), 'd MMM yyyy', { locale: ru })}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();

  const allApps  = store.getAllApplications();
  const userApps = user.role === 'client'
    ? store.getApplicationsForClient(user.id)
    : user.role === 'manager'
    ? store.getApplicationsForManager(user.id)
    : allApps;

  const unread    = store.getUnreadCount(user.id);
  const recentApps = userApps.slice(0, 5);
  const pending   = allApps.filter(a => a.status === 'pending').length;
  const signed    = allApps.filter(a => a.status === 'signed').length;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <div className="dashboard">
      <div className="dashboard__greeting">
        <h1>{greet()}, {user.name.split(' ')[1] || user.name.split(' ')[0]}! 👋</h1>
        <p>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      {user.role === 'admin' && (
        <div className="stats-grid">
          <StatCard icon="📋" label="Всего заявок"     value={allApps.length}           color="var(--accent)" />
          <StatCard icon="⏳" label="На рассмотрении"  value={pending}                  color="var(--yellow)" sub={`${Math.round(pending / Math.max(allApps.length, 1) * 100)}% от всех`} />
          <StatCard icon="✅" label="Подписанных"       value={signed}                   color="var(--green)" />
          <StatCard icon="🧪" label="Протоколов"        value={store.protocols.length}   color="var(--purple)" />
          <StatCard icon="📄" label="Заключений"        value={store.results.length}     color="var(--accent)" />
          <StatCard icon="🔔" label="Уведомлений"       value={unread}                   color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} sub="непрочитанных" />
        </div>
      )}
      {user.role === 'manager' && (
        <div className="stats-grid">
          <StatCard icon="📋" label="Мои заявки"       value={store.getApplicationsForManager(user.id).filter(a => a.assignedManagerId === user.id).length} color="var(--accent)" />
          <StatCard icon="⏳" label="Ожидают действий"  value={store.getApplicationsForManager(user.id).filter(a => a.status === 'pending').length}           color="var(--yellow)" />
          <StatCard icon="🧪" label="Мои протоколы"    value={store.protocols.filter(p => p.managerId === user.id).length}                                     color="var(--purple)" />
          <StatCard icon="🔔" label="Непрочитанных"    value={unread}                   color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} />
        </div>
      )}
      {user.role === 'client' && (
        <>
          <div className="stats-grid">
            <StatCard icon="📋" label="Мои заявки"       value={userApps.length}                                  color="var(--accent)" />
            <StatCard icon="⏳" label="На рассмотрении"  value={userApps.filter(a => a.status === 'pending').length} color="var(--yellow)" />
            <StatCard icon="✅" label="Подписанных"       value={userApps.filter(a => a.status === 'signed').length}  color="var(--green)" />
            <StatCard icon="🔔" label="Уведомлений"      value={unread}                                            color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} />
          </div>
          <div className="cta-banner">
            <div>
              <h3>Подать новую заявку</h3>
              <p>Выберите программу и заполните форму — это займёт несколько минут</p>
            </div>
            <Button onClick={() => navigate('/programs')} size="lg">🔬 Выбрать программу</Button>
          </div>
        </>
      )}

      {/* Recent apps */}
      <div className="recent-apps">
        <div className="recent-apps__header">
          <h3 className="recent-apps__title">
            {user.role === 'client' ? 'Мои последние заявки' : 'Последние заявки'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>Все заявки →</Button>
        </div>
        {recentApps.length === 0 ? (
          <div className="recent-apps__empty">
            <div className="recent-apps__empty-icon">📭</div>
            <div style={{ fontWeight: 600 }}>Заявок пока нет</div>
            {user.role === 'client' && (
              <Button onClick={() => navigate('/programs')} style={{ marginTop: '12px' }}>Подать первую заявку</Button>
            )}
          </div>
        ) : (
          <div className="recent-apps__list">
            {recentApps.map(app => (
              <AppRow key={app.id} app={app} store={store} onClick={() => navigate(`/applications/${app.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
