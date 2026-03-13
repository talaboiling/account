// src/pages/ApplicationFormPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Select, Textarea, Button, PageHeader } from '../components/ui';

export default function ApplicationFormPage() {
  const store = useStore();
  const navigate = useNavigate();
  const { programId } = useParams();
  const user = store.currentUser;

  const program = store.getProgramById(programId);
  const fields = store.programForms[programId] || [];

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!program) return <div style={{ color:'var(--red)', padding:'40px' }}>Программа не найдена</div>;

  const set = (id) => (e) => setFormData(f => ({ ...f, [id]: e.target.value }));

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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', gap:'16px', animation:'fadeIn 0.3s ease' }}>
      <div style={{ fontSize:'4rem' }}>✅</div>
      <h2 style={{ fontFamily:'var(--font-main)', fontSize:'1.4rem' }}>Заявка успешно подана!</h2>
      <p style={{ color:'var(--text-sub)', textAlign:'center' }}>Администраторы уведомлены. Перенаправляем в ваш кабинет...</p>
    </div>
  );

  return (
    <div style={{ animation:'fadeIn 0.3s ease', maxWidth:'720px' }}>
      <button onClick={() => navigate('/programs')} style={{ background:'none', border:'none', color:'var(--text-sub)', cursor:'pointer', fontSize:'0.875rem', marginBottom:'16px', padding:'0', display:'flex', alignItems:'center', gap:'6px' }}>← Назад к программам</button>

      <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'28px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px' }}>
        <div style={{ width:'52px', height:'52px', background:'var(--accent-dim)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{program.icon}</div>
        <div>
          <div style={{ fontSize:'0.75rem', color:'var(--accent)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'3px' }}>{program.code}</div>
          <h2 style={{ fontFamily:'var(--font-main)', fontWeight:800, fontSize:'1.1rem', lineHeight:1.3 }}>{program.name}</h2>
        </div>
      </div>

      <PageHeader title="Форма заявки" subtitle="Заполните все обязательные поля и нажмите «Подать заявку»" />

      <form onSubmit={handleSubmit}>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
          {fields.map(field => {
            const props = { key: field.id, id: field.id, label: `${field.label}${field.required ? ' *' : ''}`, value: formData[field.id] || '', onChange: set(field.id), error: errors[field.id] };
            if (field.type === 'select') return <Select {...props} options={field.options} />;
            if (field.type === 'textarea') return <Textarea {...props} />;
            return <Input {...props} type={field.type || 'text'} />;
          })}
        </div>

        <div style={{ display:'flex', gap:'10px', marginTop:'20px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={() => navigate('/programs')}>Отмена</Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? '⏳ Отправляем...' : '📨 Подать заявку'}
          </Button>
        </div>
      </form>
    </div>
  );
}
