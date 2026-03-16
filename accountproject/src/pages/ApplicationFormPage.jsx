// src/pages/ApplicationFormPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Select, Textarea, Button, PageHeader } from '../components/ui';
import '../styles/pages.css';

export default function ApplicationFormPage() {
  const store     = useStore();
  const navigate  = useNavigate();
  const { programId } = useParams();
  const user      = store.currentUser;
  const program   = store.getProgramById(programId);
  const fields    = store.programForms[programId] || [];

  const [formData,   setFormData]   = useState({});
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);

  if (!program) return <div style={{ color: 'var(--red)', padding: '40px' }}>Программа не найдена</div>;

  const set = id => e => setFormData(f => ({ ...f, [id]: e.target.value }));

  const validate = () => {
    const e = {};
    fields.filter(f => f.required).forEach(f => {
      if (!formData[f.id]?.toString().trim()) e[f.id] = 'Обязательное поле';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    store.submitApplication(user.id, programId, formData);
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => navigate('/applications'), 2000);
  };

  if (success) return (
    <div className="form-success">
      <div className="form-success__icon">✅</div>
      <h2 className="form-success__title">Заявка успешно подана!</h2>
      <p className="form-success__sub">Администраторы уведомлены. Перенаправляем в ваш кабинет...</p>
    </div>
  );

  return (
    <div className="app-form-page">
      <button className="back-btn" onClick={() => navigate('/programs')}>← Назад к программам</button>

      <div className="program-header">
        <div className="program-header__icon">{program.icon}</div>
        <div>
          <div className="program-header__code">{program.code}</div>
          <h2 className="program-header__name">{program.name}</h2>
        </div>
      </div>

      <PageHeader title="Форма заявки" subtitle="Заполните все обязательные поля и нажмите «Подать заявку»" />

      <form onSubmit={handleSubmit}>
        <div className="form-fields">
          {fields.map(field => {
            const props = {
              key: field.id, id: field.id,
              label: `${field.label}${field.required ? ' *' : ''}`,
              value: formData[field.id] || '',
              onChange: set(field.id),
              error: errors[field.id],
            };
            if (field.type === 'select')   return <Select   {...props} options={field.options} />;
            if (field.type === 'textarea') return <Textarea {...props} />;
            return <Input {...props} type={field.type || 'text'} />;
          })}
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate('/programs')}>Отмена</Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? '⏳ Отправляем...' : '📨 Подать заявку'}
          </Button>
        </div>
      </form>
    </div>
  );
}
