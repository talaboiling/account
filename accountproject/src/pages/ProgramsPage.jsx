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
    <div className="programs-page">
      <PageHeader
        title="Программы обследований"
        subtitle="Выберите программу для подачи заявки. Форма заявки зависит от выбранной программы."
      />
      <div className="programs-grid">
        {store.programs.map((prog, i) => (
          <div
            key={prog.id}
            className="program-card"
            onClick={() => navigate(`/programs/${prog.id}/apply`)}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="program-card__top">
              <div className="program-card__icon">{prog.icon}</div>
              <span className="program-card__code">{prog.code}</span>
            </div>
            <h3 className="program-card__name">{prog.name}</h3>
            <div className="program-card__cta">Подать заявку →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
