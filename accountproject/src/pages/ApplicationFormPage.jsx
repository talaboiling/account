// src/pages/ApplicationFormPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Textarea, Button, PageHeader } from '../components/ui';
import '../styles/pages.css';

const EMPTY = {
  objectName:   '',
  indicators:   '',
  measureRange: '',
  normDoc:      '',
  deptName:     '',
  accreditCert: '',
  headName:     '',
  headContact:  '',
  orgDetails:   '',
  directorName: '',
};

export default function ApplicationFormPage() {
  const store     = useStore();
  const navigate  = useNavigate();
  const { programId } = useParams();
  const user      = store.currentUser;
  const program   = store.getProgramById(programId);

  const [fd,         setFd]         = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(null);

  if (!program) return <div style={{ padding:'40px', color:'var(--red)' }}>Программа не найдена</div>;

  const set = k => e => setFd(f => ({ ...f, [k]: e.target.value }));

  const required = ['objectName','indicators','measureRange','normDoc','deptName','headName','headContact','orgDetails','directorName'];

  const validate = () => {
    const e = {};
    required.forEach(k => { if (!fd[k].trim()) e[k] = 'Обязательное поле'; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const app = store.submitApplication(user.id, programId, { ...fd });
    setSuccess(app.appNumber);
    setSubmitting(false);
    setTimeout(() => navigate('/applications'), 2500);
  };

  if (success) return (
    <div className="form-success">
      <div className="form-success__icon">✅</div>
      <h2 className="form-success__title">Заявка подана!</h2>
      <p className="form-success__sub">Номер заявки: <strong>{success}</strong><br />Администраторы уведомлены. Ожидайте обратной связи.</p>
    </div>
  );

  return (
    <div className="app-form-page">
      <button className="back-btn" onClick={() => navigate('/programs')}>← К программам</button>

      <div className="prog-header">
        <div className="prog-header__icon">{program.icon}</div>
        <div>
          <div className="prog-header__code">{program.code}</div>
          <h2 className="prog-header__name">{program.name}</h2>
        </div>
      </div>

      <PageHeader title="Заявка на участие" subtitle="Форма Ф-02-ВП-31 — Заполните все поля и подайте заявку" />

      <div className="form-note">
        Заявитель обязуется: выполнить все требования программы ПК; оплачивать расходы по проведению программы; при отказе после формирования группы — возместить расходы.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          <Input
            label="Наименование объекта испытаний *"
            id="objectName" value={fd.objectName} onChange={set('objectName')}
            placeholder="Напр.: Питьевая вода / Молочная продукция / Почва..."
            error={errors.objectName}
          />

          <Textarea
            label="Измеряемые величины (определяемые показатели) *"
            id="indicators" value={fd.indicators} onChange={set('indicators')} rows={3}
            placeholder="Напр.: pH, мутность, цветность, нитраты, нитриты, железо общее"
            error={errors.indicators}
          />

          <Textarea
            label="Рабочий диапазон измерений, единицы измерения *"
            id="measureRange" value={fd.measureRange} onChange={set('measureRange')} rows={3}
            placeholder="Напр.: pH: 6–9; мутность: 0.5–4 ЕМФ; нитраты: 1–50 мг/л"
            error={errors.measureRange}
          />

          <Input
            label="Нормативный документ на метод испытаний *"
            id="normDoc" value={fd.normDoc} onChange={set('normDoc')}
            placeholder="Напр.: ГОСТ Р 51232, СанПиН 3.3686-21, ISO 9001"
            error={errors.normDoc}
          />

          <Input
            label="Наименование структурного подразделения, осуществляющего лабораторную деятельность *"
            id="deptName" value={fd.deptName} onChange={set('deptName')}
            placeholder="Напр.: Испытательная лаборатория / Отдел контроля качества"
            error={errors.deptName}
          />

          <Input
            label="Аттестат аккредитации (при наличии)"
            id="accreditCert" value={fd.accreditCert} onChange={set('accreditCert')}
            placeholder="Напр.: KZ.I.02.XXXX или RA.RU.21АЛ43"
          />

          <Textarea
            label="ФИО, должность руководителя структурного подразделения *"
            id="headName" value={fd.headName} onChange={set('headName')} rows={2}
            placeholder="Напр.: Иванов Иван Иванович, руководитель лаборатории"
            error={errors.headName}
          />

          <Textarea
            label="Адрес, телефон, e-mail руководителя подразделения *"
            id="headContact" value={fd.headContact} onChange={set('headContact')} rows={2}
            placeholder="г. Алматы, ул. Примерная 1; +7 (700) 123-45-67; email@org.kz"
            error={errors.headContact}
          />

          <Textarea
            label="Наименование организации, БИН, адрес, телефон, банковские реквизиты (ИИК, банк, БИК) *"
            id="orgDetails" value={fd.orgDetails} onChange={set('orgDetails')} rows={4}
            placeholder={"ТОО «Название», БИН 123456789012\nг. Алматы, ул. Примерная 1; +7 (727) 123-45-67\nИИК KZ11XXXX...; Банк: АО «...»; БИК KZKOKZKX"}
            error={errors.orgDetails}
          />

          <Input
            label="ФИО руководителя организации, должность *"
            id="directorName" value={fd.directorName} onChange={set('directorName')}
            placeholder="Напр.: Петров Пётр Петрович, директор"
            error={errors.directorName}
          />

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
