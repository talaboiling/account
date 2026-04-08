// src/pages/ProgramsPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import '../styles/pages.css';

export default function ProgramsPage() {
  const store    = useStore();
  const navigate = useNavigate();
  return (
    <div className="fade-in">
      <PageHeader title="Программы проверки квалификации" subtitle="Выберите программу для подачи заявки на участие (Форма Ф-02-ВП-31)" />
      <div className="programs-grid">
        {store.programs.map((p, i) => (
          <div key={p.id} className="program-card" onClick={() => navigate(`/programs/${p.id}/apply`)} style={{ animationDelay:`${i*0.04}s` }}>
            <div className="program-card__top">
              <div className="program-card__icon">{p.icon}</div>
              <span className="program-card__code">{p.code}</span>
            </div>
            <h3 className="program-card__name">{p.name}</h3>
            <div className="program-card__cta">Подать заявку →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
