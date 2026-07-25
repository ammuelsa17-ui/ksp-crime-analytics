import React from 'react';
import { CheckCircle2, ShieldCheck, FileCode, Clock, Lock } from 'lucide-react';

export default function CaseTimelineAndChainOfCustody({ firNumber = 'FIR/BLR/2026/0010', caseStatus = 'Investigation Started' }) {
  const steps = [
    { label: 'FIR Registered', completed: true, time: '10:15 AM' },
    { label: 'Evidence Uploaded', completed: true, time: '10:42 AM' },
    { label: 'AI Analysis Completed', completed: true, time: '10:45 AM' },
    { label: 'Officer Assigned', completed: true, time: '11:00 AM' },
    { label: 'Investigation Started', completed: caseStatus !== 'FIR Registered', time: '11:30 AM' },
    { label: 'Charges Filed', completed: caseStatus === 'Charge Sheet Filed' || caseStatus === 'Case Closed', time: 'Pending' },
    { label: 'Case Closed', completed: caseStatus === 'Case Closed', time: 'Pending' }
  ];

  const evidenceLogs = [
    { fileName: 'FIR_Statement_Complainant.pdf', hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', uploadedBy: 'Inspector K. S. Rao', date: '2026-07-25 10:42:15', status: 'Tamper-Proof Ledger Verified' },
    { fileName: 'CCTV_Junction_Camera04.mp4', hash: 'sha256:7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', uploadedBy: 'SI V. Kumar', date: '2026-07-25 11:15:30', status: 'Cryptographic Hash Verified' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1rem 0' }}>
      {/* 1. Investigation Timeline Pipeline */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--police-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={16} />
          <span>Case Investigation Lifecycle Pipeline ({firNumber})</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.5rem', gap: '0.75rem' }}>
          {steps.map((step, idx) => (
            <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: '110px', textAlign: 'center' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: step.completed ? 'var(--accent-green)' : 'var(--bg-primary)',
                border: step.completed ? 'none' : '2px solid var(--border-color)',
                color: step.completed ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                marginBottom: '0.35rem'
              }}>
                {step.completed ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: step.completed ? '700' : '500', color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{step.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Chain of Custody & Cryptographic Hash Verification */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} />
            <span>Digital Evidence Chain of Custody (SHA-256 Ledger)</span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent-green)', background: 'rgba(22, 163, 74, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            🔒 Tamper-Proof Audit Enabled
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {evidenceLogs.map(item => (
            <div key={item.fileName} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileCode size={14} color="var(--police-light)" />
                  {item.fileName}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)', fontWeight: '700' }}>✓ {item.status}</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem', wordBreak: 'break-all' }}>
                HASH: {item.hash}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                <span>Uploaded By: <strong>{item.uploadedBy}</strong></span>
                <span>Timestamp: <strong>{item.date}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
