// src/pages/ToursPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Badge, StatusBadge, EmptyState, Tabs } from '../components/ui';
import { TOUR_STATUSES } from '../data/store';
import '../styles/pages.css';

function TourBadge({ status }) {
  const cfg = TOUR_STATUSES[status] || { label: status, color: 'default' };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export default function ToursPage() {
  const store    = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  const allTours = [...store.tours].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = tab === 'all' ? allTours : allTours.filter(t => t.status === tab);

  const tabDefs = [
    { id: 'all',          label: 'Все',               count: allTours.length },
    { id: 'forming',      label: 'Набор',             count: allTours.filter(t => t.status === 'forming').length },
    { id: 'active',       label: 'Активные',          count: allTours.filter(t => t.status === 'active').length },
    { id: 'in_progress',  label: 'В работе',          count: allTours.filter(t => t.status === 'in_progress').length },
    { id: 'samples_sent', label: 'Образцы отправлены',count: allTours.filter(t => t.status === 'samples_sent').length },
    { id: 'finished',     label: 'Завершённые',       count: allTours.filter(t => t.status === 'finished').length },
  ];

  // Summary: participants per program
  const programSummary = store.programs.map(prog => {
    const tours = allTours.filter(t => t.programId === prog.id);
    const totalParticipants = tours.reduce((sum, t) => sum + t.applicationIds.length, 0);
    const activeTours = tours.filter(t => !['finished'].includes(t.status));
    return { prog, tours, totalParticipants, activeTours };
  }).filter(s => s.tours.length > 0);

  return (
    <div className="fade-in">
      <PageHeader
        title="Туры"
        subtitle="Управление групповыми турами по программам проверки квалификации"
      />

      {/* Program summary cards */}
      {programSummary.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-main)', fontSize: '0.9rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Участники по программам
          </h3>
          <div className="tour-program-grid">
            {programSummary.map(({ prog, tours, totalParticipants, activeTours }) => (
              <div key={prog.id} className="tour-program-card">
                <div className="tour-program-card__icon">{prog.icon}</div>
                <div className="tour-program-card__body">
                  <div className="tour-program-card__name">{prog.name}</div>
                  <div className="tour-program-card__code">{prog.code}</div>
                </div>
                <div className="tour-program-card__stats">
                  <div className="tour-program-card__stat">
                    <span className="tour-program-card__stat-val">{totalParticipants}</span>
                    <span className="tour-program-card__stat-label">участников</span>
                  </div>
                  <div className="tour-program-card__stat">
                    <span className="tour-program-card__stat-val">{tours.length}</span>
                    <span className="tour-program-card__stat-label">туров</span>
                  </div>
                  <div className="tour-program-card__stat">
                    <span className="tour-program-card__stat-val" style={{ color: 'var(--green)' }}>{activeTours.length}</span>
                    <span className="tour-program-card__stat-label">активных</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs tabs={tabDefs} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="🗂️" title="Туров не найдено" subtitle="Туры создаются автоматически при подаче заявок клиентами" />
      ) : (
        <div className="tours-list">
          {filtered.map((tour, i) => {
            const prog    = store.getProgramById(tour.programId);
            const mgr     = store.getUserById(tour.assignedManagerId);
            const apps    = store.getAppsInTour(tour.id);
            const signed  = apps.filter(a => ['signed','active','in_progress','completed','samples_sent','samples_received','protocol_uploaded','processing','finished'].includes(a.status)).length;
            const finished= apps.filter(a => a.status === 'finished').length;

            return (
              <div key={tour.id} className="tour-card" onClick={() => navigate(`/tours/${tour.id}`)} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="tour-card__top">
                  <div className="tour-card__left">
                    <div className="tour-card__icon">{prog?.icon}</div>
                    <div>
                      <div className="tour-card__number">{tour.tourNumber}</div>
                      <div className="tour-card__name">{prog?.name}</div>
                      <div className="tour-card__meta">
                        {mgr && <span className="tour-card__meta-item">👤 {mgr.name}</span>}
                        <span className="tour-card__meta-item">
                          {new Date(tour.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tour-card__right">
                    <TourBadge status={tour.status} />
                  </div>
                </div>

                {/* Participant progress bar */}
                <div className="tour-card__progress">
                  <div className="tour-card__progress-row">
                    <span className="tour-card__progress-label">Участников: {apps.length}</span>
                    <span className="tour-card__progress-label">Договоров: {signed}/{apps.length}</span>
                    <span className="tour-card__progress-label">Завершено: {finished}/{apps.length}</span>
                  </div>
                  <div className="tour-card__bar">
                    <div className="tour-card__bar-fill tour-card__bar-fill--green"  style={{ width: `${apps.length ? (finished / apps.length) * 100 : 0}%` }} />
                    <div className="tour-card__bar-fill tour-card__bar-fill--blue"   style={{ width: `${apps.length ? ((signed - finished) / apps.length) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Participants list preview */}
                <div className="tour-card__participants">
                  {apps.slice(0, 4).map(app => {
                    const client = store.getUserById(app.clientId);
                    return (
                      <div key={app.id} className="tour-card__participant">
                        <span className="tour-card__participant-org">{client?.orgName || client?.name}</span>
                        <StatusBadge status={app.status} />
                      </div>
                    );
                  })}
                  {apps.length > 4 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '4px 0' }}>
                      +{apps.length - 4} ещё...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
