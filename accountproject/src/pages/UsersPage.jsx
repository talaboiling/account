// src/pages/UsersPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageHeader, Badge, Tabs, Modal, Input, Select, Button } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import '../styles/pages.css';

const ROLE_LABEL = { admin: 'Администратор', manager: 'Лаборант', client: 'Клиент' };
const ROLE_COLOR = { admin: 'blue', manager: 'purple', client: 'green' };

export default function UsersPage() {
  const store = useStore();
  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newUser,    setNewUser]    = useState({ name: '', email: '', phone: '', position: '', role: 'manager' });
  const [created,    setCreated]    = useState(null);
  const [error,      setError]      = useState('');

  const tabMap = { admin: 'admin', manager: 'manager', client: 'client' };

  const filtered = store.users.filter(u => {
    const matchRole   = tab === 'all' || u.role === tabMap[tab];
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all:     store.users.length,
    admin:   store.users.filter(u => u.role === 'admin').length,
    manager: store.users.filter(u => u.role === 'manager').length,
    client:  store.users.filter(u => u.role === 'client').length,
  };

  const set = k => e => setNewUser(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = () => {
    if (!newUser.name || !newUser.email) { setError('Заполните имя и email'); return; }
    if (store.users.find(u => u.email === newUser.email)) { setError('Email уже используется'); return; }
    const password = `Pass${Math.floor(1000 + Math.random() * 9000)}!`;
    const user = { id: uuidv4(), ...newUser, password, verified: true, createdAt: new Date().toISOString() };
    store.users.push(user);
    store.notify();
    setCreated({ ...user, password });
    setNewUser({ name: '', email: '', phone: '', position: '', role: 'manager' });
    setError('');
  };

  return (
    <div className="users-page">
      <PageHeader
        title="Пользователи"
        subtitle="Управление учётными записями системы"
        actions={<Button onClick={() => setShowCreate(true)}>+ Создать пользователя</Button>}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input className="search-bar" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Поиск по имени или email..." />
      </div>

      <Tabs
        tabs={[
          { id: 'all',     label: 'Все',              count: counts.all     },
          { id: 'admin',   label: 'Администраторы',   count: counts.admin   },
          { id: 'manager', label: 'Лаборанты',        count: counts.manager },
          { id: 'client',  label: 'Клиенты',          count: counts.client  },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="users-list">
        {filtered.length === 0 ? (
          <div className="users-list__empty">Пользователей не найдено</div>
        ) : filtered.map(u => (
          <div key={u.id} className="user-row">
            <div className="user-row__left">
              <div className="user-row__avatar">{u.name.charAt(0)}</div>
              <div>
                <div className="user-row__name">{u.name}</div>
                <div className="user-row__email">{u.email}</div>
                {u.position && <div className="user-row__position">{u.position}</div>}
              </div>
            </div>
            <div className="user-row__right">
              {u.phone && <span className="user-row__phone">{u.phone}</span>}
              <Badge color={ROLE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Badge>
              {u.role === 'client' && (
                <Badge color={u.verified ? 'green' : 'yellow'}>
                  {u.verified ? '✓ Верифицирован' : '⏳ Не верифицирован'}
                </Badge>
              )}
              <span className="user-row__date">
                {format(new Date(u.createdAt), 'd MMM yyyy', { locale: ru })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreated(null); setError(''); }}
        title="Создать пользователя">
        {created ? (
          <div className="create-user-success">
            <div className="create-user-success__banner">
              <div className="create-user-success__icon">✅</div>
              <div className="create-user-success__title">Пользователь создан!</div>
            </div>
            <div className="create-user-credentials">
              <div className="create-user-credentials__row">
                <span className="create-user-credentials__label">Email:</span>
                <strong className="create-user-credentials__value">{created.email}</strong>
              </div>
              <div className="create-user-credentials__row">
                <span className="create-user-credentials__label">Пароль:</span>
                <strong className="create-user-credentials__password">{created.password}</strong>
              </div>
            </div>
            <p className="create-user-hint" style={{ textAlign: 'center' }}>Сохраните и передайте данные пользователю!</p>
            <Button onClick={() => { setShowCreate(false); setCreated(null); }} className="btn--full">Закрыть</Button>
          </div>
        ) : (
          <div className="create-user-form">
            <Input label="ФИО *"       value={newUser.name}     onChange={set('name')}     placeholder="Иванов Иван Иванович" />
            <Input label="Email *"     type="email" value={newUser.email}    onChange={set('email')}    placeholder="user@lab.ru" />
            <Input label="Телефон"     type="tel"   value={newUser.phone}    onChange={set('phone')}    placeholder="+7..." />
            <Input label="Должность"              value={newUser.position} onChange={set('position')} placeholder="Старший лаборант" />
            <Select label="Роль"      value={newUser.role}     onChange={set('role')}     options={['admin', 'manager']} />
            {error && <div className="login-error">{error}</div>}
            <p className="create-user-hint">Пароль будет сгенерирован автоматически</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Отмена</Button>
              <Button onClick={handleCreate}>+ Создать</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
