// src/components/ui.jsx
import React, { useEffect, useRef, useState } from 'react';
import '../styles/ui.css';
import { getApplicationStatusLabel } from '../data/store';

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '' }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`btn btn--${size} btn--${variant} ${className}`}>{children}</button>;
}

export function Badge({ children, color = 'default', className = '' }) {
  return <span className={`badge badge--${color} ${className}`}>{children}</span>;
}

export function StatusBadge({ status, role }) {
  const cfg = getApplicationStatusLabel(status, role);
  const prevStatus = useRef(status);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevStatus.current === status) return;
    prevStatus.current = status;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [status]);

  return <Badge color={cfg.color} className={flash ? 'badge--flash' : ''}>{cfg.label}</Badge>;
}

export function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <input id={id} {...props} className={`field__input${error ? ' field__input--error' : ''}`} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Select({ label, id, options = [], error, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <select id={id} {...props} className={`field__select${error ? ' field__select--error' : ''}`}>
        <option value="">— Выберите —</option>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, id, error, className = '', rows = 4, ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <textarea id={id} rows={rows} {...props} className={`field__textarea${error ? ' field__textarea--error' : ''}`} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 540 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} className={`tab-btn${active === t.id ? ' tab-btn--active' : ''}`}>
          {t.icon && <span>{t.icon}</span>}
          {t.label}
          {t.count !== undefined && <Badge color={active === t.id ? 'blue' : 'default'} className="badge--xs">{t.count}</Badge>}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span className="info-row__value">{value ?? '—'}</span>
    </div>
  );
}

export function Alert({ color = 'blue', text, children }) {
  return (
    <div className={`alert alert--${color}`}>
      {text && <span className="alert__text">{text}</span>}
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__title">{title}</div>
      {subtitle && <div className="empty-state__sub">{subtitle}</div>}
    </div>
  );
}

export function SectionBox({ title, icon, children }) {
  return (
    <div className="section-box">
      <div className="section-box__head">
        {icon && <span>{icon}</span>}
        <h3 className="section-box__title">{title}</h3>
      </div>
      <div className="section-box__body">{children}</div>
    </div>
  );
}

// Simulated file upload — returns a fake filename
export function FileUpload({ label, onUpload, accept = '.pdf,.doc,.docx', current }) {
  const handleChange = e => {
    const file = e.target.files?.[0];
    if (file) onUpload(file.name);
  };
  return (
    <div className="field">
      {label && <span className="field__label">{label}</span>}
      {current && (
        <div className="file-row" style={{ marginBottom: '8px' }}>
          <span className="file-row__icon">📎</span>
          <span className="file-row__name">{current}</span>
          <Badge color="green" className="file-row__badge">Загружен</Badge>
        </div>
      )}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'var(--bg-card2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-sub)', transition: 'all var(--transition)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-sub)'; }}>
        <span>📁</span> {current ? 'Заменить файл' : 'Выбрать файл'}
        <input type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

const STEPS_FULL = [
  { n: 1, label: 'Подана' },
  { n: 2, label: 'Принята' },
  { n: 3, label: 'Драфт договора' },
  { n: 4, label: 'Договор подписан' },
  { n: 5, label: 'В действии' },
  { n: 6, label: 'В работе' },
  { n: 7, label: 'Работа завершена' },
  { n: 8, label: 'Образцы отправлены' },
  { n: 9, label: 'Образцы приняты' },
  { n: 10, label: 'Протокол прикреплён' },
  { n: 11, label: 'Обработка' },
  { n: 12, label: 'Завершено' },
];

// Clients never see tours — steps 5–7 (the tour-organization phase) collapse
// into one stop, and "finished" reads as a report having been delivered.
const STEPS_CLIENT = [
  { n: 1, label: 'Подана' },
  { n: 2, label: 'Принята' },
  { n: 3, label: 'Драфт договора' },
  { n: 4, label: 'Договор подписан' },
  { n: 5, label: 'Организация тура ППК' },
  { n: 6, label: 'Образцы отправлены' },
  { n: 7, label: 'Образцы приняты' },
  { n: 8, label: 'Протокол прикреплён' },
  { n: 9, label: 'Обработка' },
  { n: 10, label: 'Отчёт получен' },
];

const clientStepFromAppStep = step => (step <= 4 ? step : step <= 7 ? 5 : step - 2);

// Step progress tracker
export function StepTracker({ currentStep, viewerRole }) {
  const isClient = viewerRole === 'client';
  const steps = isClient ? STEPS_CLIENT : STEPS_FULL;
  const effectiveStep = isClient ? clientStepFromAppStep(currentStep) : currentStep;
  return (
    <div className="step-tracker">
      {steps.map((s, i) => {
        const state = s.n < effectiveStep ? 'done' : s.n === effectiveStep ? 'active' : 'future';
        return (
          <div key={s.n} className="step-item">
            <div className="step-item__wrap">
              <div className={`step-item__bubble step-item--${state}`}>
                {state === 'done' ? '✓' : s.n}
              </div>
              <div className="step-item__label">{s.label}</div>
            </div>
            {i < steps.length - 1 && <div className={`step-item__line step-item--${state}`} />}
          </div>
        );
      })}
    </div>
  );
}

// Timeline of status history
export function Timeline({ items, store, role }) {
  return (
    <div className="timeline">
      {items.map((item, i) => {
        const cfg = getApplicationStatusLabel(item.status, role);
        const user = store.getUserById(item.by);
        const colors = { green: 'var(--green)', blue: 'var(--accent)', yellow: 'var(--yellow)', red: 'var(--red)', purple: 'var(--purple)', cyan: 'var(--cyan)', orange: 'var(--orange)', default: 'var(--text-dim)' };
        const c = colors[cfg.color] || colors.default;
        return (
          <div key={i} className="timeline-item">
            <div className="timeline-item__line-wrap">
              <div className="timeline-item__dot" style={{ borderColor: c, background: `${c}22` }} />
              <div className="timeline-item__line" />
            </div>
            <div className="timeline-item__body">
              <div className="timeline-item__status" style={{ color: c }}>{cfg.label}</div>
              <div className="timeline-item__meta">
                {user?.name} · {new Date(item.date).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              {item.note && <div className="timeline-item__note">{item.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
