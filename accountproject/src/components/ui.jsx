// src/components/ui.jsx
import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style, className = '' }) {
  const base = { display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:'var(--font-body)', fontWeight:600, borderRadius:'var(--radius-sm)', border:'none', cursor: disabled ? 'not-allowed' : 'pointer', transition:'all var(--transition)', opacity: disabled ? 0.5 : 1, whiteSpace:'nowrap' };
  const sizes = { sm:{ padding:'6px 12px', fontSize:'0.8rem' }, md:{ padding:'9px 18px', fontSize:'0.875rem' }, lg:{ padding:'12px 24px', fontSize:'1rem' } };
  const variants = {
    primary: { background:'var(--accent)', color:'#fff' },
    secondary: { background:'var(--bg-card2)', color:'var(--text)', border:'1px solid var(--border)' },
    danger: { background:'var(--red-dim)', color:'var(--red)', border:'1px solid rgba(247,89,89,0.3)' },
    success: { background:'var(--green-dim)', color:'var(--green)', border:'1px solid rgba(60,201,138,0.3)' },
    ghost: { background:'transparent', color:'var(--text-sub)', border:'1px solid var(--border)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }} className={className}>
      {children}
    </button>
  );
}

export function Badge({ children, color = 'default', style }) {
  const colors = {
    default: { bg:'var(--bg-card2)', color:'var(--text-sub)' },
    blue: { bg:'var(--accent-dim)', color:'var(--accent)' },
    green: { bg:'var(--green-dim)', color:'var(--green)' },
    yellow: { bg:'var(--yellow-dim)', color:'var(--yellow)' },
    red: { bg:'var(--red-dim)', color:'var(--red)' },
    purple: { bg:'var(--purple-dim)', color:'var(--purple)' },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, background:c.bg, color:c.color, ...style }}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = { pending:{label:'На рассмотрении',color:'yellow'}, signed:{label:'Подписана',color:'green'}, rejected:{label:'Отклонена',color:'red'} };
  const { label, color } = map[status] || { label: status, color: 'default' };
  return <Badge color={color}>{label}</Badge>;
}

export function Card({ children, style, onClick, hoverable }) {
  return (
    <div onClick={onClick} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px', transition:'all var(--transition)', cursor: onClick ? 'pointer' : 'default', ...(hoverable || onClick ? { ':hover':{ background:'var(--bg-hover)' } } : {}), ...style }}>
      {children}
    </div>
  );
}

export function Input({ label, id, error, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', ...style }}>
      {label && <label htmlFor={id} style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-sub)', letterSpacing:'0.03em', textTransform:'uppercase' }}>{label}</label>}
      <input id={id} {...props} style={{ background:'var(--bg-card2)', border:`1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)', fontSize:'0.9rem', outline:'none', transition:'border-color var(--transition)', width:'100%' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor=error?'var(--red)':'var(--border)'} />
      {error && <span style={{ fontSize:'0.78rem', color:'var(--red)' }}>{error}</span>}
    </div>
  );
}

export function Select({ label, id, options = [], error, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', ...style }}>
      {label && <label htmlFor={id} style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-sub)', letterSpacing:'0.03em', textTransform:'uppercase' }}>{label}</label>}
      <select id={id} {...props} style={{ background:'var(--bg-card2)', border:`1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)', fontSize:'0.9rem', outline:'none', width:'100%', cursor:'pointer' }}>
        <option value="">— Выберите —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <span style={{ fontSize:'0.78rem', color:'var(--red)' }}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, id, error, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', ...style }}>
      {label && <label htmlFor={id} style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-sub)', letterSpacing:'0.03em', textTransform:'uppercase' }}>{label}</label>}
      <textarea id={id} {...props} style={{ background:'var(--bg-card2)', border:`1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)', fontSize:'0.9rem', outline:'none', resize:'vertical', minHeight:'90px', width:'100%' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor=error?'var(--red)':'var(--border)'} />
      {error && <span style={{ fontSize:'0.78rem', color:'var(--red)' }}>{error}</span>}
    </div>
  );
}

export function Divider({ style }) {
  return <div style={{ height:'1px', background:'var(--border)', margin:'4px 0', ...style }} />;
}

export function Spinner() {
  return <div style={{ width:'20px', height:'20px', border:'2px solid var(--border)', borderTop:'2px solid var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-sub)' }}>
      <div style={{ fontSize:'3rem', marginBottom:'12px' }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-main)', fontWeight:700, fontSize:'1.1rem', color:'var(--text)', marginBottom:'6px' }}>{title}</div>
      {subtitle && <div style={{ fontSize:'0.875rem' }}>{subtitle}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:width, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow)', animation:'fadeIn 0.2s ease' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontFamily:'var(--font-main)', fontSize:'1.05rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-sub)', fontSize:'1.3rem', cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  );
}

export function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ padding:'10px 14px', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={{ borderBottom:'1px solid var(--border)', transition:'background var(--transition)', cursor: onRowClick ? 'pointer' : 'default' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              {columns.map(col => (
                <td key={col.key} style={{ padding:'12px 14px', fontSize:'0.875rem', color:'var(--text)' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:'4px', borderBottom:'1px solid var(--border)', marginBottom:'20px' }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{ background:'none', border:'none', padding:'10px 16px', fontSize:'0.875rem', fontWeight: active===tab.id ? 700 : 400, color: active===tab.id ? 'var(--accent)' : 'var(--text-sub)', borderBottom: active===tab.id ? '2px solid var(--accent)' : '2px solid transparent', cursor:'pointer', transition:'all var(--transition)', display:'flex', alignItems:'center', gap:'6px' }}>
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && <Badge color={active===tab.id ? 'blue' : 'default'}>{tab.count}</Badge>}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', gap:'12px', flexWrap:'wrap' }}>
      <div>
        <h1 style={{ fontSize:'1.5rem', fontFamily:'var(--font-main)', marginBottom:'4px' }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--text-sub)', fontSize:'0.875rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>{actions}</div>}
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div style={{ display:'flex', gap:'12px', padding:'8px 0', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
      <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.03em', minWidth:'160px', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:'0.875rem', color:'var(--text)', flex:1, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{value || '—'}</span>
    </div>
  );
}
