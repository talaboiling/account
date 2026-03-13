// src/pages/DashboardPage.jsx
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, StatusBadge, Button } from '../components/ui';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function StatCard({ icon, label, value, color = 'var(--accent)', sub }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px', display:'flex', flexDirection:'column', gap:'8px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'1.4rem' }}>{icon}</span>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:color }} />
      </div>
      <div style={{ fontSize:'2rem', fontFamily:'var(--font-main)', fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:'0.8rem', color:'var(--text-sub)', fontWeight:600 }}>{label}</div>
      {sub && <div style={{ fontSize:'0.75rem', color:'var(--text-dim)' }}>{sub}</div>}
    </div>
  );
}

function RecentAppRow({ app, store, onClick }) {
  const client = store.getUserById(app.clientId);
  const program = store.getProgramById(app.programId);
  const manager = store.getUserById(app.assignedManagerId);
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--bg-card2)', cursor:'pointer', transition:'background var(--transition)', gap:'10px', flexWrap:'wrap' }}
      onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background='var(--bg-card2)'}>
      <div style={{ display:'flex', flexDirection:'column', gap:'2px', flex:1, minWidth:0 }}>
        <span style={{ fontSize:'0.75rem', color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-main)' }}>{app.sampleCode}</span>
        <span style={{ fontSize:'0.875rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{program?.name}</span>
        {client && <span style={{ fontSize:'0.78rem', color:'var(--text-sub)' }}>{client.name}</span>}
      </div>
      <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
        {manager && <Badge color="purple">{manager.name.split(' ')[0]}</Badge>}
        <StatusBadge status={app.status} />
        <span style={{ fontSize:'0.75rem', color:'var(--text-dim)', whiteSpace:'nowrap' }}>
          {format(new Date(app.createdAt), 'd MMM yyyy', { locale: ru })}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const store = useStore();
  const user = store.currentUser;
  const navigate = useNavigate();

  const allApps = store.getAllApplications();
  const userApps = user.role === 'client' ? store.getApplicationsForClient(user.id) : user.role === 'manager' ? store.getApplicationsForManager(user.id) : allApps;
  const unread = store.getUnreadCount(user.id);
  const recentApps = userApps.slice(0, 5);

  const pending = allApps.filter(a => a.status === 'pending').length;
  const signed = allApps.filter(a => a.status === 'signed').length;
  const protocols = store.protocols.length;
  const results = store.results.length;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'1.6rem', fontFamily:'var(--font-main)', fontWeight:800 }}>{greet()}, {user.name.split(' ')[1] || user.name.split(' ')[0]}! 👋</h1>
        <p style={{ color:'var(--text-sub)', marginTop:'4px' }}>{new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      {/* Stats grid */}
      {user.role === 'admin' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'14px', marginBottom:'28px' }}>
          <StatCard icon="📋" label="Всего заявок" value={allApps.length} color="var(--accent)" />
          <StatCard icon="⏳" label="На рассмотрении" value={pending} color="var(--yellow)" sub={`${Math.round(pending/Math.max(allApps.length,1)*100)}% от всех`} />
          <StatCard icon="✅" label="Подписанных" value={signed} color="var(--green)" />
          <StatCard icon="🧪" label="Протоколов" value={protocols} color="var(--purple)" />
          <StatCard icon="📄" label="Заключений" value={results} color="var(--accent)" />
          <StatCard icon="🔔" label="Уведомлений" value={unread} color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} sub="непрочитанных" />
        </div>
      )}

      {user.role === 'manager' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'14px', marginBottom:'28px' }}>
          <StatCard icon="📋" label="Мои заявки" value={store.getApplicationsForManager(user.id).filter(a=>a.assignedManagerId===user.id).length} color="var(--accent)" />
          <StatCard icon="⏳" label="Ожидают действий" value={store.getApplicationsForManager(user.id).filter(a=>a.status==='pending').length} color="var(--yellow)" />
          <StatCard icon="🧪" label="Мои протоколы" value={store.protocols.filter(p=>p.managerId===user.id).length} color="var(--purple)" />
          <StatCard icon="🔔" label="Непрочитанных" value={unread} color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} />
        </div>
      )}

      {user.role === 'client' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'14px', marginBottom:'28px' }}>
            <StatCard icon="📋" label="Мои заявки" value={userApps.length} color="var(--accent)" />
            <StatCard icon="⏳" label="На рассмотрении" value={userApps.filter(a=>a.status==='pending').length} color="var(--yellow)" />
            <StatCard icon="✅" label="Подписанных" value={userApps.filter(a=>a.status==='signed').length} color="var(--green)" />
            <StatCard icon="🔔" label="Уведомлений" value={unread} color={unread > 0 ? 'var(--red)' : 'var(--text-sub)'} />
          </div>
          <div style={{ background:'linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(60,201,138,0.1) 100%)', border:'1px solid rgba(79,142,247,0.3)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h3 style={{ fontFamily:'var(--font-main)', fontWeight:800, fontSize:'1.15rem', marginBottom:'6px' }}>Подать новую заявку</h3>
              <p style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>Выберите программу и заполните форму — это займёт несколько минут</p>
            </div>
            <Button onClick={() => navigate('/programs')} size="lg">🔬 Выбрать программу</Button>
          </div>
        </>
      )}

      {/* Recent applications */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <h3 style={{ fontFamily:'var(--font-main)', fontWeight:700 }}>
            {user.role === 'client' ? 'Мои последние заявки' : 'Последние заявки'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>Все заявки →</Button>
        </div>
        {recentApps.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px', color:'var(--text-sub)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>📭</div>
            <div style={{ fontWeight:600 }}>Заявок пока нет</div>
            {user.role === 'client' && <Button onClick={() => navigate('/programs')} style={{ marginTop:'12px' }}>Подать первую заявку</Button>}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {recentApps.map(app => (
              <RecentAppRow key={app.id} app={app} store={store} onClick={() => navigate(`/applications/${app.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
