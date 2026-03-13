// src/pages/ApplicationsPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, StatusBadge, Button, Tabs, EmptyState } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ApplicationsPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allApps = user.role === 'client'
    ? store.getApplicationsForClient(user.id)
    : user.role === 'manager'
    ? store.getApplicationsForManager(user.id)
    : store.getAllApplications();

  const filtered = allApps.filter(app => {
    const program = store.getProgramById(app.programId);
    const client = store.getUserById(app.clientId);
    const matchSearch = !search || app.sampleCode.toLowerCase().includes(search.toLowerCase()) || program?.name.toLowerCase().includes(search.toLowerCase()) || client?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: allApps.length,
    pending: allApps.filter(a => a.status === 'pending').length,
    signed: allApps.filter(a => a.status === 'signed').length,
    rejected: allApps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader
        title={user.role === 'client' ? 'Мои заявки' : user.role === 'manager' ? 'Заявки' : 'Все заявки'}
        subtitle={user.role === 'client' ? 'Список ваших поданных заявок и их статусы' : 'Управление заявками клиентов'}
        actions={user.role === 'client' && <Button onClick={() => navigate('/programs')}>+ Новая заявка</Button>}
      />

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Поиск по коду, программе, клиенту..." style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'9px 14px', color:'var(--text)', fontSize:'0.875rem', flex:1, minWidth:'200px', outline:'none' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
      </div>

      <Tabs
        tabs={[
          { id:'all', label:'Все', count: counts.all },
          { id:'pending', label:'На рассмотрении', count: counts.pending },
          { id:'signed', label:'Подписанные', count: counts.signed },
          { id:'rejected', label:'Отклонённые', count: counts.rejected },
        ]}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="Заявок не найдено" subtitle={search ? 'Попробуйте изменить параметры поиска' : 'Здесь пока пусто'} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map((app, i) => {
            const program = store.getProgramById(app.programId);
            const client = store.getUserById(app.clientId);
            const manager = store.getUserById(app.assignedManagerId);
            return (
              <div key={app.id} onClick={() => navigate(`/applications/${app.id}`)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 18px', cursor:'pointer', transition:'all var(--transition)', animation:`fadeIn 0.25s ease ${i*0.03}s both` }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.borderColor='var(--border-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0, flex:1 }}>
                    <div style={{ fontSize:'1.3rem', flexShrink:0 }}>{program?.icon}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.75rem', color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-main)' }}>{app.sampleCode}</span>
                        {app.protocolReady && <Badge color="purple">🧪 Протокол готов</Badge>}
                        {app.resultReady && <Badge color="green">📄 Заключение готово</Badge>}
                      </div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{program?.name}</div>
                      <div style={{ display:'flex', gap:'10px', marginTop:'3px', flexWrap:'wrap' }}>
                        {user.role !== 'client' && client && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>👤 {client.name}</span>}
                        {manager && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>🔬 {manager.name}</span>}
                        <span style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{format(new Date(app.createdAt), 'd MMM yyyy', { locale:ru })}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }}>
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
