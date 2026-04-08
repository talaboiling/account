// src/pages/ArchivePage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, Tabs, StatusBadge, EmptyState } from '../components/ui';
import { APPLICATION_STATUSES } from '../data/store';
import '../styles/pages.css';

const TYPE_CFG = {
  application:  { icon:'📋', color:'var(--accent)',  bg:'rgba(79,142,247,0.12)',   badgeColor:'blue',   label:'Заявка'       },
  status_event: { icon:'🔄', color:'var(--yellow)',  bg:'rgba(245,197,66,0.12)',   badgeColor:'yellow', label:'Статус'       },
  notification: { icon:'🔔', color:'var(--purple)',  bg:'rgba(164,127,255,0.12)', badgeColor:'purple', label:'Уведомление'  },
  contract:     { icon:'📝', color:'var(--cyan)',    bg:'rgba(56,189,248,0.12)',   badgeColor:'cyan',   label:'Договор'      },
  document:     { icon:'📦', color:'var(--green)',   bg:'rgba(60,201,138,0.12)',   badgeColor:'green',  label:'Документ'     },
};

export default function ArchivePage() {
  const store    = useStore();
  const navigate = useNavigate();
  const [tab,    setTab]    = useState('all');
  const [search, setSearch] = useState('');

  // Build flat log from all sources
  const entries = [];

  store.getAllApplications().forEach(app => {
    const prog   = store.getProgramById(app.programId);
    const client = store.getUserById(app.clientId);

    // Application creation
    entries.push({
      type: 'application', time: app.createdAt, appId: app.id,
      title: `Подана заявка ${app.appNumber}`,
      sub: `${prog?.name} · ${client?.orgName || client?.name}`,
      badge: <StatusBadge status={app.status} />,
    });

    // Each timeline event
    app.timeline.forEach(ev => {
      const cfg = APPLICATION_STATUSES[ev.status];
      const byUser = store.getUserById(ev.by);
      entries.push({
        type: 'status_event', time: ev.date, appId: app.id,
        title: `${app.appNumber}: статус → «${cfg?.label || ev.status}»`,
        sub: `${byUser?.name || ev.by}${ev.note ? ` · ${ev.note}` : ''}`,
        badge: cfg ? <Badge color={cfg.color}>{cfg.label}</Badge> : null,
      });
    });

    // Contract files
    if (app.draftContractUrl) entries.push({
      type: 'contract', time: app.updatedAt, appId: app.id,
      title: `Драфт договора: ${app.draftContractUrl}`,
      sub: app.appNumber,
    });
    if (app.signedContractUrl) entries.push({
      type: 'contract', time: app.updatedAt, appId: app.id,
      title: `Подписанный договор: ${app.signedContractUrl}`,
      sub: app.appNumber,
    });

    // Final documents
    if (app.conclusionUrl) entries.push({
      type: 'document', time: app.updatedAt, appId: app.id,
      title: `Заключение: ${app.conclusionUrl}`,
      sub: app.appNumber,
    });
    if (app.reportUrl) entries.push({
      type: 'document', time: app.updatedAt, appId: app.id,
      title: `Отчёт: ${app.reportUrl}`,
      sub: app.appNumber,
    });
    if (app.certificateUrl) entries.push({
      type: 'document', time: app.updatedAt, appId: app.id,
      title: `Свидетельство: ${app.certificateUrl}`,
      sub: app.appNumber,
    });
  });

  // Notifications
  store.notifications.forEach(n => {
    entries.push({
      type: 'notification', time: n.createdAt, appId: n.relatedId,
      title: n.message,
      sub: `${n.targetIds.length} получателей`,
    });
  });

  // Sort by time descending
  entries.sort((a, b) => new Date(b.time) - new Date(a.time));

  const tabMap = { applications:'application', statuses:'status_event', contracts:'contract', documents:'document', notifications:'notification' };

  const filtered = entries.filter(e => {
    const matchTab = tab === 'all' || e.type === tabMap[tab];
    const q = search.toLowerCase();
    const matchSearch = !search || e.title.toLowerCase().includes(q) || e.sub?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const count = t => entries.filter(e => e.type === tabMap[t]).length;

  const fmtDate = d => new Date(d).toLocaleString('ru-RU', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div className="fade-in">
      <PageHeader title="Архив / Журнал событий" subtitle={`Всего записей: ${entries.length}`} />

      <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Поиск по событиям..." />
      </div>

      <Tabs
        tabs={[
          { id:'all',           label:'Все',           count: entries.length },
          { id:'applications',  label:'Заявки',        count: count('applications')  },
          { id:'statuses',      label:'Статусы',       count: count('statuses')      },
          { id:'contracts',     label:'Договоры',      count: count('contracts')     },
          { id:'documents',     label:'Документы',     count: count('documents')     },
          { id:'notifications', label:'Уведомления',   count: count('notifications') },
        ]}
        active={tab}
        onChange={setTab}
      />

      {filtered.length === 0 ? (
        <EmptyState icon="🗄️" title="Записей не найдено" />
      ) : (
        <div className="archive-list">
          {filtered.map((e, i) => {
            const cfg = TYPE_CFG[e.type] || TYPE_CFG.notification;
            return (
              <div
                key={i}
                onClick={() => e.appId && navigate(`/applications/${e.appId}`)}
                className={`archive-item${e.appId ? ' archive-item--link' : ''}`}
              >
                <div className="archive-item__icon" style={{ background: cfg.bg, color: cfg.color, borderRadius:'8px', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>
                  {cfg.icon}
                </div>
                <div className="archive-item__body">
                  <div className="archive-item__row">
                    <Badge color={cfg.badgeColor} className="badge--xs">{cfg.label}</Badge>
                    {e.badge}
                  </div>
                  <div className="archive-item__title">{e.title}</div>
                  {e.sub && <div className="archive-item__sub">{e.sub}</div>}
                </div>
                <div className="archive-item__time">{fmtDate(e.time)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
