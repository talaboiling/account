// src/pages/ApplicationDetailPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge, StatusBadge, Modal, Select, Textarea, InfoRow, Alert } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import '../styles/pages.css';

function Section({ title, icon, children }) {
  return (
    <div className="detail-section">
      <div className="detail-section__head">
        <span>{icon}</span>
        <h3 className="detail-section__title">{title}</h3>
      </div>
      <div className="detail-section__body">{children}</div>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const store    = useStore();
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = store.currentUser;
  const app      = store.applications.find(a => a.id === id);

  const [modalSign,     setModalSign]     = useState(false);
  const [modalReject,   setModalReject]   = useState(false);
  const [modalProtocol, setModalProtocol] = useState(false);
  const [modalResult,   setModalResult]   = useState(false);
  const [adminNote,     setAdminNote]     = useState(app?.adminNote || '');
  const [selectedMgr,   setSelectedMgr]   = useState(app?.assignedManagerId || '');
  const [protocolText,  setProtocolText]  = useState('');
  const [resultText,    setResultText]    = useState('');
  const [rejectNote,    setRejectNote]    = useState('');

  if (!app) return <div style={{ padding: '40px', color: 'var(--red)' }}>Заявка не найдена</div>;

  const program  = store.getProgramById(app.programId);
  const client   = store.getUserById(app.clientId);
  const manager  = store.getUserById(app.assignedManagerId);
  const protocol = store.getProtocolByAppId(app.id);
  const result   = store.getResultByAppId(app.id);
  const managers = store.getManagers();
  const fmtFields= store.programForms[app.programId] || [];

  const canAdmin   = user.role === 'admin';
  const canManager = user.role === 'manager' && app.assignedManagerId === user.id;
  const canClient  = user.role === 'client'  && app.clientId === user.id;

  const handleSign = () => {
    store.updateApplicationStatus(app.id, 'signed', adminNote, selectedMgr || undefined);
    if (selectedMgr) store.assignManager(app.id, selectedMgr);
    setModalSign(false);
  };
  const handleReject       = () => { store.updateApplicationStatus(app.id, 'rejected', rejectNote); setModalReject(false); };
  const handleProtocol     = () => { store.createProtocol(app.id, user.id, protocolText); setModalProtocol(false); };
  const handleResult       = () => { store.createResult(app.id, user.id, resultText); setModalResult(false); };
  const handleSendProtocol = () => store.sendProtocolToClient(app.id, user.id);
  const handleConfirmProto = () => store.confirmProtocolDelivery(app.id, user.id);
  const handleConfirmResult= () => result && store.confirmResultDelivery(result.id, user.id);

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/applications')}>← Назад к заявкам</button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header__left">
          <div className="detail-header__icon">{program?.icon}</div>
          <div>
            <div className="detail-header__code">{app.sampleCode}</div>
            <h2 className="detail-header__title">{program?.name}</h2>
            <div className="detail-header__date">
              Подана {format(new Date(app.createdAt), 'd MMMM yyyy в HH:mm', { locale: ru })}
            </div>
          </div>
        </div>
        <div className="detail-header__badges">
          <StatusBadge status={app.status} />
          {app.protocolReady && <Badge color="purple">🧪 Протокол</Badge>}
          {app.resultReady   && <Badge color="green">📄 Заключение</Badge>}
        </div>
      </div>

      {/* Action alerts */}
      {canAdmin && app.status === 'pending' && (
        <Alert color="yellow" text="⏳ Заявка ожидает вашего решения">
          <Button variant="success" onClick={() => setModalSign(true)}>✓ Подписать</Button>
          <Button variant="danger"  onClick={() => setModalReject(true)}>✗ Отклонить</Button>
        </Alert>
      )}
      {canManager && app.status === 'signed' && !app.protocolReady && (
        <Alert color="purple" text="🔬 Создайте протокол по результатам исследования">
          <Button onClick={() => setModalProtocol(true)}>🧪 Создать протокол</Button>
        </Alert>
      )}
      {canAdmin && app.protocolReady && !app.protocolDelivered && protocol?.status !== 'delivered' && (
        <Alert color="blue" text="📤 Протокол готов — отправьте его клиенту">
          <Button onClick={handleSendProtocol}>📨 Отправить клиенту</Button>
        </Alert>
      )}
      {canClient && protocol?.status === 'sent' && !app.protocolDelivered && (
        <Alert color="blue" text="📬 Протокол отправлен вам — подтвердите получение">
          <Button onClick={handleConfirmProto}>✓ Подтвердить получение</Button>
        </Alert>
      )}
      {canAdmin && app.protocolDelivered && !app.resultReady && (
        <Alert color="green" text="✅ Протокол доставлен — создайте итоговое заключение">
          <Button variant="success" onClick={() => setModalResult(true)}>📄 Создать заключение</Button>
        </Alert>
      )}
      {canClient && result && !result.clientConfirmed && (
        <Alert color="green" text="📄 Итоговое заключение готово — подтвердите получение">
          <Button variant="success" onClick={handleConfirmResult}>✓ Получено</Button>
        </Alert>
      )}

      {/* Sections */}
      <Section title="Информация о клиенте" icon="👤">
        <InfoRow label="ФИО"          value={client?.name} />
        <InfoRow label="Email"        value={client?.email} />
        <InfoRow label="Телефон"      value={client?.phone} />
        <InfoRow label="Организация"  value={client?.orgName} />
      </Section>

      <Section title="Данные заявки" icon="📋">
        {fmtFields.map(field => (
          <InfoRow key={field.id} label={field.label} value={app.formData[field.id]} />
        ))}
        {app.adminNote && <InfoRow label="Примечание администратора" value={app.adminNote} />}
      </Section>

      {(canAdmin || manager) && (
        <Section title="Назначение" icon="🔬">
          <InfoRow label="Лаборант"  value={manager ? manager.name : '—'} />
          {manager && <InfoRow label="Должность" value={manager.position} />}
        </Section>
      )}

      {protocol && (
        <Section title="Протокол испытаний" icon="🧪">
          <InfoRow label="Дата создания" value={format(new Date(protocol.createdAt), 'd MMMM yyyy', { locale: ru })} />
          <InfoRow label="Лаборант"      value={store.getUserById(protocol.managerId)?.name} />
          <InfoRow label="Статус"        value={
            protocol.status === 'delivered' ? '✅ Доставлен клиенту' :
            protocol.status === 'sent'      ? '📤 Отправлен' : '🔄 Ожидает отправки'
          } />
          <div style={{ marginTop: '12px' }}>
            <div className="protocol-text__label">Содержание протокола</div>
            <pre className="protocol-text">{protocol.content}</pre>
          </div>
        </Section>
      )}

      {result && (
        <Section title="Итоговое заключение" icon="📄">
          <InfoRow label="Дата создания" value={format(new Date(result.createdAt), 'd MMMM yyyy', { locale: ru })} />
          <InfoRow label="Статус" value={result.clientConfirmed ? '✅ Клиент подтвердил получение' : '📤 Отправлено клиенту'} />
          <div style={{ marginTop: '12px' }}>
            <div className="protocol-text__label">Содержание заключения</div>
            <pre className="protocol-text">{result.content}</pre>
          </div>
        </Section>
      )}

      {/* Modals */}
      <Modal open={modalSign} onClose={() => setModalSign(false)} title="Подписать заявку">
        <div className="create-user-form">
          <Select label="Назначить лаборанта" value={selectedMgr}
            onChange={e => setSelectedMgr(e.target.value)} options={managers.map(m => m.name)} />
          <Textarea label="Примечание (необязательно)" value={adminNote}
            onChange={e => setAdminNote(e.target.value)} placeholder="Комментарий к заявке..." />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalSign(false)}>Отмена</Button>
            <Button variant="success" onClick={handleSign}>✓ Подписать</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalReject} onClose={() => setModalReject(false)} title="Отклонить заявку">
        <div className="create-user-form">
          <Textarea label="Причина отклонения *" value={rejectNote}
            onChange={e => setRejectNote(e.target.value)} placeholder="Укажите причину..." />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalReject(false)}>Отмена</Button>
            <Button variant="danger" onClick={handleReject}>✗ Отклонить</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalProtocol} onClose={() => setModalProtocol(false)} title="Создать протокол испытаний" width={640}>
        <div className="create-user-form">
          <Textarea label="Содержание протокола *" value={protocolText}
            onChange={e => setProtocolText(e.target.value)}
            placeholder={`Протокол испытаний №ПИ-${new Date().getFullYear()}-000\n\nОбразец: ...\nМетоды: ...\n\nРезультаты:\n- ...\n\nЗАКЛЮЧЕНИЕ: ...`} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalProtocol(false)}>Отмена</Button>
            <Button onClick={handleProtocol} disabled={!protocolText.trim()}>🧪 Создать протокол</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalResult} onClose={() => setModalResult(false)} title="Создать итоговое заключение" width={640}>
        <div className="create-user-form">
          <Textarea label="Содержание заключения *" value={resultText}
            onChange={e => setResultText(e.target.value)}
            placeholder={`ЗАКЛЮЧЕНИЕ №З-${new Date().getFullYear()}-000\n\nНа основании проведённых исследований:\n\n...\n\nВывод: ...`} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalResult(false)}>Отмена</Button>
            <Button variant="success" onClick={handleResult} disabled={!resultText.trim()}>📄 Создать заключение</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
