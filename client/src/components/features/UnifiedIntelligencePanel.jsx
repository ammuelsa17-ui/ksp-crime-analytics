import React, { useState } from 'react';
import { BrainCircuit, CheckSquare, Square, ShieldCheck, Clock, AlertTriangle, FileText, Share2 } from 'lucide-react';

export default function UnifiedIntelligencePanel({ firNumber = 'FIR/BLR/2026/0010', confidence = 94 }) {
  const [activeSubTab, setActiveSubTab] = useState('recommendations');
  const [recommendations, setRecommendations] = useState([
    { id: 1, text: 'Issue dynamic freeze notice on beneficiary bank account via NPCI gateway', checked: true, urgency: 'Critical' },
    { id: 2, text: 'Obtain IP transaction logs and ISP subscriber details', checked: true, urgency: 'High' },
    { id: 3, text: 'Cross-reference recipient UPI VPA with national cybercrime portal', checked: false, urgency: 'High' },
    { id: 4, text: 'Dispatch night patrol unit to Koramangala 5th Block sector hotspot', checked: false, urgency: 'Medium' }
  ]);

  const handleToggle = (id) => {
    setRecommendations(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
      {/* 1. Header with Zoho Catalyst AI Branding */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <BrainCircuit size={22} color="var(--police-blue)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
              INVESTIGATION INTELLIGENCE REPORT
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Official Police Intelligence &amp; BNS Legal Advisory — Case Ref: {firNumber}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>AI Confidence:</span>
          <div style={{ width: '80px', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${confidence}%`, height: '100%', backgroundColor: 'var(--accent-green)' }} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-green)' }}>{confidence}%</span>
        </div>
      </div>

      {/* 2. Unified Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { id: 'recommendations', label: 'Tactical Recommendations' },
          { id: 'xai', label: 'XAI Risk Breakdown (92/100)' },
          { id: 'bns', label: 'Applicable BNS Sections' },
          { id: 'links', label: 'Similar Criminal Cases' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              border: activeSubTab === tab.id ? '1px solid var(--police-blue)' : '1px solid transparent',
              backgroundColor: activeSubTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeSubTab === tab.id ? 'var(--police-light)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Sub-Tab Content Viewports */}
      {activeSubTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recommendations.map(item => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: item.checked ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {item.checked ? <CheckSquare size={16} color="var(--police-blue)" /> : <Square size={16} color="var(--text-muted)" />}
                <span style={{ fontWeight: item.checked ? '700' : '500', opacity: item.checked ? 0.8 : 1 }}>
                  {item.text}
                </span>
              </div>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '800',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: item.urgency === 'Critical' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                color: item.urgency === 'Critical' ? 'var(--accent-red)' : 'var(--police-gold)'
              }}>
                {item.urgency}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'bns' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem' }}>
            <div style={{ fontWeight: '800', color: 'var(--police-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              BNS Section 318
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
              Cheating by Personation &amp; Financial Fraud
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Replaces legacy IPC 420. Applicable for phishing &amp; imposter UPI transfers.
            </div>
          </div>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem' }}>
            <div style={{ fontWeight: '800', color: 'var(--police-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              IT Act Section 66D
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
              Punishment for Cheating by Computer Resource
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Applicable for fraudulent digital links and spoofed mobile apps.
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'xai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { factor: 'Nocturnal Incident Window (01:00 AM - 04:00 AM)', pts: '+25 pts' },
            { factor: 'Hotspot Sector Proximity (Bengaluru Urban)', pts: '+20 pts' },
            { factor: 'Modus Operandi Match (Repeat Offender Syndicate)', pts: '+25 pts' },
            { factor: 'High-Value Financial Fraud (Rs 2,40,000 via UPI)', pts: '+12 pts' },
            { factor: 'Vulnerable Victim Profile (Elderly Citizen)', pts: '+10 pts' }
          ].map(f => (
            <div key={f.factor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>• {f.factor}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--accent-red)' }}>{f.pts}</span>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'links' && (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '800', color: 'var(--police-light)' }}>Criminal Link Match Identified</span>
            <span style={{ fontWeight: '800', color: 'var(--accent-green)' }}>91% MO Similarity</span>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            Common attributes detected with <strong>FIR/MYS/2026/0042</strong> (Ramesh Kumar Syndicate alias Ranga Bikers). Matching night timing, spoofed UPI VPA, and escape vector.
          </p>
        </div>
      )}
    </div>
  );
}
