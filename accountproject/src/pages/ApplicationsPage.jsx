// src/pages/ApplicationsPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge, Button, Tabs, EmptyState } from '../components/ui';
import '../styles/pages.css';

export default function ApplicationsPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const base = user.role === 'client' ? store.getApplicationsForClient(user.id)
    : user.role === 'manager' ? store.getApplicationsForManager(user.id)
      : store.getAllApplications();

  // Group tabs
  const inProgress = ['accepted', 'draft_sent', 'signed', 'active', 'in_progress', 'completed', 'samples_sent', 'samples_received', 'protocol_uploaded', 'processing'];

  const filtered = base.filter(app => {
    const prog = store.getProgramById(app.programId);
    const client = store.getUserById(app.clientId);
    const q = search.toLowerCase();
    const matchQ = !search
      || app.appNumber.toLowerCase().includes(q)
      || prog?.name.toLowerCase().includes(q)
      || client?.name.toLowerCase().includes(q)
      || client?.orgName?.toLowerCase().includes(q);
    const matchTab = tab === 'all' ? true
      : tab === 'new' ? app.status === 'submitted'
        : tab === 'active' ? inProgress.includes(app.status)
          : tab === 'finished' ? app.status === 'finished'
            : tab === 'rejected' ? app.status === 'rejected'
              : true;
    return matchQ && matchTab;
  });

  const c = s => base.filter(a => s(a)).length;

  const tabDefs = [
    { id: 'all', label: 'Все', count: base.length },
    { id: 'new', label: 'Новые', count: c(a => a.status === 'submitted') },
    { id: 'active', label: 'В процессе', count: c(a => inProgress.includes(a.status)) },
    { id: 'finished', label: 'Завершённые', count: c(a => a.status === 'finished') },
    { id: 'rejected', label: 'Отклонённые', count: c(a => a.status === 'rejected') },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title={user.role === 'manager' ? 'Мои задания' : user.role === 'client' ? 'Мои заявки' : 'Все заявки'}
        subtitle={user.role === 'manager' ? 'Задания, назначенные вам администратором' : user.role === 'client' ? 'Ваши заявки на участие в программах ПК' : 'Управление заявками участников'}
        actions={user.role === 'client' && <Button onClick={() => navigate('/programs')}>+ Новая заявка</Button>}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Поиск по номеру, программе, организации..." />
      </div>

      <Tabs tabs={tabDefs} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="Заявок не найдено" subtitle={search ? 'Попробуйте изменить параметры поиска' : 'Здесь пока пусто'} />
      ) : (
        <div className="apps-list">
          {filtered.map((app, i) => {
            const prog = store.getProgramById(app.programId);
            const client = store.getUserById(app.clientId);
            const mgr = store.getUserById(app.assignedManagerId);
            return (
              <div key={app.id} className="app-card" onClick={() => navigate(`/applications/${app.id}`)} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="app-card__inner">
                  <div className="app-card__left">
                    <div className="app-card__prog-icon">{prog?.icon}</div>
                    <div className="app-card__info">
                      <div className="app-card__number">{app.appNumber}</div>
                      <div className="app-card__name">{prog?.name}</div>
                      <div className="app-card__meta">
                        {user.role !== 'client' && <span className="app-card__meta-item">🏢 {client?.orgName || client?.name}</span>}
                        {mgr && <span className="app-card__meta-item">👤 {mgr.name}</span>}
                        <span className="app-card__meta-item">
                          {new Date(app.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="app-card__right">
                    <StatusBadge status={app.status} role={user.role} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
