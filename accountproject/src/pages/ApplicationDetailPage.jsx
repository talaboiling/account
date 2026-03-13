// src/pages/ApplicationDetailPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge, StatusBadge, Modal, Select, Textarea, InfoRow, Card } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function Section({ title, icon, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden', marginBottom:'16px' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg-card2)', display:'flex', alignItems:'center', gap:'8px' }}>
        <span>{icon}</span>
        <h3 style={{ fontFamily:'var(--font-main)', fontWeight:700, fontSize:'0.95rem' }}>{title}</h3>
      </div>
      <div style={{ padding:'18px' }}>{children}</div>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const store = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = store.currentUser;
  const app = store.applications.find(a => a.id === id);

  const [modalSign, setModalSign] = useState(false);
  const [modalReject, setModalReject] = useState(false);
  const [modalProtocol, setModalProtocol] = useState(false);
  const [modalResult, setModalResult] = useState(false);
  const [adminNote, setAdminNote] = useState(app?.adminNote || '');
  const [selectedManager, setSelectedManager] = useState(app?.assignedManagerId || '');
  const [protocolText, setProtocolText] = useState('');
  const [resultText, setResultText] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  if (!app) return <div style={{ padding:'40px', color:'var(--red)' }}>Заявка не найдена</div>;

  const program = store.getProgramById(app.programId);
  const client = store.getUserById(app.clientId);
  const manager = store.getUserById(app.assignedManagerId);
  const protocol = store.getProtocolByAppId(app.id);
  const result = store.getResultByAppId(app.id);
  const managers = store.getManagers();
  const fmtFields = store.programForms[app.programId] || [];

  const canAdmin = user.role === 'admin';
  const canManager = user.role === 'manager' && app.assignedManagerId === user.id;
  const canClient = user.role === 'client' && app.clientId === user.id;

  const handleSign = () => {
    store.updateApplicationStatus(app.id, 'signed', adminNote, selectedManager || undefined);
    if (selectedManager) store.assignManager(app.id, selectedManager);
    setModalSign(false);
  };

  const handleReject = () => {
    store.updateApplicationStatus(app.id, 'rejected', rejectNote);
    setModalReject(false);
  };

  const handleProtocol = () => {
    store.createProtocol(app.id, user.id, protocolText);
    setModalProtocol(false);
  };

  const handleResult = () => {
    store.createResult(app.id, user.id, resultText);
    setModalResult(false);
  };

  const handleSendProtocol = () => store.sendProtocolToClient(app.id, user.id);
  const handleConfirmProtocol = () => store.confirmProtocolDelivery(app.id, user.id);
  const handleConfirmResult = () => result && store.confirmResultDelivery(result.id, user.id);

  return (
    <div style={{ animation:'fadeIn 0.3s ease', maxWidth:'800px' }}>
      {/* Back */}
      <button onClick={() => navigate('/applications')} style={{ background:'none', border:'none', color:'var(--text-sub)', cursor:'pointer', fontSize:'0.875rem', marginBottom:'16px', display:'flex', alignItems:'center', gap:'6px', padding:0 }}>← Назад к заявкам</button>

      {/* Header */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px', marginBottom:'16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
          <div style={{ width:'48px', height:'48px', background:'var(--accent-dim)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{program?.icon}</div>
          <div>
            <div style={{ fontSize:'0.75rem', color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-main)', letterSpacing:'0.05em' }}>{app.sampleCode}</div>
            <h2 style={{ fontFamily:'var(--font-main)', fontWeight:800, fontSize:'1.1rem', margin:'3px 0' }}>{program?.name}</h2>
            <div style={{ fontSize:'0.8rem', color:'var(--text-sub)' }}>Подана {format(new Date(app.createdAt), 'd MMMM yyyy в HH:mm', { locale:ru })}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
          <StatusBadge status={app.status} />
          {app.protocolReady && <Badge color="purple">🧪 Протокол</Badge>}
          {app.resultReady && <Badge color="green">📄 Заключение</Badge>}
        </div>
      </div>

      {/* Admin actions */}
      {canAdmin && app.status === 'pending' && (
        <div style={{ background:'var(--yellow-dim)', border:'1px solid rgba(245,197,66,0.3)', borderRadius:'var(--radius)', padding:'16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--yellow)', fontSize:'0.875rem', fontWeight:600, flex:1 }}>⏳ Заявка ожидает вашего решения</span>
          <Button variant="success" onClick={() => setModalSign(true)}>✓ Подписать</Button>
          <Button variant="danger" onClick={() => setModalReject(true)}>✗ Отклонить</Button>
        </div>
      )}

      {/* Manager actions */}
      {canManager && app.status === 'signed' && !app.protocolReady && (
        <div style={{ background:'var(--purple-dim)', border:'1px solid rgba(164,127,255,0.3)', borderRadius:'var(--radius)', padding:'16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--purple)', fontSize:'0.875rem', fontWeight:600, flex:1 }}>🔬 Создайте протокол по результатам исследования</span>
          <Button onClick={() => setModalProtocol(true)} style={{ background:'var(--purple-dim)', color:'var(--purple)', border:'1px solid rgba(164,127,255,0.3)' }}>🧪 Создать протокол</Button>
        </div>
      )}

      {/* Admin - send protocol */}
      {canAdmin && app.protocolReady && !app.protocolDelivered && protocol?.status !== 'delivered' && (
        <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(79,142,247,0.3)', borderRadius:'var(--radius)', padding:'16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--accent)', fontSize:'0.875rem', fontWeight:600, flex:1 }}>📤 Протокол готов — отправьте его клиенту</span>
          <Button onClick={handleSendProtocol}>📨 Отправить клиенту</Button>
        </div>
      )}

      {/* Client - confirm protocol */}
      {canClient && protocol?.status === 'sent' && !app.protocolDelivered && (
        <div style={{ background:'var(--accent-dim)', border:'1px solid rgba(79,142,247,0.3)', borderRadius:'var(--radius)', padding:'16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--accent)', fontSize:'0.875rem', fontWeight:600, flex:1 }}>📬 Протокол отправлен вам — подтвердите получение</span>
          <Button onClick={handleConfirmProtocol}>✓ Подтвердить получение</Button>
        </div>
      )}

      {/* Admin - create result */}
      {canAdmin && app.protocolDelivered && !app.resultReady && (
        <div style={{ background:'var(--green-dim)', border:'1px solid rgba(60,201,138,0.3)', borderRadius:'var(--radius)', padding:'16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--green)', fontSize:'0.875rem', fontWeight:600, flex:1 }}>✅ Протокол доставлен — создайте итоговое заключение</span>
          <Button variant="success" onClick={() => setModalResult(true)}>📄 Создать заключение</Button>
        </div>
      )}

      {/* Client - confirm result */}
      {canClient && result && !result.clientConfirmed && (
        <div style={{ background:'var(--green-dim)', border:'1px solid rgba(60,201,138,0.3)', borderRadius:'var(--radius)', padding:'16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--green)', fontSize:'0.875rem', fontWeight:600, flex:1 }}>📄 Итоговое заключение готово — подтвердите получение</span>
          <Button variant="success" onClick={handleConfirmResult}>✓ Получено</Button>
        </div>
      )}

      {/* Client info */}
      <Section title="Информация о клиенте" icon="👤">
        <InfoRow label="ФИО" value={client?.name} />
        <InfoRow label="Email" value={client?.email} />
        <InfoRow label="Телефон" value={client?.phone} />
        <InfoRow label="Организация" value={client?.orgName} />
      </Section>

      {/* Application data */}
      <Section title="Данные заявки" icon="📋">
        {fmtFields.map(field => (
          <InfoRow key={field.id} label={field.label} value={app.formData[field.id]} />
        ))}
        {app.adminNote && <InfoRow label="Примечание администратора" value={app.adminNote} />}
      </Section>

      {/* Assignment */}
      {(canAdmin || manager) && (
        <Section title="Назначение" icon="🔬">
          <InfoRow label="Лаборант" value={manager ? manager.name : '—'} />
          {manager && <InfoRow label="Должность" value={manager.position} />}
          {canAdmin && app.status === 'pending' && (
            <div style={{ marginTop:'12px' }}>
              <Select label="Переназначить лаборанта" value={selectedManager} onChange={e => setSelectedManager(e.target.value)} options={managers.map(m => m.name)} />
            </div>
          )}
        </Section>
      )}

      {/* Protocol */}
      {protocol && (
        <Section title="Протокол испытаний" icon="🧪">
          <InfoRow label="Дата создания" value={format(new Date(protocol.createdAt), 'd MMMM yyyy', { locale:ru })} />
          <InfoRow label="Лаборант" value={store.getUserById(protocol.managerId)?.name} />
          <InfoRow label="Статус" value={protocol.status === 'delivered' ? '✅ Доставлен клиенту' : protocol.status === 'sent' ? '📤 Отправлен' : '🔄 Ожидает отправки'} />
          <div style={{ marginTop:'12px' }}>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:'8px' }}>Содержание протокола</div>
            <pre style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', fontSize:'0.82rem', whiteSpace:'pre-wrap', wordBreak:'break-word', color:'var(--text)', fontFamily:'var(--font-body)', lineHeight:1.7 }}>{protocol.content}</pre>
          </div>
        </Section>
      )}

      {/* Result */}
      {result && (
        <Section title="Итоговое заключение" icon="📄">
          <InfoRow label="Дата создания" value={format(new Date(result.createdAt), 'd MMMM yyyy', { locale:ru })} />
          <InfoRow label="Статус" value={result.clientConfirmed ? '✅ Клиент подтвердил получение' : '📤 Отправлено клиенту'} />
          <div style={{ marginTop:'12px' }}>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:'8px' }}>Содержание заключения</div>
            <pre style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', fontSize:'0.82rem', whiteSpace:'pre-wrap', wordBreak:'break-word', color:'var(--text)', fontFamily:'var(--font-body)', lineHeight:1.7 }}>{result.content}</pre>
          </div>
        </Section>
      )}

      {/* Modals */}
      <Modal open={modalSign} onClose={() => setModalSign(false)} title="Подписать заявку">
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <Select label="Назначить лаборанта" value={selectedManager} onChange={e => setSelectedManager(e.target.value)} options={managers.map(m => m.name)} />
          <Textarea label="Примечание (необязательно)" value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Комментарий к заявке..." />
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalSign(false)}>Отмена</Button>
            <Button variant="success" onClick={handleSign}>✓ Подписать</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalReject} onClose={() => setModalReject(false)} title="Отклонить заявку">
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <Textarea label="Причина отклонения *" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Укажите причину..." />
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalReject(false)}>Отмена</Button>
            <Button variant="danger" onClick={handleReject}>✗ Отклонить</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalProtocol} onClose={() => setModalProtocol(false)} title="Создать протокол испытаний" width={640}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <Textarea label="Содержание протокола *" value={protocolText} onChange={e => setProtocolText(e.target.value)} placeholder={`Протокол испытаний №ПИ-${new Date().getFullYear()}-000\n\nОбразец: ...\nМетоды исследования: ...\n\nРезультаты:\n- ...\n\nЗАКЛЮЧЕНИЕ: ...`} style={{ '& textarea': { minHeight:'180px' } }} />
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalProtocol(false)}>Отмена</Button>
            <Button onClick={handleProtocol} disabled={!protocolText.trim()}>🧪 Создать протокол</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalResult} onClose={() => setModalResult(false)} title="Создать итоговое заключение" width={640}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <Textarea label="Содержание заключения *" value={resultText} onChange={e => setResultText(e.target.value)} placeholder={`ЗАКЛЮЧЕНИЕ №З-${new Date().getFullYear()}-000\n\nНа основании проведённых исследований:\n\n...\n\nВывод: ...`} />
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Button variant="secondary" onClick={() => setModalResult(false)}>Отмена</Button>
            <Button variant="success" onClick={handleResult} disabled={!resultText.trim()}>📄 Создать заключение</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
