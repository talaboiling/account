// src/pages/ArchivePage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, Tabs, StatusBadge } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import '../styles/pages.css';

const TYPE_CONFIG = {
  application:  { icon: '📋', color: 'var(--accent)',  label: 'Заявка',      badgeColor: 'blue'   },
  protocol:     { icon: '🧪', color: 'var(--purple)', label: 'Протокол',    badgeColor: 'purple' },
  result:       { icon: '📄', color: 'var(--green)',   label: 'Заключение',  badgeColor: 'green'  },
  notification: { icon: '🔔', color: 'var(--yellow)',  label: 'Уведомление', badgeColor: 'yellow' },
};

export default function ArchivePage() {
  const store    = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  const allEntries = [
    ...store.getAllApplications().map(a => ({ type: 'application',  data: a, time: a.createdAt })),
    ...store.protocols.map(p =>           ({ type: 'protocol',     data: p, time: p.createdAt })),
    ...store.results.map(r =>             ({ type: 'result',       data: r, time: r.createdAt })),
    ...store.notifications.map(n =>       ({ type: 'notification', data: n, time: n.createdAt })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const filtered = tab === 'all' ? allEntries : allEntries.filter(e => e.type === tab.replace('s', '').replace('notification', 'notification'));

  const tabMap = { applications: 'application', protocols: 'protocol', results: 'result', notifications: 'notification' };
  const filteredByTab = tab === 'all' ? allEntries : allEntries.filter(e => e.type === tabMap[tab]);

  const handleClick = (entry) => {
    if (entry.type === 'application')  navigate(`/applications/${entry.data.id}`);
    if (entry.type === 'protocol')     navigate(`/applications/${entry.data.applicationId}`);
    if (entry.type === 'result')       navigate(`/applications/${entry.data.applicationId}`);
  };

  const getEntryInfo = (entry) => {
    if (entry.type === 'application') {
      const prog   = store.getProgramById(entry.data.programId);
      const client = store.getUserById(entry.data.clientId);
      return { title: prog?.name || '—', sub: `Клиент: ${client?.name}`, code: entry.data.sampleCode };
    }
    if (entry.type === 'protocol') {
      const app = store.applications.find(a => a.id === entry.data.applicationId);
      const mgr = store.getUserById(entry.data.managerId);
      return { title: `Протокол по заявке ${app?.sampleCode}`, sub: `Лаборант: ${mgr?.name}`, code: app?.sampleCode };
    }
    if (entry.type === 'result') {
      const app = store.applications.find(a => a.id === entry.data.applicationId);
      const adm = store.getUserById(entry.data.adminId);
      return { title: `Заключение по заявке ${app?.sampleCode}`, sub: `Администратор: ${adm?.name}`, code: app?.sampleCode };
    }
    return { title: entry.data.message, sub: `Получатели: ${entry.data.targetIds.length} чел.`, code: null };
  };

  return (
    <div className="archive-page">
      <PageHeader title="Архив / Журнал событий"
        subtitle="Полная история всех операций системы, отсортированная по времени" />
      <Tabs
        tabs={[
          { id: 'all',           label: 'Все события',  count: allEntries.length },
          { id: 'applications',  label: 'Заявки',       count: allEntries.filter(e => e.type === 'application').length  },
          { id: 'protocols',     label: 'Протоколы',    count: allEntries.filter(e => e.type === 'protocol').length     },
          { id: 'results',       label: 'Заключения',   count: allEntries.filter(e => e.type === 'result').length       },
          { id: 'notifications', label: 'Уведомления',  count: allEntries.filter(e => e.type === 'notification').length },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="archive-list">
        {filteredByTab.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>Записей нет</div>
        ) : filteredByTab.map((entry, i) => {
          const cfg  = TYPE_CONFIG[entry.type];
          const info = getEntryInfo(entry);
          const clickable = entry.type !== 'notification';
          return (
            <div
              key={`${entry.type}-${entry.data.id}`}
              onClick={() => handleClick(entry)}
              className={`archive-item${clickable ? ' archive-item--clickable' : ''}`}
              style={{ animationDelay: `${(i % 20) * 0.025}s` }}
            >
              <div className="archive-item__icon-wrap" style={{ background: `${cfg.color}15` }}>
                {cfg.icon}
              </div>
              <div className="archive-item__body">
                <div className="archive-item__badges">
                  <Badge color={cfg.badgeColor} className="badge--xs">{cfg.label}</Badge>
                  {entry.type === 'application' && <StatusBadge status={entry.data.status} />}
                  {info.code && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-main)', fontWeight: 700 }}>{info.code}</span>}
                </div>
                <div className="archive-item__title">{info.title}</div>
                {info.sub && <div className="archive-item__sub">{info.sub}</div>}
              </div>
              <div className="archive-item__time">
                {format(new Date(entry.time), 'd MMM yyyy HH:mm', { locale: ru })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
