// src/pages/ApplicationsPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, StatusBadge, Button, Tabs, EmptyState } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import '../styles/pages.css';

export default function ApplicationsPage() {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allApps = user.role === 'client'
    ? store.getApplicationsForClient(user.id)
    : user.role === 'manager'
    ? store.getApplicationsForManager(user.id)
    : store.getAllApplications();

  const filtered = allApps.filter(app => {
    const program = store.getProgramById(app.programId);
    const client  = store.getUserById(app.clientId);
    const matchSearch = !search
      || app.sampleCode.toLowerCase().includes(search.toLowerCase())
      || program?.name.toLowerCase().includes(search.toLowerCase())
      || client?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:      allApps.length,
    pending:  allApps.filter(a => a.status === 'pending').length,
    signed:   allApps.filter(a => a.status === 'signed').length,
    rejected: allApps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="apps-page">
      <PageHeader
        title={user.role === 'client' ? 'Мои заявки' : user.role === 'manager' ? 'Заявки' : 'Все заявки'}
        subtitle={user.role === 'client' ? 'Список ваших поданных заявок и их статусы' : 'Управление заявками клиентов'}
        actions={user.role === 'client' && <Button onClick={() => navigate('/programs')}>+ Новая заявка</Button>}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          className="search-bar"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Поиск по коду, программе, клиенту..."
        />
      </div>

      <Tabs
        tabs={[
          { id: 'all',      label: 'Все',              count: counts.all      },
          { id: 'pending',  label: 'На рассмотрении',  count: counts.pending  },
          { id: 'signed',   label: 'Подписанные',       count: counts.signed   },
          { id: 'rejected', label: 'Отклонённые',       count: counts.rejected },
        ]}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="Заявок не найдено"
          subtitle={search ? 'Попробуйте изменить параметры поиска' : 'Здесь пока пусто'} />
      ) : (
        <div className="apps-list">
          {filtered.map((app, i) => {
            const program = store.getProgramById(app.programId);
            const client  = store.getUserById(app.clientId);
            const manager = store.getUserById(app.assignedManagerId);
            return (
              <div
                key={app.id}
                className="app-card"
                onClick={() => navigate(`/applications/${app.id}`)}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="app-card__inner">
                  <div className="app-card__left">
                    <div className="app-card__icon">{program?.icon}</div>
                    <div className="app-card__info">
                      <div className="app-card__badges">
                        <span className="app-card__code">{app.sampleCode}</span>
                        {app.protocolReady && <Badge color="purple">🧪 Протокол готов</Badge>}
                        {app.resultReady   && <Badge color="green">📄 Заключение готово</Badge>}
                      </div>
                      <div className="app-card__name">{program?.name}</div>
                      <div className="app-card__meta">
                        {user.role !== 'client' && client && <span className="app-card__meta-item">👤 {client.name}</span>}
                        {manager && <span className="app-card__meta-item">🔬 {manager.name}</span>}
                        <span className="app-card__date">
                          {format(new Date(app.createdAt), 'd MMM yyyy', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="app-card__right">
                    <StatusBadge status={app.status} />
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
