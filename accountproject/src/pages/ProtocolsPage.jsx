// src/pages/ProtocolsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, EmptyState } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import '../styles/pages.css';

const STATUS_COLOR = { pending: 'yellow', sent: 'blue', delivered: 'green' };
const STATUS_LABEL = { pending: 'Ожидает отправки', sent: 'Отправлен', delivered: 'Доставлен' };

export default function ProtocolsPage() {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();

  const protocols = user.role === 'manager'
    ? store.protocols.filter(p => p.managerId === user.id)
    : store.protocols;

  return (
    <div className="protocols-page">
      <PageHeader title="Протоколы испытаний" subtitle={`Всего протоколов: ${protocols.length}`} />
      {protocols.length === 0 ? (
        <EmptyState icon="🧪" title="Протоколов нет"
          subtitle="Протоколы создаются лаборантами после проведения исследований" />
      ) : (
        <div className="protocols-list">
          {protocols.map((proto, i) => {
            const app     = store.applications.find(a => a.id === proto.applicationId);
            const program = app ? store.getProgramById(app.programId) : null;
            const mgr     = store.getUserById(proto.managerId);
            const client  = app ? store.getUserById(app.clientId) : null;
            return (
              <div key={proto.id} className="protocol-card"
                onClick={() => navigate(`/applications/${proto.applicationId}`)}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="protocol-card__top">
                  <div className="protocol-card__left">
                    <div className="protocol-card__icon">🧪</div>
                    <div>
                      <div className="protocol-card__code">{app?.sampleCode}</div>
                      <div className="protocol-card__name">{program?.name}</div>
                      <div className="protocol-card__meta">
                        {client && <span className="protocol-card__meta-item">👤 {client.name}</span>}
                        {mgr    && <span className="protocol-card__meta-item">🔬 {mgr.name}</span>}
                        <span className="protocol-card__meta-item">
                          {format(new Date(proto.createdAt), 'd MMM yyyy', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge color={STATUS_COLOR[proto.status] || 'default'}>
                    {STATUS_LABEL[proto.status] || proto.status}
                  </Badge>
                </div>
                <div className="protocol-card__preview">{proto.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
