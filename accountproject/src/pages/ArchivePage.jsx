// src/pages/ArchivePage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, Tabs, StatusBadge } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ArchivePage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();
  const [tab, setTab] = useState('applications');

  // Build a combined log sorted by time
  const allEntries = [
    ...store.getAllApplications().map(a => ({ type:'application', data:a, time:a.createdAt })),
    ...store.protocols.map(p => ({ type:'protocol', data:p, time:p.createdAt })),
    ...store.results.map(r => ({ type:'result', data:r, time:r.createdAt })),
    ...store.notifications.map(n => ({ type:'notification', data:n, time:n.createdAt })),
  ].sort((a,b) => new Date(b.time) - new Date(a.time));

  const tabs = [
    { id:'all', label:'Все события', count: allEntries.length },
    { id:'applications', label:'Заявки', count: store.getAllApplications().length },
    { id:'protocols', label:'Протоколы', count: store.protocols.length },
    { id:'results', label:'Заключения', count: store.results.length },
    { id:'notifications', label:'Уведомления', count: store.notifications.length },
  ];

  const filtered = tab === 'all' ? allEntries : allEntries.filter(e => {
    if (tab === 'applications') return e.type === 'application';
    if (tab === 'protocols') return e.type === 'protocol';
    if (tab === 'results') return e.type === 'result';
    if (tab === 'notifications') return e.type === 'notification';
    return true;
  });

  const TYPE_CONFIG = {
    application: { icon:'📋', color:'var(--accent)', label:'Заявка' },
    protocol: { icon:'🧪', color:'var(--purple)', label:'Протокол' },
    result: { icon:'📄', color:'var(--green)', label:'Заключение' },
    notification: { icon:'🔔', color:'var(--yellow)', label:'Уведомление' },
  };

  const renderEntry = (entry, i) => {
    const cfg = TYPE_CONFIG[entry.type];
    let title = '', sub = '', code = '';

    if (entry.type === 'application') {
      const app = entry.data;
      const prog = store.getProgramById(app.programId);
      const client = store.getUserById(app.clientId);
      title = prog?.name || '—';
      sub = `Клиент: ${client?.name}`;
      code = app.sampleCode;
    } else if (entry.type === 'protocol') {
      const proto = entry.data;
      const app = store.applications.find(a => a.id === proto.applicationId);
      const mgr = store.getUserById(proto.managerId);
      title = `Протокол по заявке ${app?.sampleCode}`;
      sub = `Лаборант: ${mgr?.name}`;
      code = app?.sampleCode;
    } else if (entry.type === 'result') {
      const res = entry.data;
      const app = store.applications.find(a => a.id === res.applicationId);
      const adm = store.getUserById(res.adminId);
      title = `Заключение по заявке ${app?.sampleCode}`;
      sub = `Администратор: ${adm?.name}`;
      code = app?.sampleCode;
    } else if (entry.type === 'notification') {
      title = entry.data.message;
      sub = `Получатели: ${entry.data.targetIds.length} чел.`;
    }

    const handleClick = () => {
      if (entry.type === 'application') navigate(`/applications/${entry.data.id}`);
      else if (entry.type === 'protocol') navigate(`/applications/${entry.data.applicationId}`);
      else if (entry.type === 'result') navigate(`/applications/${entry.data.applicationId}`);
    };

    return (
      <div key={`${entry.type}-${entry.data.id}`} onClick={handleClick} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'13px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor: entry.type !== 'notification' ? 'pointer' : 'default', transition:'background var(--transition)', animation:`fadeIn 0.2s ease ${(i%20)*0.025}s both` }}
        onMouseEnter={e => { if(entry.type !== 'notification') e.currentTarget.style.background='var(--bg-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; }}>
        <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:`${cfg.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>{cfg.icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <Badge color={entry.type === 'application' ? 'blue' : entry.type === 'protocol' ? 'purple' : entry.type === 'result' ? 'green' : 'yellow'} style={{ fontSize:'0.68rem' }}>{cfg.label}</Badge>
            {entry.type === 'application' && <StatusBadge status={entry.data.status} />}
            {code && <span style={{ fontSize:'0.72rem', color:'var(--text-dim)', fontFamily:'var(--font-main)', fontWeight:700 }}>{code}</span>}
          </div>
          <div style={{ fontSize:'0.875rem', fontWeight:500, marginTop:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
          {sub && <div style={{ fontSize:'0.75rem', color:'var(--text-sub)', marginTop:'1px' }}>{sub}</div>}
        </div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-dim)', whiteSpace:'nowrap', flexShrink:0, marginTop:'2px' }}>
          {format(new Date(entry.time), 'd MMM yyyy HH:mm', { locale:ru })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader title="Архив / Журнал событий" subtitle="Полная история всех операций системы, отсортированная по времени" />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text-sub)' }}>Записей нет</div>
        ) : filtered.map((entry, i) => renderEntry(entry, i))}
      </div>
    </div>
  );
}
