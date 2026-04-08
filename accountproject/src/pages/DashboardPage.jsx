// src/pages/DashboardPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Badge, StatusBadge, Button } from '../components/ui';
import { APPLICATION_STATUSES } from '../data/store';
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
  const prog   = store.getProgramById(app.programId);
  const client = store.getUserById(app.clientId);
  return (
    <div className="app-row-mini" onClick={() => navigate(`/applications/${app.id}`)}>
      <div className="app-row-mini__left">
        <span className="app-row-mini__num">{app.appNumber}</span>
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
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();

  const allApps  = store.getAllApplications();
  const myApps   = user.role === 'client'  ? store.getApplicationsForClient(user.id)
                 : user.role === 'manager' ? store.getApplicationsForManager(user.id)
                 : allApps;

  const unread   = store.getUnreadCount(user.id);
  const greet    = () => { const h = new Date().getHours(); return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; };

  const statusCount = s => allApps.filter(a => a.status === s).length;

  return (
    <div className="fade-in">
      <div className="dashboard__greeting" style={{ marginBottom:'24px' }}>
        <h1>{greet()}, {user.name.split(' ')[1] || user.name}! 👋</h1>
        <p>{new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      {user.role === 'admin' && (
        <div className="stats-grid">
          <StatCard icon="📋" label="Всего заявок"    value={allApps.length}            color="var(--accent)"  />
          <StatCard icon="⏳" label="Ожидают решения" value={statusCount('submitted')}  color="var(--yellow)"  />
          <StatCard icon="✅" label="В действии"      value={statusCount('active') + statusCount('in_progress') + statusCount('completed')} color="var(--green)" />
          <StatCard icon="🏁" label="Завершено"       value={statusCount('finished')}   color="var(--purple)"  />
          <StatCard icon="❌" label="Отклонено"       value={statusCount('rejected')}   color="var(--red)"     sub="" />
          <StatCard icon="🔔" label="Уведомлений"     value={unread}                    color={unread>0?'var(--red)':'var(--text-sub)'} sub="непрочитанных" />
        </div>
      )}

      {user.role === 'manager' && (
        <div className="stats-grid">
          <StatCard icon="📋" label="Моих заданий"   value={myApps.length}                                    color="var(--accent)" />
          <StatCard icon="⚙️" label="В работе"       value={myApps.filter(a=>a.status==='in_progress').length} color="var(--yellow)" />
          <StatCard icon="✅" label="Завершено"       value={myApps.filter(a=>a.status==='completed').length}  color="var(--green)"  />
          <StatCard icon="🔔" label="Уведомлений"    value={unread} color={unread>0?'var(--red)':'var(--text-sub)'} sub="непрочитанных" />
        </div>
      )}

      {user.role === 'client' && (
        <>
          <div className="stats-grid">
            <StatCard icon="📋" label="Мои заявки"       value={myApps.length}                                                     color="var(--accent)" />
            <StatCard icon="⏳" label="На рассмотрении"  value={myApps.filter(a=>['submitted','accepted'].includes(a.status)).length} color="var(--yellow)" />
            <StatCard icon="⚙️" label="В процессе"      value={myApps.filter(a=>!['submitted','accepted','rejected','finished'].includes(a.status)).length} color="var(--cyan)" />
            <StatCard icon="🏁" label="Завершено"        value={myApps.filter(a=>a.status==='finished').length}                    color="var(--green)"  />
          </div>
          <div className="cta-banner">
            <div>
              <h3>Подать новую заявку</h3>
              <p>Выберите программу проверки квалификации и заполните форму участника</p>
            </div>
            <Button onClick={() => navigate('/programs')} size="lg">🔬 Выбрать программу</Button>
          </div>
        </>
      )}

      <div className="recent-box">
        <div className="recent-box__header">
          <h3 className="recent-box__title">
            {user.role === 'manager' ? 'Мои задания' : user.role === 'client' ? 'Мои заявки' : 'Последние заявки'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>Все →</Button>
        </div>
        {myApps.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px', color:'var(--text-sub)' }}>
            <div style={{ fontSize:'2rem', marginBottom:'8px' }}>📭</div>
            <div style={{ fontWeight:600 }}>
              {user.role === 'manager' ? 'Заданий пока нет' : 'Заявок пока нет'}
            </div>
            {user.role === 'client' && <Button onClick={()=>navigate('/programs')} style={{ marginTop:'12px' }}>Подать заявку</Button>}
          </div>
        ) : (
          <div className="recent-box__list">
            {myApps.slice(0, 6).map(app => <AppMiniRow key={app.id} app={app} store={store} navigate={navigate} />)}
          </div>
        )}
      </div>
    </div>
  );
}
