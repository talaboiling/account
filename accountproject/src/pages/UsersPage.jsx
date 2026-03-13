// src/pages/UsersPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageHeader, Badge, Tabs, Modal, Input, Select, Button } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

const ROLE_LABEL = { admin:'Администратор', manager:'Лаборант', client:'Клиент' };
const ROLE_COLOR = { admin:'blue', manager:'purple', client:'green' };

export default function UsersPage() {
  const store = useStore();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name:'', email:'', phone:'', position:'', role:'manager' });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');

  const allUsers = store.users;
  const filtered = allUsers.filter(u => {
    const matchRole = tab === 'all' || u.role === tab;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all: allUsers.length,
    admin: allUsers.filter(u => u.role === 'admin').length,
    manager: allUsers.filter(u => u.role === 'manager').length,
    client: allUsers.filter(u => u.role === 'client').length,
  };

  const set = k => e => setNewUser(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = () => {
    if (!newUser.name || !newUser.email) { setError('Заполните имя и email'); return; }
    if (store.users.find(u => u.email === newUser.email)) { setError('Email уже используется'); return; }
    const password = `Pass${Math.floor(1000+Math.random()*9000)}!`;
    const user = { id: uuidv4(), ...newUser, password, verified: true, createdAt: new Date().toISOString() };
    store.users.push(user);
    store.notify();
    setCreated({ ...user, password });
    setNewUser({ name:'', email:'', phone:'', position:'', role:'manager' });
    setError('');
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Пользователи"
        subtitle={`Управление учётными записями системы`}
        actions={<Button onClick={() => setShowCreate(true)}>+ Создать пользователя</Button>}
      />

      <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Поиск по имени или email..." style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'9px 14px', color:'var(--text)', fontSize:'0.875rem', flex:1, outline:'none' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
      </div>

      <Tabs
        tabs={[
          { id:'all', label:'Все', count: counts.all },
          { id:'admin', label:'Администраторы', count: counts.admin },
          { id:'manager', label:'Лаборанты', count: counts.manager },
          { id:'client', label:'Клиенты', count: counts.client },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--text-sub)' }}>Пользователей не найдено</div>
        ) : filtered.map((u, i) => (
          <div key={u.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none', gap:'12px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1, minWidth:0 }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'var(--bg-card2)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-main)', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
                {u.name.charAt(0)}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-sub)', marginTop:'1px' }}>{u.email}</div>
                {u.position && <div style={{ fontSize:'0.75rem', color:'var(--text-dim)' }}>{u.position}</div>}
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap', flexShrink:0 }}>
              {u.phone && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>{u.phone}</span>}
              <Badge color={ROLE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Badge>
              {u.role === 'client' && <Badge color={u.verified ? 'green' : 'yellow'}>{u.verified ? '✓ Верифицирован' : '⏳ Не верифицирован'}</Badge>}
              <span style={{ fontSize:'0.72rem', color:'var(--text-dim)' }}>{format(new Date(u.createdAt), 'd MMM yyyy', { locale:ru })}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreated(null); setError(''); }} title="Создать пользователя">
        {created ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ background:'var(--green-dim)', border:'1px solid rgba(60,201,138,0.3)', borderRadius:'var(--radius-sm)', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'8px' }}>✅</div>
              <div style={{ fontWeight:700, marginBottom:'4px' }}>Пользователь создан!</div>
            </div>
            <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>Email:</span><strong>{created.email}</strong></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>Пароль:</span><strong style={{ color:'var(--yellow)', fontFamily:'monospace' }}>{created.password}</strong></div>
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-sub)', textAlign:'center' }}>Сохраните и передайте данные пользователю!</p>
            <Button onClick={() => { setShowCreate(false); setCreated(null); }} style={{ justifyContent:'center' }}>Закрыть</Button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <Input label="ФИО *" value={newUser.name} onChange={set('name')} placeholder="Иванов Иван Иванович" />
            <Input label="Email *" type="email" value={newUser.email} onChange={set('email')} placeholder="user@lab.ru" />
            <Input label="Телефон" type="tel" value={newUser.phone} onChange={set('phone')} placeholder="+7..." />
            <Input label="Должность" value={newUser.position} onChange={set('position')} placeholder="Старший лаборант" />
            <Select label="Роль" value={newUser.role} onChange={set('role')} options={['admin','manager']} />
            {error && <div style={{ color:'var(--red)', fontSize:'0.875rem', background:'var(--red-dim)', padding:'8px 12px', borderRadius:'var(--radius-sm)' }}>{error}</div>}
            <p style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>Пароль будет сгенерирован автоматически</p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Отмена</Button>
              <Button onClick={handleCreate}>+ Создать</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
