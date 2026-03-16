// src/components/ui.jsx
import React from 'react';
import '../styles/ui.css';

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${size} btn--${variant} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = 'default', className = '' }) {
  return (
    <span className={`badge badge--${color} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending:  { label: 'На рассмотрении', color: 'yellow' },
    signed:   { label: 'Подписана',        color: 'green'  },
    rejected: { label: 'Отклонена',        color: 'red'    },
  };
  const { label, color } = map[status] || { label: status, color: 'default' };
  return <Badge color={color}>{label}</Badge>;
}

export function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <input
        id={id}
        {...props}
        className={`field__input${error ? ' field__input--error' : ''}`}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Select({ label, id, options = [], error, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <select
        id={id}
        {...props}
        className={`field__select${error ? ' field__select--error' : ''}`}
      >
        <option value="">— Выберите —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, id, error, className = '', ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id} className="field__label">{label}</label>}
      <textarea
        id={id}
        {...props}
        className={`field__textarea${error ? ' field__textarea--error' : ''}`}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Divider() {
  return <div className="divider" />;
}

export function Spinner() {
  return <div className="spinner" />;
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

export function Modal({ open, onClose, title, children, width = 560 }) {
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
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`tab-btn${active === tab.id ? ' tab-btn--active' : ''}`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <Badge color={active === tab.id ? 'blue' : 'default'}>{tab.count}</Badge>
          )}
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
      <span className="info-row__value">{value || '—'}</span>
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
