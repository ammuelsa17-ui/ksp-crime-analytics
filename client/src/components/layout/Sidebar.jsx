import React from 'react';
import { 
  ShieldIcon, 
  BadgeCheckIcon, 
  FileTextIcon, 
  ChartColumnIcon, 
  BrainCircuitIcon, 
  MapPinnedIcon, 
  SettingsIcon, 
  ActivityIcon
} from '../common/PoliceIcons';

const getIcon = (id) => {
  switch (id) {
    case 'overview':
      return <ShieldIcon size={18} />;
    case 'records':
      return <FileTextIcon size={18} />;
    case 'analytics':
      return <ChartColumnIcon size={18} />;
    case 'intelligence':
      return <BrainCircuitIcon size={18} />;
    case 'map':
      return <MapPinnedIcon size={18} />;
    case 'admin':
      return <SettingsIcon size={18} />;
    default:
      return <ActivityIcon size={18} />;
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
    { id: 'overview', label: 'Dashboard', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'records', label: 'Case Registry', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'intelligence', label: 'Intelligence Desk', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'map', label: 'GIS Command Radar', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'analytics', label: 'Operational Analytics', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] },
    { id: 'admin', label: 'Administration', roles: ['DGP', 'SP', 'Inspector', 'Constable', 'Operator'] }
  ];

  const navItems = allNavItems.filter(item => !userRole || item.roles.includes(userRole));

  return (
    <aside 
      className={`enterprise-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      style={{
        width: sidebarCollapsed ? '60px' : '220px',
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
                padding: '0.65rem 0.85rem',
                borderRadius: '4px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--police-blue)' : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: isActive ? 'var(--police-light)' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 150ms ease',
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
