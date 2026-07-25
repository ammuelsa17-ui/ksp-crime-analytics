import React, { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle2, Server, Database, Cpu, Wifi } from 'lucide-react';

export default function CommandMonitorRibbon({ onEmergencyToggle }) {
  const [emergencyMode, setEmergencyMode] = useState(false);

  const handleToggle = () => {
    const nextState = !emergencyMode;
    setEmergencyMode(nextState);
    if (onEmergencyToggle) onEmergencyToggle(nextState);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0 0 1rem 0' }}>
      {/* 1. Emergency Response Mode Banner */}
      {emergencyMode && (
        <div style={{
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontWeight: '800',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={20} />
            <span>🚨 EMERGENCY RESPONSE MODE ACTIVATED — PRIORITY DISPATCH ENFORCED</span>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            STATEWIDE RED ALERT
          </span>
        </div>
      )}

      {/* 2. Command Center Monitor Ribbon */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.65rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.75rem'
      }}>
        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Wifi size={14} color="var(--accent-green)" />
            <span style={{ color: 'var(--text-muted)' }}>API:</span>
            <strong style={{ color: 'var(--accent-green)' }}>ONLINE</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cpu size={14} color="var(--police-light)" />
            <span style={{ color: 'var(--text-muted)' }}>AI Gateway:</span>
            <strong style={{ color: 'var(--police-light)' }}>CONNECTED</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Server size={14} color="var(--accent-green)" />
            <span style={{ color: 'var(--text-muted)' }}>Catalyst Cloud:</span>
            <strong style={{ color: 'var(--accent-green)' }}>ONLINE</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database size={14} color="var(--accent-green)" />
            <span style={{ color: 'var(--text-muted)' }}>Database:</span>
            <strong style={{ color: 'var(--accent-green)' }}>SYNCED (12ms)</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} color="var(--accent-green)" />
            <span style={{ color: 'var(--text-muted)' }}>GIS Radar:</span>
            <strong style={{ color: 'var(--accent-green)' }}>ACTIVE</strong>
          </div>
        </div>

        {/* Emergency Mode Toggle Button */}
        <button
          onClick={handleToggle}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            border: emergencyMode ? '1px solid #DC2626' : '1px solid var(--border-color)',
            backgroundColor: emergencyMode ? '#DC2626' : 'var(--bg-card)',
            color: emergencyMode ? '#FFFFFF' : 'var(--accent-red)',
            fontWeight: '800',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <ShieldAlert size={14} />
          {emergencyMode ? 'DEACTIVATE EMERGENCY MODE' : 'ACTIVATE EMERGENCY MODE'}
        </button>
      </div>
    </div>
  );
}
