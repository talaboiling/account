// src/pages/ProtocolsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, EmptyState } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ProtocolsPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();

  const protocols = user.role === 'manager'
    ? store.protocols.filter(p => p.managerId === user.id)
    : store.protocols;

  const statusColor = { pending:'yellow', sent:'blue', delivered:'green' };
  const statusLabel = { pending:'Ожидает отправки', sent:'Отправлен', delivered:'Доставлен' };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader title="Протоколы испытаний" subtitle={`Всего протоколов: ${protocols.length}`} />
      {protocols.length === 0 ? (
        <EmptyState icon="🧪" title="Протоколов нет" subtitle="Протоколы создаются лаборантами после проведения исследований" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {protocols.map((proto, i) => {
            const app = store.applications.find(a => a.id === proto.applicationId);
            const program = app ? store.getProgramById(app.programId) : null;
            const mgr = store.getUserById(proto.managerId);
            const client = app ? store.getUserById(app.clientId) : null;
            return (
              <div key={proto.id} onClick={() => navigate(`/applications/${proto.applicationId}`)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 18px', cursor:'pointer', transition:'all var(--transition)', animation:`fadeIn 0.25s ease ${i*0.04}s both` }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.borderColor='var(--border-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'1.4rem', flexShrink:0 }}>🧪</div>
                    <div>
                      <div style={{ fontSize:'0.75rem', color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-main)' }}>{app?.sampleCode}</div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', marginTop:'2px' }}>{program?.name}</div>
                      <div style={{ display:'flex', gap:'10px', marginTop:'3px', flexWrap:'wrap' }}>
                        {client && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>👤 {client.name}</span>}
                        {mgr && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>🔬 {mgr.name}</span>}
                        <span style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>{format(new Date(proto.createdAt), 'd MMM yyyy', { locale:ru })}</span>
                      </div>
                    </div>
                  </div>
                  <Badge color={statusColor[proto.status] || 'default'}>{statusLabel[proto.status] || proto.status}</Badge>
                </div>
                <div style={{ marginTop:'10px', background:'var(--bg-card2)', borderRadius:'var(--radius-sm)', padding:'10px 12px', fontSize:'0.8rem', color:'var(--text-sub)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {proto.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
