// src/pages/NotificationsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, EmptyState } from '../components/ui';
import '../styles/pages.css';

const ICONS = {
  app_submitted:    '📋',
  status_changed:   '🔄',
  draft_sent:       '📄',
  signed_contract:  '✅',
  task_assigned:    '📌',
  work_status:      '⚙️',
  samples_sent:     '📦',
  samples_received: '✓',
  protocol_uploaded:'🔬',
  finished:         '🏁',
  default:          '🔔',
};

export default function NotificationsPage() {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();
  const notifs   = store.getNotificationsForUser(user.id);
  const unread   = notifs.filter(n => !n.read).length;

  const handleClick = n => {
    store.markNotificationRead(n.id);
    if (!n.relatedId) return;
    const app = store.applications.find(a => a.id === n.relatedId);
    if (app) navigate(`/applications/${app.id}`);
  };

  const fmt = date => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)   return 'только что';
    if (diff < 3600) return `${Math.floor(diff/60)} мин. назад`;
    if (diff < 86400)return `${Math.floor(diff/3600)} ч. назад`;
    return d.toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' });
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Уведомления"
        subtitle={unread > 0 ? `${unread} непрочитанных` : 'Все прочитаны'}
        actions={unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => store.markAllRead(user.id)}>
            ✓ Прочитать все
          </Button>
        )}
      />

      {notifs.length === 0 ? (
        <EmptyState icon="🔔" title="Уведомлений нет" subtitle="Здесь будут появляться события по вашим заявкам" />
      ) : (
        <div className="notifs-list">
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={[
                'notif-item',
                n.read ? 'notif-item--read' : 'notif-item--unread',
                n.relatedId ? 'notif-item--link' : '',
              ].join(' ')}
            >
              <div className={`notif-item__avatar${n.read ? '' : ' notif-item__avatar--unread'}`}>
                {ICONS[n.type] || ICONS.default}
              </div>
              <div className="notif-item__body">
                <div className={`notif-item__msg${n.read ? '' : ' notif-item__msg--bold'}`}>
                  {n.message}
                </div>
                <div className="notif-item__time">{fmt(n.createdAt)}</div>
              </div>
              {!n.read && <div className="notif-item__dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
