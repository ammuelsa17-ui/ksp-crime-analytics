import React from 'react';

export default function StatCard({
  label,
  value,
  icon,
  subtext,
  subColor = 'gray',
  onClick,
  tooltip
}) {
  const getSubColor = () => {
    switch (subColor) {
      case 'green': return '#10B981';
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      case 'gold': return '#F59E0B';
      default: return 'var(--text-secondary)';
    }
  };

  const getSubBg = () => {
    switch (subColor) {
      case 'green': return 'rgba(16, 185, 129, 0.15)';
      case 'red': return 'rgba(239, 68, 68, 0.15)';
      case 'blue': return 'rgba(59, 130, 246, 0.15)';
      case 'gold': return 'rgba(245, 158, 11, 0.15)';
      default: return 'var(--bg-primary)';
    }
  };

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        padding: '1rem 1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        outline: 'none'
      }}
      title={tooltip}
    >
      <div 
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--police-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexGrow: 1, minWidth: 0 }}>
        <div 
          className="stat-label"
          style={{ 
            fontSize: '0.72rem', 
            fontWeight: '500', /* Reduced from 800 to 500 for better typographic hierarchy */
            color: 'var(--text-secondary)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            lineHeight: '1.2'
          }}
        >
          {label}
        </div>
        <div 
          className="stat-value"
          style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            fontFamily: 'monospace'
          }}
        >
          {value}
        </div>
        {subtext && (
          <div 
            className="stat-sub"
            style={{
              fontSize: '0.62rem',
              fontWeight: '600',
              color: getSubColor(),
              backgroundColor: getSubBg(),
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              width: 'fit-content',
              marginTop: '0.15rem',
              lineHeight: '1.2',
              fontFamily: 'monospace'
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
