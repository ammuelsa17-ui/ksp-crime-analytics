import React from 'react';
import { BrainCircuit, HelpCircle, ShieldAlert } from 'lucide-react';

export default function AIExplainabilityBox({ riskScore = 92 }) {
  const scoreFactors = [
    { factor: 'Nocturnal Incident Window (01:00 AM - 04:00 AM)', points: '+25 pts', category: 'Temporal Risk' },
    { factor: 'Hotspot Sector Proximity (Bengaluru Urban)', points: '+20 pts', category: 'Spatial Risk' },
    { factor: 'Modus Operandi Match (Repeat Offender Syndicate)', points: '+25 pts', category: 'Behavioral Risk' },
    { factor: 'High-Value Financial Fraud (Rs 2,40,000 via UPI)', points: '+12 pts', category: 'Economic Risk' },
    { factor: 'Vulnerable Victim Profile (Elderly Citizen)', points: '+10 pts', category: 'Demographic Risk' }
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={18} color="var(--police-gold)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Transparent AI Risk Score Breakdown ({riskScore}/100)
          </h3>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--police-gold)', background: 'rgba(217, 119, 6, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <HelpCircle size={12} />
          Explainable AI (XAI) Engine
        </span>
      </div>

      <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
        Why did the AI system compute a risk index of <strong>{riskScore}</strong>? Below is the weighted contribution breakdown:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {scoreFactors.map(item => (
          <div key={item.factor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              • {item.factor}
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
              {item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
