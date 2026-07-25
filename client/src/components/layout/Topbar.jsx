import React, { useState, useEffect } from 'react';

export default function Topbar({
  activeTab,
  notificationsOpen,
  setNotificationsOpen,
  profileMenuOpen,
  setProfileMenuOpen,
  theme,
  setTheme,
  onOpenCommandPalette,
  onSelectNotificationCase,
  userRole,
  setUserRole,
  onOpenAuditDrawer,
  demoMode,
  setDemoMode,
  authSession,
  onLogout,
  onGoBack,
  canGoBack
}) {
  const [time, setTime] = useState(new Date());
  const [notifCategory, setNotifCategory] = useState('All');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t) => t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (t) => t.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'records': return 'Case Registry';
      case 'analytics': return 'Operational Analytics';
      case 'intelligence': return 'Intelligence Desk';
      case 'map': return 'GIS Crime Map';
      case 'admin': return 'System Admin Console';
      default: return 'Command Console';
    }
  };

  const mockNotifications = [
    { id: 1, text: 'High Priority Assault reported — Bengaluru East', severity: 'Critical', category: 'Critical', time: '2m ago', fir: 'FIR/BLR/2026/0010' },
    { id: 2, text: 'Elevated Cybercrime activity detected in Mysuru', severity: 'Warning', category: 'Warnings', time: '18m ago', fir: 'FIR/MYS/2026/0042' },
    { id: 3, text: 'Charge sheet ready for audit — Hubballi', severity: 'Investigation', category: 'Investigations', time: '1h ago', fir: 'FIR/HUB/2026/0018' },
    { id: 4, text: 'Catalyst Datastore replica sync normal (12ms)', severity: 'Info', category: 'System', time: '2h ago', fir: null }
  ];

  const filteredNotifications = notifCategory === 'All' 
    ? mockNotifications 
    : mockNotifications.filter(n => n.category === notifCategory);

  return (
    <header
      className="enterprise-topbar"
      style={{
        height: '72px',
        maxHeight: '72px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxSizing: 'border-box',
        gap: '12px',
        flexWrap: 'nowrap'
      }}
    >
      {/* LEFT: Breadcrumb, Back Navigation & Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', flexShrink: 0 }}>
        {canGoBack && (
          <button
            onClick={onGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            title="Return to previous screen context"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
        )}
        <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>KSP HQ</span>
        <span style={{ color: 'var(--border-color)' }}>/</span>
        <span style={{ color: 'var(--police-light)', fontWeight: '700' }}>{getBreadcrumb()}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
          • {formatTime(time)} ({formatDate(time)})
        </span>
      </div>

      {/* CENTER: Compact Search Bar (280px max) */}
      <div 
        onClick={onOpenCommandPalette}
        style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          width: '280px',
          maxWidth: '280px',
          flexShrink: 1
        }}
        title="Open Command Search (Ctrl + K)"
      >
        <svg style={{ position: 'absolute', left: '10px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          placeholder="Command Search..." 
          readOnly
          style={{
            padding: '0.4rem 2.8rem 0.4rem 30px',
            fontSize: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            width: '100%',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        />
        <kbd style={{
          position: 'absolute',
          right: '8px',
          fontSize: '0.62rem',
          fontFamily: 'monospace',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '3px',
          padding: '1px 5px',
          color: 'var(--text-secondary)'
        }}>Ctrl K</kbd>
      </div>

      {/* RIGHT: Compact Icons & Officer Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        
        {/* Presentation Mode Toggle Pill */}
        <button
          onClick={() => setDemoMode && setDemoMode(!demoMode)}
          style={{
            background: demoMode ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-primary)',
            border: demoMode ? '1px solid var(--police-blue)' : '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.35rem 0.65rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: demoMode ? 'var(--police-light)' : 'var(--text-secondary)',
            fontSize: '0.72rem',
            fontWeight: '700'
          }}
          title="Toggle Judge Presentation Mode (Hides debug logs & amplifies presentation views)"
        >
          <span>📊</span>
          <span>{demoMode ? 'PRESENTATION MODE ON' : 'PRESENTATION MODE'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)'
          }}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Audit Button */}
        <button
          type="button"
          onClick={onOpenAuditDrawer}
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            color: 'var(--police-light)',
            padding: '0 0.65rem',
            height: '34px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Security Audit Log Drawer"
        >
          🛡️ Audit
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileMenuOpen(false);
            }}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Notification Center"
          >
            🔔
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#EF4444',
              color: '#FFF',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              fontSize: '0.58rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {mockNotifications.length}
            </span>
          </button>

          {notificationsOpen && (
            <div style={{ position: 'absolute', right: 0, top: '42px', width: '300px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Notification Center</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--police-light)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setNotificationsOpen(false)}>Close</span>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {mockNotifications.map(n => (
                  <div key={n.id} style={{ padding: '0.4rem', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{n.text}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Officer Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setProfileMenuOpen(!profileMenuOpen);
              setNotificationsOpen(false);
            }}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0 0.6rem',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--police-blue)', color: '#FFF', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              👤
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>
              {authSession?.user?.name ? authSession.user.name.split(' ')[0] + ' ' + authSession.user.name.split(' ')[1] : 'Insp. Kumar'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>▼</span>
          </button>

          {profileMenuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '42px', width: '240px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 100 }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{authSession?.user?.name || 'Insp. R. Kumar'}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--police-light)', fontWeight: 'bold' }}>Badge: {authSession?.user?.badgeId || 'KSP-2026-9041'}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Role: {authSession?.user?.role || userRole}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Station: {authSession?.user?.station || 'MG Road PS'}</span>
              </div>

              {/* Demo Mode & Role Switcher inside Dropdown */}
              <div style={{ padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#F59E0B' }}>⚡ Datathon Demo Mode:</span>
                  <button type="button" onClick={() => setDemoMode && setDemoMode(!demoMode)} style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '3px', border: 'none', background: demoMode ? '#F59E0B' : 'var(--border-color)', color: '#FFF', cursor: 'pointer' }}>
                    {demoMode ? 'ON' : 'OFF'}
                  </button>
                </div>
                {demoMode && (
                  <select
                    value={userRole || 'Inspector'}
                    onChange={(e) => setUserRole && setUserRole(e.target.value)}
                    style={{ width: '100%', padding: '0.25rem', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 'bold' }}
                  >
                    <option value="DGP">👑 Super Admin / DGP</option>
                    <option value="SP">🎖️ District SP</option>
                    <option value="Inspector">👮 Inspector (CRB)</option>
                    <option value="Constable">🛡️ Field Constable</option>
                    <option value="Operator">📝 Data Entry Operator</option>
                  </select>
                )}
              </div>

              <button onClick={onLogout} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}>
                🔒 Secure Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
