// src/pages/ResultsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, EmptyState } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import '../styles/pages.css';

export default function ResultsPage() {
  const store    = useStore();
  const user     = store.currentUser;
  const navigate = useNavigate();

  const results = user.role === 'client'
    ? store.results.filter(r => {
        const app = store.applications.find(a => a.id === r.applicationId);
        return app?.clientId === user.id;
      })
    : store.results;

  return (
    <div className="results-page">
      <PageHeader title="Итоговые заключения" subtitle={`Всего заключений: ${results.length}`} />
      {results.length === 0 ? (
        <EmptyState icon="📄" title="Заключений нет"
          subtitle="Итоговые заключения формируются администраторами после доставки протоколов" />
      ) : (
        <div className="results-list">
          {results.map((result, i) => {
            const app     = store.applications.find(a => a.id === result.applicationId);
            const program = app ? store.getProgramById(app.programId) : null;
            const client  = app ? store.getUserById(app.clientId) : null;
            const admin   = store.getUserById(result.adminId);
            return (
              <div key={result.id} className="result-card"
                onClick={() => navigate(`/applications/${result.applicationId}`)}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="result-card__top">
                  <div className="result-card__left">
                    <div className="result-card__icon">📄</div>
                    <div>
                      <div className="result-card__code">{app?.sampleCode}</div>
                      <div className="result-card__name">{program?.name}</div>
                      <div className="result-card__meta">
                        {client && <span className="result-card__meta-item">👤 {client.name}</span>}
                        {admin  && <span className="result-card__meta-item">👨‍💼 {admin.name}</span>}
                        <span className="result-card__meta-item">
                          {format(new Date(result.createdAt), 'd MMM yyyy', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge color={result.clientConfirmed ? 'green' : 'blue'}>
                    {result.clientConfirmed ? '✅ Подтверждено' : '📤 Отправлено'}
                  </Badge>
                </div>
                <div className="result-card__preview">{result.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
