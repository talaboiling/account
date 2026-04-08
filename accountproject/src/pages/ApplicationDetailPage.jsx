// src/pages/ApplicationDetailPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Badge, StatusBadge, Modal, Input, Select, Textarea,
  InfoRow, Alert, SectionBox, FileUpload, StepTracker, Timeline
} from '../components/ui';
import { APPLICATION_STATUSES } from '../data/store';
import '../styles/pages.css';

export default function ApplicationDetailPage() {
  const store    = useStore();
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = store.currentUser;
  const app      = store.getAppById(id);

  // Modal states
  const [modal, setModal] = useState(null); // 'accept'|'reject'|'draft'|'activate'|'work'|'samples'|'processing'|'final'
  const [note,      setNote]      = useState('');
  const [managerId, setManagerId] = useState('');
  const [taskNote,  setTaskNote]  = useState('');
  const [workStatus,setWorkStatus]= useState('in_progress');
  const [draftFile, setDraftFile] = useState('');
  const [finalDocs, setFinalDocs] = useState({ conclusionUrl:'', reportUrl:'', certificateUrl:'' });

  if (!app) return <div style={{ padding:'40px', color:'var(--red)' }}>Заявка не найдена</div>;

  const prog    = store.getProgramById(app.programId);
  const client  = store.getUserById(app.clientId);
  const mgr     = store.getUserById(app.assignedManagerId);
  const managers = store.getManagers();
  const isAdmin   = user.role === 'admin';
  const isManager = user.role === 'manager' && app.assignedManagerId === user.id;
  const isClient  = user.role === 'client'  && app.clientId === user.id;

  const cfg     = APPLICATION_STATUSES[app.status] || {};
  const step    = cfg.step || 0;

  const closeModal = () => { setModal(null); setNote(''); setTaskNote(''); setDraftFile(''); setFinalDocs({ conclusionUrl:'', reportUrl:'', certificateUrl:'' }); };

  // ── Actions ──────────────────────────────────────────────────────────────
  const doAccept = () => {
    store.acceptApplication(app.id, user.id, note);
    closeModal();
  };
  const doReject = () => {
    if (!note.trim()) return;
    store.rejectApplication(app.id, user.id, note);
    closeModal();
  };
  const doAttachDraft = () => {
    if (!draftFile) return;
    store.attachDraftContract(app.id, user.id, draftFile);
    closeModal();
  };
  const doUploadSigned = filename => {
    store.uploadSignedContract(app.id, user.id, filename);
  };
  const doActivate = () => {
    if (!managerId || !taskNote.trim()) return;
    // resolve manager id from name
    const mgrObj = managers.find(m => m.name === managerId || m.id === managerId);
    store.assignManagerAndActivate(app.id, user.id, mgrObj?.id || managerId, taskNote);
    closeModal();
  };
  const doWorkStatus = () => {
    store.updateWorkStatus(app.id, user.id, workStatus, note);
    closeModal();
  };
  const doNotifySamples = () => {
    store.notifySamplesSent(app.id, user.id, note);
    closeModal();
  };
  const doConfirmSamples = () => {
    store.confirmSamplesReceived(app.id, user.id);
  };
  const doUploadProtocol = filename => {
    store.uploadProtocol(app.id, user.id, filename);
  };
  const doProcessing = () => {
    store.setProcessingStatus(app.id, user.id, note);
    closeModal();
  };
  const doFinalDocs = () => {
    if (!finalDocs.conclusionUrl || !finalDocs.reportUrl || !finalDocs.certificateUrl) return;
    store.uploadFinalDocuments(app.id, user.id, finalDocs);
    closeModal();
  };

  // ── Compute what action banners to show ────────────────────────────────
  const showBanners = () => {
    const banners = [];

    // ADMIN banners
    if (isAdmin) {
      if (app.status === 'submitted') {
        banners.push(
          <Alert key="accept" color="yellow" text="⏳ Новая заявка ожидает вашего решения">
            <Button variant="success" onClick={() => setModal('accept')}>✓ Принять</Button>
            <Button variant="danger"  onClick={() => setModal('reject')}>✗ Отклонить</Button>
          </Alert>
        );
      }
      if (app.status === 'accepted') {
        banners.push(
          <Alert key="draft" color="cyan" text="📄 Прикрепите драфт договора для клиента">
            <Button onClick={() => setModal('draft')}>📎 Прикрепить драфт</Button>
            <Button variant="danger" onClick={() => setModal('reject')}>✗ Отклонить</Button>
          </Alert>
        );
      }
      if (app.status === 'signed') {
        banners.push(
          <Alert key="activate" color="green" text="✅ Договор подписан — назначьте заведующего и активируйте">
            <Button variant="success" onClick={() => setModal('activate')}>⚡ Назначить и активировать</Button>
            <Button variant="danger" onClick={() => setModal('reject')}>✗ Отклонить</Button>
          </Alert>
        );
      }
      if (app.status === 'completed') {
        banners.push(
          <Alert key="samples" color="blue" text="📦 Работа завершена — уведомите клиента об отправке образцов">
            <Button onClick={() => setModal('samples')}>📤 Уведомить об образцах</Button>
          </Alert>
        );
      }
      if (app.status === 'protocol_uploaded') {
        banners.push(
          <Alert key="processing" color="purple" text="📋 Клиент прикрепил протокол — примите в обработку">
            <Button onClick={() => setModal('processing')}>⚙️ Принять в обработку</Button>
          </Alert>
        );
      }
      if (app.status === 'processing') {
        banners.push(
          <Alert key="final" color="green" text="📦 Загрузите итоговые документы: заключение, отчёт, свидетельство">
            <Button variant="success" onClick={() => setModal('final')}>📎 Загрузить документы</Button>
          </Alert>
        );
      }
    }

    // MANAGER banners — only after activation
    if (isManager) {
      if (app.status === 'active') {
        banners.push(
          <Alert key="work" color="blue" text="📋 Обновите статус работы по заданию">
            <Button onClick={() => { setWorkStatus('in_progress'); setModal('work'); }}>⚙️ Взять в работу</Button>
          </Alert>
        );
      }
      if (app.status === 'in_progress') {
        banners.push(
          <Alert key="complete" color="green" text="⚙️ Задание в работе — отметьте завершение">
            <Button variant="success" onClick={() => { setWorkStatus('completed'); setModal('work'); }}>✅ Отметить завершённым</Button>
          </Alert>
        );
      }
    }

    // CLIENT banners
    if (isClient) {
      if (app.status === 'draft_sent' && app.draftContractUrl) {
        banners.push(
          <Alert key="sign" color="cyan" text="📄 Ознакомьтесь с драфтом договора и загрузите подписанный экземпляр">
            <FileUpload onUpload={doUploadSigned} current={app.signedContractUrl} />
          </Alert>
        );
      }
      if (app.status === 'samples_sent') {
        banners.push(
          <Alert key="samples-confirm" color="blue" text="📦 Образцы отправлены — подтвердите получение">
            <Button variant="success" onClick={doConfirmSamples}>✓ Подтвердить получение</Button>
          </Alert>
        );
      }
      if (app.status === 'samples_received') {
        banners.push(
          <Alert key="protocol" color="purple" text="🔬 Образцы получены — прикрепите протокол испытаний">
            <FileUpload onUpload={doUploadProtocol} current={app.protocolUrl} />
          </Alert>
        );
      }
    }

    return banners;
  };

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/applications')}>← Назад к заявкам</button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header__left">
          <div className="detail-header__icon">{prog?.icon}</div>
          <div>
            <div className="detail-header__number">{app.appNumber} · Форма Ф-02-ВП-31</div>
            <h2 className="detail-header__title">{prog?.name}</h2>
            <div className="detail-header__date">
              Подана {new Date(app.createdAt).toLocaleString('ru-RU', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
        </div>
        <div className="detail-header__badges">
          <StatusBadge status={app.status} />
          {mgr && <Badge color="purple">👤 {mgr.name.split(' ')[0]} {mgr.name.split(' ')[1]?.[0]}.</Badge>}
        </div>
      </div>

      {/* Step tracker */}
      <StepTracker currentStep={step} />

      {/* Action banners */}
      {showBanners()}

      {/* Application form data */}
      <SectionBox title="Данные заявки (Ф-02-ВП-31)" icon="📋">
        <InfoRow label="Наименование объекта испытаний"                        value={app.formData.objectName} />
        <InfoRow label="Измеряемые величины / показатели"                      value={app.formData.indicators} />
        <InfoRow label="Рабочий диапазон измерений, единицы"                  value={app.formData.measureRange} />
        <InfoRow label="Нормативный документ на метод"                         value={app.formData.normDoc} />
        <InfoRow label="Структурное подразделение"                             value={app.formData.deptName} />
        <InfoRow label="Аттестат аккредитации"                                 value={app.formData.accreditCert || '—'} />
        <InfoRow label="Руководитель подразделения (ФИО, должность)"           value={app.formData.headName} />
        <InfoRow label="Адрес, телефон, e-mail руководителя"                   value={app.formData.headContact} />
        <InfoRow label="Организация, БИН, адрес, реквизиты"                   value={app.formData.orgDetails} />
        <InfoRow label="Руководитель организации (ФИО, должность)"             value={app.formData.directorName} />
      </SectionBox>

      {/* Client info */}
      {(isAdmin || isManager) && (
        <SectionBox title="Клиент" icon="🏢">
          <InfoRow label="ФИО"           value={client?.name} />
          <InfoRow label="Организация"   value={client?.orgName} />
          <InfoRow label="Email"         value={client?.email} />
          <InfoRow label="Телефон"       value={client?.phone} />
        </SectionBox>
      )}

      {/* Contract documents */}
      {(app.draftContractUrl || app.signedContractUrl) && (
        <SectionBox title="Договор" icon="📝">
          {app.draftContractUrl && (
            <div className="file-row" style={{ marginBottom: '8px' }}>
              <span className="file-row__icon">📄</span>
              <span className="file-row__name">Драфт договора: {app.draftContractUrl}</span>
              <Badge color="cyan" className="file-row__badge">Драфт</Badge>
            </div>
          )}
          {app.signedContractUrl && (
            <div className="file-row">
              <span className="file-row__icon">✅</span>
              <span className="file-row__name">Подписанный договор: {app.signedContractUrl}</span>
              <Badge color="green" className="file-row__badge">Подписан</Badge>
            </div>
          )}
        </SectionBox>
      )}

      {/* Assignment & task */}
      {(app.assignedManagerId || app.taskNote) && (
        <SectionBox title="Задание по договору" icon="📌">
          {mgr && <InfoRow label="Заведующий" value={`${mgr.name} — ${mgr.position}`} />}
          {app.taskNote && <InfoRow label="Задание"     value={app.taskNote} />}
        </SectionBox>
      )}

      {/* Protocol */}
      {app.protocolUrl && (
        <SectionBox title="Протокол испытаний" icon="🔬">
          <div className="file-row">
            <span className="file-row__icon">📋</span>
            <span className="file-row__name">{app.protocolUrl}</span>
            <Badge color="purple" className="file-row__badge">Прикреплён клиентом</Badge>
          </div>
        </SectionBox>
      )}

      {/* Final documents */}
      {(app.conclusionUrl || app.reportUrl || app.certificateUrl) && (
        <SectionBox title="Итоговые документы" icon="📦">
          {app.conclusionUrl && (
            <div className="file-row" style={{ marginBottom:'6px' }}>
              <span className="file-row__icon">📄</span>
              <span className="file-row__name">Заключение: {app.conclusionUrl}</span>
              <Badge color="green" className="file-row__badge">✓</Badge>
            </div>
          )}
          {app.reportUrl && (
            <div className="file-row" style={{ marginBottom:'6px' }}>
              <span className="file-row__icon">📊</span>
              <span className="file-row__name">Отчёт: {app.reportUrl}</span>
              <Badge color="green" className="file-row__badge">✓</Badge>
            </div>
          )}
          {app.certificateUrl && (
            <div className="file-row">
              <span className="file-row__icon">🏅</span>
              <span className="file-row__name">Свидетельство: {app.certificateUrl}</span>
              <Badge color="green" className="file-row__badge">✓</Badge>
            </div>
          )}
        </SectionBox>
      )}

      {/* Timeline */}
      <SectionBox title="История статусов" icon="🕐">
        <Timeline items={[...app.timeline].reverse()} store={store} />
      </SectionBox>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}

      {/* Accept */}
      <Modal open={modal==='accept'} onClose={closeModal} title="Принять заявку">
        <Textarea label="Комментарий (необязательно)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Напр.: Заявка соответствует требованиям программы ПК." />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="success" onClick={doAccept}>✓ Принять заявку</Button>
        </div>
      </Modal>

      {/* Reject */}
      <Modal open={modal==='reject'} onClose={closeModal} title="Отклонить заявку">
        <Textarea label="Причина отклонения *" value={note} onChange={e=>setNote(e.target.value)} placeholder="Укажите причину отклонения..." />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="danger" onClick={doReject} disabled={!note.trim()}>✗ Отклонить</Button>
        </div>
      </Modal>

      {/* Attach draft contract */}
      <Modal open={modal==='draft'} onClose={closeModal} title="Прикрепить драфт договора">
        <FileUpload label="Файл драфта договора *" onUpload={name => setDraftFile(name)} current={draftFile} />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doAttachDraft} disabled={!draftFile}>📎 Прикрепить</Button>
        </div>
      </Modal>

      {/* Assign manager + activate */}
      <Modal open={modal==='activate'} onClose={closeModal} title="Назначить заведующего и активировать" width={580}>
        <Select
          label="Заведующий *"
          value={managerId}
          onChange={e => setManagerId(e.target.value)}
          options={managers.map(m => ({ value: m.id, label: `${m.name} — ${m.position}` }))}
        />
        <Textarea
          label="Задание по договору *"
          value={taskNote}
          onChange={e => setTaskNote(e.target.value)}
          rows={4}
          placeholder="Опишите задание: программу, сроки, особые требования..."
        />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button variant="success" onClick={doActivate} disabled={!managerId || !taskNote.trim()}>
            ⚡ Назначить и активировать
          </Button>
        </div>
      </Modal>

      {/* Work status (manager) */}
      <Modal open={modal==='work'} onClose={closeModal} title="Обновить статус работы">
        <Select
          label="Статус работы"
          value={workStatus}
          onChange={e => setWorkStatus(e.target.value)}
          options={[
            { value:'in_progress', label:'В работе' },
            { value:'completed',   label:'Завершён'  },
          ]}
        />
        <Textarea label="Комментарий (необязательно)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Доп. сведения о ходе работы..." />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doWorkStatus}>💾 Сохранить статус</Button>
        </div>
      </Modal>

      {/* Notify samples sent */}
      <Modal open={modal==='samples'} onClose={closeModal} title="Уведомление об отправке образцов">
        <Textarea label="Сообщение клиенту (необязательно)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Напр.: Образцы отправлены курьером. Ожидайте в течение 3 рабочих дней." />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doNotifySamples}>📤 Уведомить клиента</Button>
        </div>
      </Modal>

      {/* Set processing status */}
      <Modal open={modal==='processing'} onClose={closeModal} title="Принять протокол в обработку">
        <Textarea label="Комментарий клиенту (необязательно)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Напр.: Протокол получен. Срок обработки — 5 рабочих дней." />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Отмена</Button>
          <Button onClick={doProcessing}>⚙️ Принять в обработку</Button>
        </div>
      </Modal>

      {/* Upload final documents */}
      <Modal open={modal==='final'} onClose={closeModal} title="Загрузить итоговые документы" width={580}>
        <FileUpload
          label="Заключение *"
          onUpload={name => setFinalDocs(d => ({ ...d, conclusionUrl: name }))}
          current={finalDocs.conclusionUrl}
        />
        <FileUpload
          label="Отчёт *"
          onUpload={name => setFinalDocs(d => ({ ...d, reportUrl: name }))}
          current={finalDocs.reportUrl}
        />
        <FileUpload
          label="Свидетельство *"
          onUpload={name => setFinalDocs(d => ({ ...d, certificateUrl: name }))}
          current={finalDocs.certificateUrl}
        />
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
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
