import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Compass } from 'lucide-react';

export default function PredictiveCrimeForecast() {
  const forecasts = [
    { category: 'Cybercrime', trend: '+18%', isUp: true, risk: 'High', predictedSector: 'Bengaluru East / Koramangala' },
    { category: 'Online Fraud', trend: '+12%', isUp: true, risk: 'High', predictedSector: 'Mysuru Urban' },
    { category: 'Vehicle Theft', trend: '-5%', isUp: false, risk: 'Medium', predictedSector: 'Hubballi Transit Hub' },
    { category: 'Assault / Altercation', trend: '+4%', isUp: true, risk: 'Medium', predictedSector: 'Belagavi Central' }
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={20} color="var(--police-light)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              7-Day AI-Assisted Crime Trend Forecast
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AI-assisted analytics estimates district risk based on historical patterns, location, category, and configurable risk factors</span>
          </div>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--police-light)', background: 'rgba(56, 189, 248, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
          Powered by Zoho Catalyst AI Services
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {forecasts.map(item => (
          <div key={item.category} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.category}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '800', color: item.isUp ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {item.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {item.trend}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Hotspot Sector: <strong>{item.predictedSector}</strong>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Risk Level: <strong style={{ color: item.risk === 'High' ? 'var(--accent-red)' : 'var(--police-gold)' }}>{item.risk}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
