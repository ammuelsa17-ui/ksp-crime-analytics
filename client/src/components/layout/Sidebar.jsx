import React from 'react';

const getIcon = (id) => {
  switch (id) {
    case 'overview':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      );
    case 'records':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M3 15h10"/><path d="M3 18h10"/></svg>
      );
    case 'analytics':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      );
    case 'intelligence':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
      );
    case 'map':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
      );
    case 'admin':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      );
    default:
      return null;
  }
};

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  apiStatus,
  dbMode,
  casesCount,
  userRole
}) {
  const allNavItems = [
    { id: 'overview', label: 'Dashboard Overview', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'records', label: 'Case Registry', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'analytics', label: 'Operational Analytics', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'intelligence', label: 'Intelligence Desk', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'map', label: 'GIS Crime Map', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'admin', label: 'System Admin Console', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] }
  ];

  const navItems = allNavItems.filter(item => !userRole || item.roles.includes(userRole));

  return (
    <aside 
      className={`enterprise-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      style={{
        width: sidebarCollapsed ? '64px' : '260px',
        backgroundColor: 'var(--bg-sidebar)',
        color: 'var(--text-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        height: '100%',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxSizing: 'border-box'
      }}
    >
      {/* Branding Header */}
      <div 
        className="sidebar-branding" 
        style={{
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '0' : '0 1rem',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ display: 'flex', marginRight: sidebarCollapsed ? '0' : '0.75rem', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', tracking: '0.5px' }}>KSP COMMAND</span>
            <span style={{ fontSize: '0.65rem', color: '#F9A825', fontWeight: '700' }}>Crime Records Bureau</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ flexGrow: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-nav-btn ${isActive ? 'active-nav-item' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                opacity: 1
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sidebar-icon" style={{ display: 'flex', marginRight: sidebarCollapsed ? '0' : '0.85rem', flexShrink: 0 }}>
                {getIcon(item.id)}
              </span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Connection Status Section */}
      <div 
        className="sidebar-footer" 
        style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.7rem',
          boxSizing: 'border-box'
        }}
      >
        {!sidebarCollapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>API Status:</span>
              <span style={{
                color: apiStatus === 'Online' ? '#34D399' : '#F87171',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: apiStatus === 'Online' ? '#34D399' : '#F87171', display: 'inline-block' }}></span>
                {apiStatus}
              </span>
            </div>

            {dbMode === 'fallback' && (
              <div style={{ background: '#D97706', color: '#FFFFFF', padding: '0.35rem 0.5rem', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.62rem' }}>
                LOCAL DB FALLBACK ACTIVE
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: apiStatus === 'Online' ? '#34D399' : '#F87171',
                boxShadow: dbMode === 'fallback' ? '0 0 0 4px #D97706' : 'none'
              }}
              title={dbMode === 'fallback' ? 'API Online, Local DB Fallback Active' : `API status: ${apiStatus}`}
            />
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            marginTop: '0.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--text-sidebar)',
            borderRadius: '4px',
            padding: '0.4rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            fontWeight: '600'
          }}
        >
          {sidebarCollapsed ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem' }}><polyline points="15 18 9 12 15 6"/></svg>
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
