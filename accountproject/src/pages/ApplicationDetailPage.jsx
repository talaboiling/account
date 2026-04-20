// src/pages/ApplicationDetailPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Badge, StatusBadge, Modal, Textarea,
  InfoRow, Alert, SectionBox, FileUpload, StepTracker, Timeline
} from '../components/ui';
import { APPLICATION_STATUSES, TOUR_STATUSES } from '../data/store';
import '../styles/pages.css';

// Steps 1–9 are managed at tour level; 10–12 are individual
const GROUP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function ApplicationDetailPage() {
  const store = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = store.currentUser;
  const app = store.getAppById(id);

  const [modal, setModal] = useState(null);
  const [note, setNote] = useState('');
  const [draftFile, setDraftFile] = useState('');
  const [finalDocs, setFinalDocs] = useState({ conclusionUrl: '', reportUrl: '', certificateUrl: '' });

  if (!app) return <div style={{ padding: '40px', color: 'var(--red)' }}>Заявка не найдена</div>;

  const prog = store.getProgramById(app.programId);
  const client = store.getUserById(app.clientId);
  const mgr = store.getUserById(app.assignedManagerId);
  const tour = app.tourId ? store.getTourById(app.tourId) : null;

  const isAdmin = user.role === 'admin';
  const isClient = user.role === 'client' && app.clientId === user.id;

  const step = APPLICATION_STATUSES[app.status]?.step || 0;
  const isGroupStep = GROUP_STEPS.includes(step);

  const closeModal = () => { setModal(null); setNote(''); setDraftFile(''); setFinalDocs({ conclusionUrl: '', reportUrl: '', certificateUrl: '' }); };

  const doAccept = () => { store.acceptApplication(app.id, user.id, note); closeModal(); };
  const doReject = () => { if (!note.trim()) return; store.rejectApplication(app.id, user.id, note); closeModal(); };
  const doAttachDraft = () => { if (!draftFile) return; store.attachDraftContract(app.id, user.id, draftFile); closeModal(); };
  const doUploadSigned = fn => store.uploadSignedContract(app.id, user.id, fn);
  const doConfirmSamples = () => store.confirmSamplesReceived(app.id, user.id);
  const doUploadProtocol = fn => store.uploadProtocol(app.id, user.id, fn);
  const doProcessing = () => { store.setProcessingStatus(app.id, user.id, note); closeModal(); };
  const doFinalDocs = () => {
    if (!finalDocs.conclusionUrl || !finalDocs.reportUrl || !finalDocs.certificateUrl) return;
    store.uploadFinalDocuments(app.id, user.id, finalDocs);
    closeModal();
  };

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/applications')}>← Назад к заявкам</button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header__left">
          <div className="detail-header__icon">{prog?.icon}</div>
          <div>
            <div className="detail-header__number">
              {app.appNumber}
              {tour && (
                <span
                  onClick={e => { e.stopPropagation(); navigate(`/tours/${tour.id}`); }}
                  style={{ marginLeft: '8px', cursor: 'pointer', color: 'var(--cyan)', fontWeight: 700 }}
                >
                  · {tour.tourNumber} ↗
                </span>
              )}
            </div>
            <h2 className="detail-header__title">{prog?.name}</h2>
            <div className="detail-header__date">
              Подана {new Date(app.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="detail-header__badges">
          <StatusBadge status={app.status} />
          {isGroupStep && tour && <Badge color="cyan">Групповой этап</Badge>}
          {!isGroupStep && step > 9 && <Badge color="purple">Индивидуальный этап</Badge>}
        </div>
      </div>

      {/* Step tracker */}
      <StepTracker currentStep={step} />

      {/* Tour context note */}
      {tour && isGroupStep && (
        <div style={{ background: 'var(--cyan-dim)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🗂️</span>
          <span>Этапы 1–9 управляются на уровне тура <strong
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate(`/tours/${tour.id}`)}>
            {tour.tourNumber}
          </strong>. После получения образцов протокол подаётся индивидуально.</span>
        </div>
      )}

      {/* ── ACTION BANNERS ── */}

      {/* ADMIN: step 2 — accept */}
      {isAdmin && app.status === 'submitted' && (
        <Alert color="yellow" text="⏳ Заявка ожидает принятия">
          <Button variant="success" onClick={() => setModal('accept')}>✓ Принять</Button>
          <Button variant="danger" onClick={() => setModal('reject')}>✗ Отклонить</Button>
        </Alert>
      )}

      {/* ADMIN: step 3 — draft contract */}
      {isAdmin && app.status === 'accepted' && (
        <Alert color="cyan" text="📄 Прикрепите драфт договора для этого участника">
          <Button onClick={() => setModal('draft')}>📎 Прикрепить драфт</Button>
          <Button variant="danger" onClick={() => setModal('reject')}>✗ Отклонить</Button>
        </Alert>
      )}

      {/* CLIENT: step 4 — sign contract */}
      {isClient && app.status === 'draft_sent' && app.draftContractUrl && (
        <Alert color="cyan" text="📄 Ознакомьтесь с драфтом договора и загрузите подписанный экземпляр">
          <FileUpload onUpload={doUploadSigned} current={app.signedContractUrl} />
        </Alert>
      )}

      {/* ADMIN: tour not started yet but app is signed */}
      {isAdmin && app.status === 'signed' && tour && tour.status === 'forming' && (
        <Alert color="green" text={`✅ Договор подписан. Тур ${tour.tourNumber} ещё в стадии набора — запустите тур на странице тура.`}>
          <Button onClick={() => navigate(`/tours/${tour.id}`)}>🗂️ Перейти к туру</Button>
        </Alert>
      )}

      {/* CLIENT: step 9 — confirm samples */}
      {isClient && app.status === 'samples_sent' && (
        <Alert color="blue" text="📦 Образцы отправлены — подтвердите получение">
          <Button variant="success" onClick={doConfirmSamples}>✓ Подтвердить получение</Button>
        </Alert>
      )}

      {/* CLIENT: step 10 — upload protocol (INDIVIDUAL from here) */}
      {isClient && app.status === 'samples_received' && (
        <Alert color="purple" text="🔬 Образцы получены — прикрепите протокол испытаний (индивидуально)">
          <FileUpload onUpload={doUploadProtocol} current={app.protocolUrl} />
        </Alert>
      )}

      {/* ADMIN: step 11 — accept protocol for processing */}
      {isAdmin && app.status === 'protocol_uploaded' && (
        <Alert color="purple" text="📋 Клиент прикрепил протокол — примите в обработку">
          <Button onClick={() => setModal('processing')}>⚙️ Принять в обработку</Button>
        </Alert>
      )}

      {/* ADMIN: step 12 — upload final docs */}
      {isAdmin && app.status === 'processing' && (
        <Alert color="green" text="📦 Загрузите итоговые документы: заключение, отчёт, свидетельство">
          <Button variant="success" onClick={() => setModal('final')}>📎 Загрузить документы</Button>
        </Alert>
      )}

      {/* ── SECTIONS ── */}

      {/* Application form */}
      <SectionBox title="Данные заявки (Ф-02-ВП-31)" icon="📋">
        <InfoRow label="Объект испытаний" value={app.formData.objectName} />
        <InfoRow label="Определяемые показатели" value={app.formData.indicators} />
        <InfoRow label="Диапазон измерений" value={app.formData.measureRange} />
        <InfoRow label="Нормативный документ" value={app.formData.normDoc} />
        <InfoRow label="Структурное подразделение" value={app.formData.deptName} />
        <InfoRow label="Аттестат аккредитации" value={app.formData.accreditCert || '—'} />
        <InfoRow label="Руководитель подразделения" value={app.formData.headName} />
        <InfoRow label="Контакты руководителя" value={app.formData.headContact} />
        <InfoRow label="Организация / реквизиты" value={app.formData.orgDetails} />
        <InfoRow label="Руководитель организации" value={app.formData.directorName} />
      </SectionBox>

      {/* Client info (admin only) */}
      {isAdmin && (
        <SectionBox title="Клиент" icon="🏢">
          <InfoRow label="ФИО" value={client?.name} />
          <InfoRow label="Организация" value={client?.orgName} />
          <InfoRow label="Email" value={client?.email} />
          <InfoRow label="Телефон" value={client?.phone} />
        </SectionBox>
      )}

      {/* Tour info */}
      {tour && (
        <SectionBox title="Тур" icon="🗂️">
          <InfoRow label="Номер тура" value={tour.tourNumber} />
          <InfoRow label="Статус тура" value={TOUR_STATUSES[tour.status]?.label || tour.status} />
          {mgr && <InfoRow label="Заведующий" value={`${mgr.name} — ${mgr.position}`} />}
          {tour.taskNote && <InfoRow label="Задание" value={tour.taskNote} />}
          <InfoRow label="Участников в туре" value={`${store.getAppsInTour(tour.id).length} организаций`} />
          {isAdmin && (
            <div style={{ marginTop: '10px' }}>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/tours/${tour.id}`)}>
                🗂️ Открыть страницу тура →
              </Button>
            </div>
          )}
        </SectionBox>
      )}

      {/* Contract docs */}
      {(app.draftContractUrl || app.signedContractUrl) && (
        <SectionBox title="Договор" icon="📝">
          {app.draftContractUrl && (
            <div className="file-row" style={{ marginBottom: '8px' }}>
              <span className="file-row__icon">📄</span>
              <span className="file-row__name">Драфт: {app.draftContractUrl}</span>
              <Badge color="cyan" className="file-row__badge">Драфт</Badge>
            </div>
          )}
          {app.signedContractUrl && (
            <div className="file-row">
              <span className="file-row__icon">✅</span>
              <span className="file-row__name">Подписан: {app.signedContractUrl}</span>
              <Badge color="green" className="file-row__badge">Подписан</Badge>
            </div>
          )}
        </SectionBox>
      )}

      {/* Protocol */}
      {app.protocolUrl && (
        <SectionBox title="Протокол испытаний" icon="🔬">
          <div className="file-row">
            <span className="file-row__icon">📋</span>
            <span className="file-row__name">{app.protocolUrl}</span>
            <Badge color="purple" className="file-row__badge">От клиента</Badge>
          </div>
        </SectionBox>
      )}

      {/* Final documents */}
      {(app.conclusionUrl || app.reportUrl || app.certificateUrl) && (
        <SectionBox title="Итоговые документы" icon="📦">
          {app.conclusionUrl && <div className="file-row" style={{ marginBottom: '6px' }}><span className="file-row__icon">📄</span><span className="file-row__name">Заключение: {app.conclusionUrl}</span><Badge color="green" className="file-row__badge">✓</Badge></div>}
          {app.reportUrl && <div className="file-row" style={{ marginBottom: '6px' }}><span className="file-row__icon">📊</span><span className="file-row__name">Отчёт: {app.reportUrl}</span><Badge color="green" className="file-row__badge">✓</Badge></div>}
          {app.certificateUrl && <div className="file-row"><span className="file-row__icon">🏅</span><span className="file-row__name">Свидетельство: {app.certificateUrl}</span><Badge color="green" className="file-row__badge">✓</Badge></div>}
        </SectionBox>
      )}

      {/* Timeline */}
      <SectionBox title="История статусов" icon="🕐">
        <Timeline items={[...app.timeline].reverse()} store={store} />
      </SectionBox>

      {/* MODALS */}
      <Modal open={modal === 'accept'} onClose={closeModal} title="Принять заявку">
        <Textarea label="Комментарий (необязательно)" value={note} onChange={e => setNote(e.target.value)} placeholder="Напр.: Заявка соответствует требованиям программы." />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="success" onClick={doAccept}>✓ Принять</Button>
        </div>
      </Modal>

      <Modal open={modal === 'reject'} onClose={closeModal} title="Отклонить заявку">
        <Textarea label="Причина отклонения *" value={note} onChange={e => setNote(e.target.value)} placeholder="Укажите причину..." />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="danger" onClick={doReject} disabled={!note.trim()}>✗ Отклонить</Button>
        </div>
      </Modal>

      <Modal open={modal === 'draft'} onClose={closeModal} title="Прикрепить драфт договора">
        <FileUpload label="Файл драфта *" onUpload={name => setDraftFile(name)} current={draftFile} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doAttachDraft} disabled={!draftFile}>📎 Прикрепить</Button>
        </div>
      </Modal>

      <Modal open={modal === 'processing'} onClose={closeModal} title="Принять протокол в обработку">
        <Textarea label="Комментарий клиенту (необязательно)" value={note} onChange={e => setNote(e.target.value)} placeholder="Напр.: Протокол получен. Срок обработки — 5 рабочих дней." />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doProcessing}>⚙️ Принять в обработку</Button>
        </div>
      </Modal>

      <Modal open={modal === 'final'} onClose={closeModal} title="Загрузить итоговые документы" width={580}>
        <FileUpload label="Заключение *" onUpload={n => setFinalDocs(d => ({ ...d, conclusionUrl: n }))} current={finalDocs.conclusionUrl} />
        <FileUpload label="Отчёт *" onUpload={n => setFinalDocs(d => ({ ...d, reportUrl: n }))} current={finalDocs.reportUrl} />
        <FileUpload label="Свидетельство *" onUpload={n => setFinalDocs(d => ({ ...d, certificateUrl: n }))} current={finalDocs.certificateUrl} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="success" onClick={doFinalDocs}
            disabled={!finalDocs.conclusionUrl || !finalDocs.reportUrl || !finalDocs.certificateUrl}>
            📦 Отправить клиенту
          </Button>
        </div>
      </Modal>
    </div>
  );
}
