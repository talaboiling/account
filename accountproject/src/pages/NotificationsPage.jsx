// src/pages/NotificationsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, EmptyState } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import '../styles/pages.css';

const NOTIF_ICONS = {
  application_submitted: '📋',
  status_changed:        '🔄',
  manager_assigned:      '👤',
  protocol_ready:        '🧪',
  protocol_sent:         '📤',
  protocol_delivered:    '📬',
  result_sent:           '📄',
  default:               '🔔',
};

export default function NotificationsPage() {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();
  const notifs   = store.getNotificationsForUser(user.id);
  const unread   = notifs.filter(n => !n.read).length;

  const handleClick = (notif) => {
    store.markNotificationRead(notif.id);
    if (!notif.relatedId) return;
    const app    = store.applications.find(a => a.id === notif.relatedId);
    if (app)    { navigate(`/applications/${app.id}`); return; }
    const result = store.results.find(r => r.id === notif.relatedId);
    if (result) { navigate(`/applications/${result.applicationId}`); return; }
    const proto  = store.protocols.find(p => p.id === notif.relatedId);
    if (proto)  { navigate(`/applications/${proto.applicationId}`); }
  };

  return (
    <div className="notifs-page">
      <PageHeader
        title="Уведомления"
        subtitle={unread > 0 ? `${unread} непрочитанных` : 'Все прочитаны'}
        actions={unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => store.markAllRead(user.id)}>
            ✓ Отметить все как прочитанные
          </Button>
        )}
      />
      {notifs.length === 0 ? (
        <EmptyState icon="🔔" title="Уведомлений нет"
          subtitle="Здесь будут появляться все важные события" />
      ) : (
        <div className="notifs-list">
          {notifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={[
                'notif-item',
                notif.read   ? 'notif-item--read'      : 'notif-item--unread',
                notif.relatedId ? 'notif-item--clickable' : '',
              ].join(' ')}
            >
              <div className={`notif-item__avatar ${notif.read ? 'notif-item__avatar--read' : 'notif-item__avatar--unread'}`}>
                {NOTIF_ICONS[notif.type] || NOTIF_ICONS.default}
              </div>
              <div className="notif-item__body">
                <div className={`notif-item__msg${notif.read ? '' : ' notif-item__msg--unread'}`}>
                  {notif.message}
                </div>
                <div className="notif-item__time">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ru })}
                </div>
              </div>
              {!notif.read && <div className="notif-item__dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
