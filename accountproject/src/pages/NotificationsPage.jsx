// src/pages/NotificationsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, Badge, EmptyState } from '../components/ui';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const NOTIF_ICONS = {
  application_submitted: '📋',
  status_changed: '🔄',
  manager_assigned: '👤',
  protocol_ready: '🧪',
  protocol_sent: '📤',
  protocol_delivered: '📬',
  result_sent: '📄',
  default: '🔔',
};

export default function NotificationsPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();

  const notifs = store.getNotificationsForUser(user.id);
  const unread = notifs.filter(n => !n.read).length;

  const handleClick = (notif) => {
    store.markNotificationRead(notif.id);
    if (notif.relatedId) {
      const app = store.applications.find(a => a.id === notif.relatedId);
      if (app) navigate(`/applications/${app.id}`);
      const result = store.results.find(r => r.id === notif.relatedId);
      if (result) navigate(`/applications/${result.applicationId}`);
      const proto = store.protocols.find(p => p.id === notif.relatedId);
      if (proto) navigate(`/applications/${proto.applicationId}`);
    }
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Уведомления"
        subtitle={unread > 0 ? `${unread} непрочитанных` : 'Все прочитаны'}
        actions={unread > 0 && <Button variant="ghost" size="sm" onClick={() => store.markAllRead(user.id)}>✓ Отметить все как прочитанные</Button>}
      />

      {notifs.length === 0 ? (
        <EmptyState icon="🔔" title="Уведомлений нет" subtitle="Здесь будут появляться все важные события" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {notifs.map((notif, i) => (
            <div key={notif.id} onClick={() => handleClick(notif)} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'14px 16px', background: notif.read ? 'var(--bg-card)' : 'var(--accent-dim)', border: `1px solid ${notif.read ? 'var(--border)' : 'rgba(79,142,247,0.25)'}`, borderRadius:'var(--radius)', cursor: notif.relatedId ? 'pointer' : 'default', transition:'all var(--transition)', animation:`fadeIn 0.25s ease ${i*0.03}s both` }}
              onMouseEnter={e => { if(notif.relatedId) e.currentTarget.style.background='var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = notif.read ? 'var(--bg-card)' : 'var(--accent-dim)'; }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background: notif.read ? 'var(--bg-card2)' : 'rgba(79,142,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                {NOTIF_ICONS[notif.type] || NOTIF_ICONS.default}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.875rem', color: notif.read ? 'var(--text)' : 'var(--text)', fontWeight: notif.read ? 400 : 600 }}>{notif.message}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-dim)', marginTop:'3px' }}>
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix:true, locale:ru })}
                </div>
              </div>
              {!notif.read && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:'4px' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
