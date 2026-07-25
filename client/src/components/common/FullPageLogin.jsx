import React, { useState } from 'react';
import { ShieldIcon, BadgeCheckIcon } from './PoliceIcons';

const KSPEmblem = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
    <path d="M 50,5 Q 90,20 85,60 Q 80,90 50,95 Q 20,90 15,60 Q 10,20 50,5 Z" fill="#0B1220" stroke="#F59E0B" strokeWidth="4" />
    <path d="M 50,9 Q 86,22 81,58 Q 77,86 50,91 Q 23,86 19,58 Q 14,22 50,9 Z" fill="#1D4ED8" />
    <path d="M 30,25 L 70,25" stroke="#FF9933" strokeWidth="3" />
    <path d="M 30,28 L 70,28" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M 30,31 L 70,31" stroke="#128807" strokeWidth="3" />
    <path d="M 50,38 L 42,48 L 47,58 L 53,58 L 58,48 Z" fill="#F59E0B" />
    <path d="M 42,48 L 28,45 L 35,55 L 47,58 Z" fill="#F59E0B" opacity="0.9" />
    <path d="M 58,48 L 72,45 L 65,55 L 53,58 Z" fill="#F59E0B" opacity="0.9" />
    <circle cx="50" cy="48" r="5" fill="none" stroke="#000080" strokeWidth="1" />
    <rect x="25" y="70" width="50" height="12" rx="3" fill="#F59E0B" />
    <text x="50" y="79" fill="#0B1220" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">K.S.P.</text>
  </svg>
);

export default function FullPageLogin({ onLogin }) {
  const [officerId, setOfficerId] = useState('DGP-BLR-001');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('DGP');
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState('');

  const handleAuthSequence = (roleToUse, idToUse) => {
    setLoading(true);
    setAuthStep('✔ Verifying Officer Badge ID...');
    
    setTimeout(() => {
      setAuthStep('✔ Validating Catalyst SAML Authentication...');
    }, 450);

    setTimeout(() => {
      setAuthStep('✔ Loading Role Permissions & RBAC Token...');
    }, 900);

    setTimeout(() => {
      setAuthStep('✔ Initializing Command Console Telemetry...');
    }, 1350);

    setTimeout(() => {
      onLogin(roleToUse, idToUse);
      setLoading(false);
    }, 1800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuthSequence(selectedRole, officerId);
  };

  const handleDemoSelect = (role, defaultId) => {
    setSelectedRole(role);
    setOfficerId(defaultId);
    handleAuthSequence(role, defaultId);
  };

  return (
    <div 
      className="enterprise-login-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: '#0B1220',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Decorative Shield Watermark */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.03,
          pointerEvents: 'none'
        }}
      >
        <ShieldIcon size={640} color="#1D4ED8" />
      </div>

      {/* Main Login Box (Wider Desktop Ratio) */}
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#1B2638',
          border: '1px solid #2D3748',
          borderRadius: '12px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}
      >
        {/* Left Panel: Official Government Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', borderRight: '1px solid #2D3748', paddingRight: '1.5rem' }}>
          <KSPEmblem />
          <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#D97706', marginTop: '1rem' }}>
            Government of Karnataka
          </div>
          <h1 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px', color: '#F8FAFC', lineHeight: '1.3' }}>
            Karnataka State Police
          </h1>
          <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '700', lineHeight: '1.4', marginBottom: '1.25rem' }}>
            IntelliCase — Crime Intelligence &amp; Investigation Platform
          </div>

          <div style={{ background: '#0B1220', border: '1px solid #2D3748', borderRadius: '6px', padding: '0.85rem 1rem', fontSize: '0.74rem', color: '#CBD5E1', lineHeight: '1.5', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontWeight: '700', color: '#38BDF8', marginBottom: '0.25rem' }}>Authorized Personnel Only</div>
            Secure statewide command console access. Powered by <strong>Zoho Catalyst Authentication Services</strong>.
          </div>
        </div>

        {/* Right Panel: Secure Officer Login Form */}
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Officer ID / Badge Number
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}>
                  <ShieldIcon size={16} color="#64748B" />
                </span>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 38px',
                    borderRadius: '6px',
                    border: '1px solid #2D3748',
                    backgroundColor: '#0B1220',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}>
                  <BadgeCheckIcon size={16} color="#64748B" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 38px',
                    borderRadius: '6px',
                    border: '1px solid #2D3748',
                    backgroundColor: '#0B1220',
                    color: '#F8FAFC',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ background: '#0B1220', border: '1px solid #1D4ED8', borderRadius: '6px', padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#60A5FA', fontWeight: '700' }}>
                {authStep}
              </div>
            ) : (
              <button
                type="submit"
                style={{
                  marginTop: '0.25rem',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#1D4ED8',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Access Command Center
              </button>
            )}
          </form>

          {/* Quick Demo Role Selection */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #2D3748', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', marginBottom: '0.6rem' }}>
              Quick Demo Role Access
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {[
                { role: 'DGP', label: 'Director General (DGP)', id: 'DGP-BLR-001' },
                { role: 'SP', label: 'Superintendent (SP)', id: 'SP-MYS-042' },
                { role: 'Inspector', label: 'Inspector', id: 'INS-HUB-018' },
                { role: 'Constable', label: 'Constable', id: 'CON-UDU-099' },
                { role: 'Operator', label: 'Control Room', id: 'OPR-KSP-007' }
              ].map(item => (
                <button
                  key={item.role}
                  disabled={loading}
                  onClick={() => handleDemoSelect(item.role, item.id)}
                  style={{
                    padding: '0.3rem 0.55rem',
                    borderRadius: '4px',
                    border: selectedRole === item.role ? '1px solid #1D4ED8' : '1px solid #2D3748',
                    backgroundColor: selectedRole === item.role ? 'rgba(29, 78, 216, 0.2)' : '#0B1220',
                    color: selectedRole === item.role ? '#60A5FA' : '#CBD5E1',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Enterprise Footer */}
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.72rem', color: '#64748B', lineHeight: '1.5' }}>
        <div>Government of Karnataka — Karnataka State Police Command Portal</div>
        <div>Powered by Zoho Catalyst AI Assisted Investigation Platform | Version 1.0</div>
      </div>
    </div>
  );
}
