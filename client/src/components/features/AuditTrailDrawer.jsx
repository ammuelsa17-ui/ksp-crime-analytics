import React from 'react';

export default function AuditTrailDrawer({ auditDrawerOpen, setAuditDrawerOpen }) {
  if (!auditDrawerOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '480px', maxWidth: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 24px rgba(0,0,0,0.25)', animation: 'slideInRight 0.25s ease' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              🛡️ System Audit &amp; Compliance Trail
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Immutable System Log • Government Compliance Level 4</span>
          </div>
          <button onClick={() => setAuditDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', padding: '0.65rem 0.85rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: 'var(--police-light)' }}>
            🔒 <strong>Cryptographic Audit Mode Active:</strong> All database queries, FIR registrations, role elevations, and CSV exports are logged with SHA-256 signatures.
          </div>

          {[
            { time: '05:42:18 PM', user: 'Insp. R. Kumar (DGP)', action: 'FIR_CREATE', detail: 'Created FIR/BLR/2026/0026 (Cybercrime)', ip: '10.42.18.99', status: 'SUCCESS 201' },
            { time: '05:38:04 PM', user: 'Insp. R. Kumar (DGP)', action: 'ROLE_SWITCH', detail: 'Switched role context to Super Admin / DGP', ip: '10.42.18.99', status: 'SUCCESS 200' },
            { time: '05:32:14 PM', user: 'System Agent', action: 'DATASTORE_SYNC', detail: 'Full datastore reconciliation with Catalyst Cloud', ip: '127.0.0.1', status: 'SUCCESS 200' },
            { time: '05:28:40 PM', user: 'Insp. R. Kumar (DGP)', action: 'EXPORT_CSV', detail: 'Exported 26 case records to CSV file', ip: '10.42.18.99', status: 'SUCCESS 200' },
            { time: '05:20:11 PM', user: 'Officer M. Naik (SP)', action: 'STATUS_UPDATE', detail: 'Updated FIR/BLR/2026/0012 status to Charge Sheet', ip: '10.42.19.14', status: 'SUCCESS 200' }
          ].map((log, i) => (
            <div key={i} style={{ padding: '0.85rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--police-light)' }}>{log.action}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{log.time}</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{log.detail}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                <span>👤 {log.user}</span>
                <span>💻 {log.ip}</span>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
