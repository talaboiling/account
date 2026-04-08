// src/pages/UsersPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageHeader, Badge, Tabs, Modal, Input, Select, Button } from '../components/ui';
import { v4 as uuidv4 } from 'uuid';
import '../styles/pages.css';

const ROLE_LABEL = { admin:'Администратор', manager:'Заведующий', client:'Клиент' };
const ROLE_COLOR = { admin:'blue', manager:'purple', client:'green' };

export default function UsersPage() {
  const store = useStore();
  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [nd,         setNd]         = useState({ name:'', email:'', phone:'', position:'', role:'manager' });
  const [created,    setCreated]    = useState(null);
  const [error,      setError]      = useState('');

  const setF = k => e => setNd(f => ({ ...f, [k]: e.target.value }));

  const tabMap = { admins:'admin', managers:'manager', clients:'client' };
  const filtered = store.users.filter(u => {
    const matchRole   = tab === 'all' || u.role === tabMap[tab];
    const q           = search.toLowerCase();
    const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.orgName?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const count = r => store.users.filter(u => u.role === r).length;

  const handleCreate = () => {
    setError('');
    if (!nd.name.trim() || !nd.email.trim()) { setError('Заполните ФИО и email'); return; }
    if (store.users.find(u => u.email === nd.email)) { setError('Email уже используется'); return; }
    const password = `Pass${Math.floor(1000 + Math.random() * 9000)}!`;
    const user = { id: uuidv4(), ...nd, password, verified: true, createdAt: new Date().toISOString() };
    store.users.push(user);
    store.notify();
    setCreated({ ...user, password });
    setNd({ name:'', email:'', phone:'', position:'', role:'manager' });
  };

  const closeCreate = () => { setShowCreate(false); setCreated(null); setError(''); };

  return (
    <div className="fade-in">
      <PageHeader
        title="Пользователи"
        subtitle="Управление учётными записями системы"
        actions={<Button onClick={() => setShowCreate(true)}>+ Создать пользователя</Button>}
      />

      <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Поиск по имени, email, организации..." />
      </div>

      <Tabs
        tabs={[
          { id:'all',      label:'Все',              count: store.users.length  },
          { id:'admins',   label:'Администраторы',   count: count('admin')      },
          { id:'managers', label:'Заведующие',       count: count('manager')    },
          { id:'clients',  label:'Клиенты',          count: count('client')     },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="users-list">
        {filtered.length === 0 ? (
          <div style={{ padding:'32px', textAlign:'center', color:'var(--text-sub)' }}>Пользователей не найдено</div>
        ) : filtered.map(u => (
          <div key={u.id} className="user-row">
            <div className="user-row__left">
              <div className="user-row__avatar">{u.name.charAt(0)}</div>
              <div>
                <div className="user-row__name">{u.name}</div>
                <div className="user-row__email">{u.email}</div>
                {u.position && <div className="user-row__pos">{u.position}</div>}
                {u.orgName   && <div className="user-row__pos">🏢 {u.orgName}</div>}
              </div>
            </div>
            <div className="user-row__right">
              {u.phone && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>{u.phone}</span>}
              <Badge color={ROLE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Badge>
              {u.role === 'client' && (
                <Badge color={u.verified ? 'green' : 'yellow'}>
                  {u.verified ? '✓ Верифицирован' : '⏳ Ожидает'}
                </Badge>
              )}
              <span style={{ fontSize:'0.72rem', color:'var(--text-dim)' }}>
                {new Date(u.createdAt).toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create user modal */}
      <Modal open={showCreate} onClose={closeCreate} title="Создать пользователя">
        {created ? (
          <>
            <div style={{ background:'var(--green-dim)', border:'1px solid rgba(60,201,138,0.3)', borderRadius:'var(--radius-sm)', padding:'14px', textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'6px' }}>✅</div>
              <div style={{ fontWeight:700 }}>Пользователь создан!</div>
            </div>
            <div className="creds-box">
              <div className="creds-box__row">
                <span className="creds-box__label">Email:</span>
                <strong>{created.email}</strong>
              </div>
              <div className="creds-box__row">
                <span className="creds-box__label">Роль:</span>
                <Badge color={ROLE_COLOR[created.role]}>{ROLE_LABEL[created.role]}</Badge>
              </div>
              <div className="creds-box__row">
                <span className="creds-box__label">Пароль:</span>
                <span className="creds-box__pass">{created.password}</span>
              </div>
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-sub)', textAlign:'center' }}>
              ⚠️ Сохраните пароль — он больше не будет показан
            </p>
            <Button onClick={closeCreate} className="btn--full">Закрыть</Button>
          </>
        ) : (
          <>
            <Input label="ФИО *"       value={nd.name}     onChange={setF('name')}     placeholder="Иванов Иван Иванович" />
            <Input label="Email *"     type="email" value={nd.email}    onChange={setF('email')}    placeholder="user@csee.kz" />
            <Input label="Телефон"     type="tel"   value={nd.phone}    onChange={setF('phone')}    placeholder="+7 (___) ___-__-__" />
            <Input label="Должность"               value={nd.position} onChange={setF('position')} placeholder="Заведующий лабораторией" />
            <Select
              label="Роль"
              value={nd.role}
              onChange={setF('role')}
              options={[
                { value:'admin',   label:'Администратор' },
                { value:'manager', label:'Заведующий'    },
              ]}
            />
            {error && <div style={{ background:'var(--red-dim)', border:'1px solid rgba(247,89,89,0.3)', borderRadius:'var(--radius-sm)', padding:'10px', fontSize:'0.875rem', color:'var(--red)' }}>⚠️ {error}</div>}
            <p style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>Пароль будет сгенерирован автоматически</p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <Button variant="secondary" onClick={closeCreate}>Отмена</Button>
              <Button onClick={handleCreate}>+ Создать</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
