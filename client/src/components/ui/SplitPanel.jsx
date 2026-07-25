import React from 'react';

export default function SplitPanel({
  caseItem,
  caseDetails,
  loadingDetails,
  onClose,
  onEdit,
  onDelete,
  onPrint,
  meta
}) {
  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: '#EF4444' };
      case 'Medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: '#F59E0B' };
      default: return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: '#10B981' };
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Closed': return { bg: 'var(--bg-primary)', text: 'var(--text-secondary)', border: 'var(--border-color)' };
      case 'Charge Sheet': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6' };
      default: return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: '#F59E0B' };
    }
  };

  const prio = getPriorityColor(meta.priority);
  const stat = getStatusColor(meta.status);

  return (
    <aside
      className="split-detail-panel"
      style={{
        width: '400px',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        boxSizing: 'border-box',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        animation: 'slideIn 200ms ease-out'
      }}
    >
      {/* Panel Header */}
      <header
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CASE FILE Reference</span>
          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--police-light)', fontFamily: 'monospace' }}>{caseItem.fir_number}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '4px',
            lineHeight: 1
          }}
          title="Close details drawer"
        >
          &times;
        </button>
      </header>

      {/* Panel Body */}
      <div 
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxSizing: 'border-box'
        }}
      >
        {/* Core Specs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>INCIDENT DATE</span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{caseItem.incident_date}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>PRECINCT</span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{caseItem.police_station}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>DISTRICT SECTOR</span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{caseItem.district}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>ASSIGNED OFFICER</span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{meta.officer}</span>
          </div>
        </div>

        {/* Badges Row */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: '800',
            backgroundColor: prio.bg,
            color: prio.text,
            border: `1px solid ${prio.border}`,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}>
            Priority: {meta.priority}
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: '800',
            backgroundColor: stat.bg,
            color: stat.text,
            border: `1px solid ${stat.border}`,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}>
            Status: {meta.status}
          </span>
        </div>

        {/* Description Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description Summary</span>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.45', whiteSpace: 'pre-wrap', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '4px' }}>
            {meta.cleanSummary}
          </p>
        </div>

        {/* Mapped Suspects and Victims */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Associated Suspects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--accent-red)', textTransform: 'uppercase' }}>
              Associated Suspects ({caseDetails?.accused?.length || 0})
            </span>
            {loadingDetails ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Loading suspect data...</span>
            ) : (!caseDetails?.accused || caseDetails.accused.length === 0) ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No suspects registered.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {caseDetails.accused.map((a, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', background: 'var(--bg-primary)', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{a.name} ({a.age}y)</span>
                    <span style={{ fontSize: '0.62rem', background: a.status === 'Arrested' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: a.status === 'Arrested' ? '#10B981' : '#F59E0B', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Victims */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--accent-green)', textTransform: 'uppercase' }}>
              Mapped Victims ({caseDetails?.victims?.length || 0})
            </span>
            {loadingDetails ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Loading victim profiles...</span>
            ) : (!caseDetails?.victims || caseDetails.victims.length === 0) ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No victim profiles mapped.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {caseDetails.victims.map((v, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', background: 'var(--bg-primary)', padding: '0.45rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{v.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{v.age}y • {v.gender}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Investigation timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--police-light)', textTransform: 'uppercase' }}>
              Case Diary Logs ({caseDetails?.investigations?.length || 0})
            </span>
            {loadingDetails ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Loading case diaries...</span>
            ) : (!caseDetails?.investigations || caseDetails.investigations.length === 0) ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No diary updates logged.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem', marginLeft: '0.2rem' }}>
                {caseDetails.investigations.map((log, i) => (
                  <div key={i} style={{ fontSize: '0.72rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.6rem', fontWeight: 'bold' }}>
                      <span style={{ fontFamily: 'monospace' }}>{log.last_updated || log.date}</span>
                      <span style={{ color: 'var(--police-light)' }}>{log.officer_name || log.officer}</span>
                    </div>
                    <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-primary)', lineHeight: '1.35' }}>{log.diary_entry || log.entry}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Panel Footer Actions */}
      <footer
        style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-primary)',
          boxSizing: 'border-box'
        }}
      >
        <button 
          onClick={onPrint} 
          style={{ flexGrow: 1, padding: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print FIR
        </button>
        <button 
          onClick={onEdit} 
          style={{ flexGrow: 1, padding: '0.5rem', border: 'none', background: 'var(--police-blue)', color: '#FFFFFF', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Edit Case
        </button>
        <button 
          onClick={onDelete} 
          style={{ flexGrow: 1, padding: '0.5rem', border: '1px solid var(--accent-red)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          Delete
        </button>
      </footer>
    </aside>
  );
}
