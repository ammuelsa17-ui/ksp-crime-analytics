import React, { useState } from 'react';
import { BrainCircuit, CheckSquare, Square, Zap, ShieldAlert } from 'lucide-react';

export default function AIRecommendationsPanel({ confidence = 94, onActionToggle }) {
  const [recommendations, setRecommendations] = useState([
    { id: 1, text: 'Issue dynamic freeze notice on beneficiary bank account via NPCI gateway', checked: true, urgency: 'Critical' },
    { id: 2, text: 'Obtain IP transaction logs and ISP subscriber details', checked: true, urgency: 'High' },
    { id: 3, text: 'Cross-reference recipient UPI VPA with national cybercrime portal', checked: false, urgency: 'High' },
    { id: 4, text: 'Dispatch night patrol unit to Koramangala 5th Block sector hotspot', checked: false, urgency: 'Medium' },
    { id: 5, text: 'Issue inter-district lookout advisory for Ramesh Kumar syndicate alias Ranga Bikers', checked: false, urgency: 'High' }
  ]);

  const handleToggle = (id) => {
    setRecommendations(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    if (onActionToggle) onActionToggle(id);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
      {/* Header with AI Confidence Meter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={20} color="var(--police-blue)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Catalyst AI Investigation Assistant
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Powered by <strong>Zoho Catalyst AI Services</strong> — AI-assisted Link Analysis &amp; Recommendations</span>
          </div>
        </div>

        {/* Confidence Meter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>AI Confidence:</span>
          <div style={{ width: '100px', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${confidence}%`, height: '100%', backgroundColor: confidence >= 90 ? 'var(--accent-green)' : 'var(--police-gold)' }} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: confidence >= 90 ? 'var(--accent-green)' : 'var(--police-gold)' }}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* Action Checkbox List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
              border: item.checked ? '1px solid var(--police-blue)' : '1px solid var(--border-color)',
              backgroundColor: item.checked ? 'rgba(29, 78, 216, 0.08)' : 'var(--bg-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {item.checked ? <CheckSquare size={16} color="var(--police-blue)" /> : <Square size={16} color="var(--text-muted)" />}
              <span style={{ fontWeight: item.checked ? '700' : '500', textDecoration: item.checked ? 'line-through' : 'none', opacity: item.checked ? 0.75 : 1 }}>
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
    </div>
  );
}
