// src/pages/ProgramsPage.jsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui';

export default function ProgramsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [hover, setHover] = useState(null);

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <PageHeader title="Программы обследований" subtitle="Выберите программу для подачи заявки. Форма заявки зависит от выбранной программы." />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px' }}>
        {store.programs.map((prog, i) => (
          <div key={prog.id} onClick={() => navigate(`/programs/${prog.id}/apply`)}
            onMouseEnter={() => setHover(prog.id)}
            onMouseLeave={() => setHover(null)}
            style={{ background: hover === prog.id ? 'var(--bg-hover)' : 'var(--bg-card)', border: hover === prog.id ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px', cursor:'pointer', transition:'all var(--transition)', animation:`fadeIn 0.3s ease ${i*0.04}s both`, display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px' }}>
              <div style={{ width:'44px', height:'44px', background: hover === prog.id ? 'var(--accent-dim)' : 'var(--bg-card2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', transition:'background var(--transition)', flexShrink:0 }}>
                {prog.icon}
              </div>
              <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-dim)', background:'var(--bg-card2)', padding:'3px 8px', borderRadius:'20px', fontFamily:'var(--font-main)' }}>{prog.code}</span>
            </div>
            <div>
              <h3 style={{ fontFamily:'var(--font-main)', fontWeight:700, fontSize:'0.95rem', lineHeight:1.4, marginBottom:'4px', color: hover === prog.id ? 'var(--accent)' : 'var(--text)', transition:'color var(--transition)' }}>{prog.name}</h3>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.8rem', color: hover === prog.id ? 'var(--accent)' : 'var(--text-sub)', fontWeight:600, marginTop:'auto', transition:'color var(--transition)' }}>
              Подать заявку →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
