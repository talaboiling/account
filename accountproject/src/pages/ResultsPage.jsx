// src/pages/ResultsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, EmptyState } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ResultsPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();

  const results = user.role === 'client'
    ? store.results.filter(r => { const app = store.applications.find(a => a.id === r.applicationId); return app?.clientId === user.id; })
    : store.results;

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader title="Итоговые заключения" subtitle={`Всего заключений: ${results.length}`} />
      {results.length === 0 ? (
        <EmptyState icon="📄" title="Заключений нет" subtitle="Итоговые заключения формируются администраторами после доставки протоколов" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {results.map((result, i) => {
            const app = store.applications.find(a => a.id === result.applicationId);
            const program = app ? store.getProgramById(app.programId) : null;
            const client = app ? store.getUserById(app.clientId) : null;
            const admin = store.getUserById(result.adminId);
            return (
              <div key={result.id} onClick={() => navigate(`/applications/${result.applicationId}`)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 18px', cursor:'pointer', transition:'all var(--transition)', animation:`fadeIn 0.25s ease ${i*0.04}s both` }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.borderColor='var(--border-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'1.4rem', flexShrink:0 }}>📄</div>
                    <div>
                      <div style={{ fontSize:'0.75rem', color:'var(--green)', fontWeight:700, fontFamily:'var(--font-main)' }}>{app?.sampleCode}</div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', marginTop:'2px' }}>{program?.name}</div>
                      <div style={{ display:'flex', gap:'10px', marginTop:'3px', flexWrap:'wrap' }}>
                        {client && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>👤 {client.name}</span>}
                        {admin && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>👨‍💼 {admin.name}</span>}
                        <span style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{format(new Date(result.createdAt), 'd MMM yyyy', { locale:ru })}</span>
                      </div>
                    </div>
                  </div>
                  <Badge color={result.clientConfirmed ? 'green' : 'blue'}>
                    {result.clientConfirmed ? '✅ Подтверждено' : '📤 Отправлено'}
                  </Badge>
                </div>
                <div style={{ marginTop:'10px', background:'var(--bg-card2)', borderRadius:'var(--radius-sm)', padding:'10px 12px', fontSize:'0.8rem', color:'var(--text-sub)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {result.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
