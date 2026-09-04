// src/pages/TourDetailPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Badge, StatusBadge, Modal, Select, Textarea,
  InfoRow, Alert, SectionBox
} from '../components/ui';
import { TOUR_STATUSES } from '../data/store';
import '../styles/pages.css';

function TourBadge({ status }) {
  const cfg = TOUR_STATUSES[status] || { label: status, color: 'default' };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export default function TourDetailPage() {
  const store    = useStore();
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = store.currentUser;
  const tour     = store.getTourById(id);

  const [modal,      setModal]      = useState(null);
  const [managerId,  setManagerId]  = useState('');
  const [taskNote,   setTaskNote]   = useState('');
  const [workStatus, setWorkStatus] = useState('in_progress');
  const [note,       setNote]       = useState('');

  if (!tour) return <div style={{ padding: '40px', color: 'var(--red)' }}>Тур не найден</div>;

  const prog     = store.getProgramById(tour.programId);
  const mgr      = store.getUserById(tour.assignedManagerId);
  const managers = store.getManagers();
  const apps     = store.getAppsInTour(tour.id);

  const isAdmin   = user.role === 'admin';
  const isManager = user.role === 'manager' && tour.assignedManagerId === user.id;

  const closeModal = () => { setModal(null); setNote(''); setManagerId(''); setTaskNote(''); };

  const doStart = () => {
    if (!managerId || !taskNote.trim()) return;
    store.startTour(tour.id, user.id, managerId, taskNote);
    closeModal();
  };

  const doWorkStatus = () => {
    store.updateTourWorkStatus(tour.id, user.id, workStatus, note);
    closeModal();
  };

  const doSamplesSent = () => {
    store.notifyTourSamplesSent(tour.id, user.id, note);
    closeModal();
  };

  const anySigned = apps.some(a => a.status === 'signed');

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/tours')}>← Назад к турам</button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header__left">
          <div className="detail-header__icon">{prog?.icon}</div>
          <div>
            <div className="detail-header__number">{tour.tourNumber}</div>
            <h2 className="detail-header__title">{prog?.name}</h2>
            <div className="detail-header__date">
              Создан {new Date(tour.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
              {apps.length} участников
            </div>
          </div>
        </div>
        <div className="detail-header__badges">
          <TourBadge status={tour.status} />
          {mgr && <Badge color="purple">👤 {mgr.name.split(' ')[0]} {mgr.name.split(' ')[1]?.[0]}.</Badge>}
        </div>
      </div>

      {/* Action banners */}
      {isAdmin && tour.status === 'forming' && (
        <Alert color="yellow" text={`⏳ Тур в стадии набора участников (${apps.length} заявок). Запустите тур после подписания договоров.`}>
          <Button variant="success" onClick={() => setModal('start')} disabled={!anySigned}>
            ⚡ Запустить тур
          </Button>
        </Alert>
      )}
      {isAdmin && tour.status === 'completed' && (
        <Alert color="cyan" text="✅ Работа завершена — уведомите всех участников об отправке образцов">
          <Button onClick={() => setModal('samples')}>📦 Уведомить об образцах</Button>
        </Alert>
      )}
      {isManager && tour.status === 'active' && (
        <Alert color="blue" text="📋 Тур активен — обновите статус работы">
          <Button onClick={() => { setWorkStatus('in_progress'); setModal('work'); }}>⚙️ Взять в работу</Button>
        </Alert>
      )}
      {isManager && tour.status === 'in_progress' && (
        <Alert color="green" text="⚙️ Тур в работе — отметьте завершение когда готово">
          <Button variant="success" onClick={() => { setWorkStatus('completed'); setModal('work'); }}>✅ Завершить работу</Button>
        </Alert>
      )}

      {/* Tour info */}
      <SectionBox title="Информация о туре" icon="🗂️">
        <InfoRow label="Номер тура"    value={tour.tourNumber} />
        <InfoRow label="Программа"     value={`${prog?.code} — ${prog?.name}`} />
        <InfoRow label="Статус"        value={TOUR_STATUSES[tour.status]?.label || tour.status} />
        <InfoRow label="Заведующий"    value={mgr ? `${mgr.name} — ${mgr.position}` : '—'} />
        <InfoRow label="Задание"       value={tour.taskNote || '—'} />
        <InfoRow label="Участников"    value={`${apps.length} организаций`} />
      </SectionBox>

      {/* Participants table */}
      <SectionBox title={`Участники тура (${apps.length})`} icon="🏢">
        {apps.length === 0 ? (
          <div style={{ color: 'var(--text-sub)', padding: '12px 0' }}>Участников пока нет</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {apps.map((app, i) => {
              const client = store.getUserById(app.clientId);
              return (
                <div key={app.id} className="tour-participant-row" onClick={() => navigate(`/applications/${app.id}`)}>
                  <div className="tour-participant-row__num">#{i + 1}</div>
                  <div className="tour-participant-row__info">
                    <div className="tour-participant-row__org">{client?.orgName || client?.name}</div>
                    <div className="tour-participant-row__app">{app.appNumber} · {app.formData?.objectName}</div>
                  </div>
                  <div className="tour-participant-row__status">
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="tour-participant-row__docs">
                    {app.draftContractUrl  && <Badge color="cyan"   className="badge--xs">Драфт ✓</Badge>}
                    {app.signedContractUrl && <Badge color="green"  className="badge--xs">Договор ✓</Badge>}
                    {app.protocolUrl       && <Badge color="purple" className="badge--xs">Протокол ✓</Badge>}
                    {app.conclusionUrl     && <Badge color="green"  className="badge--xs">Заключение ✓</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionBox>

      {/* Tour timeline */}
      <SectionBox title="История тура" icon="🕐">
        <div className="timeline">
          {[...tour.timeline].reverse().map((item, i) => {
            const cfg     = TOUR_STATUSES[item.status] || { label: item.status, color: 'default' };
            const byUser  = store.getUserById(item.by);
            const colors  = { blue: 'var(--accent)', green: 'var(--green)', yellow: 'var(--yellow)', cyan: 'var(--cyan)', purple: 'var(--purple)', default: 'var(--text-dim)' };
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
                    {byUser?.name || item.by} · {new Date(item.date).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {item.note && <div className="timeline-item__note">{item.note}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </SectionBox>

      {/* Modals */}
      <Modal open={modal === 'start'} onClose={closeModal} title="Запустить тур" width={580}>
        <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '4px' }}>
          ⚠️ После запуска все участники с подписанным договором перейдут в статус «В действии» и получат групповое уведомление.
        </div>
        <Select
          label="Заведующий *"
          value={managerId}
          onChange={e => setManagerId(e.target.value)}
          options={managers.map(m => ({ value: m.id, label: `${m.name} — ${m.position}` }))}
        />
        <Textarea
          label="Задание по туру *"
          value={taskNote}
          onChange={e => setTaskNote(e.target.value)}
          rows={4}
          placeholder="Опишите задание: программу, сроки, особые требования для всей группы..."
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="success" onClick={doStart} disabled={!managerId || !taskNote.trim()}>
            ⚡ Запустить тур ({apps.filter(a => a.status === 'signed').length} участников)
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'work'} onClose={closeModal} title="Обновить статус работы тура">
        <Select
          label="Статус"
          value={workStatus}
          onChange={e => setWorkStatus(e.target.value)}
          options={[
            { value: 'in_progress', label: 'В работе'        },
            { value: 'completed',   label: 'Работа завершена'},
          ]}
        />
        <Textarea label="Комментарий (необязательно)" value={note} onChange={e => setNote(e.target.value)} placeholder="Доп. сведения..." />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doWorkStatus}>💾 Сохранить</Button>
        </div>
      </Modal>

      <Modal open={modal === 'samples'} onClose={closeModal} title="Уведомление об отправке образцов">
        <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '4px' }}>
          Уведомление будет отправлено всем {apps.length} участникам тура одновременно.
        </div>
        <Textarea label="Сообщение участникам (необязательно)" value={note} onChange={e => setNote(e.target.value)} placeholder="Напр.: Образцы отправлены курьером. Ожидайте в течение 3 рабочих дней." />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doSamplesSent}>📦 Уведомить всех участников</Button>
        </div>
      </Modal>
    </div>
  );
}
