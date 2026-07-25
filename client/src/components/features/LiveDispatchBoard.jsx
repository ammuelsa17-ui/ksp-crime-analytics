import React, { useState } from 'react';
import { Radio, Navigation, Clock, AlertTriangle } from 'lucide-react';

export default function LiveDispatchBoard() {
  const [dispatches] = useState([
    { unit: 'Patrol Unit 21', sector: 'Koramangala 5th Block', status: 'Responding', eta: '4 min', priority: 'HIGH', fir: 'FIR/BLR/2026/0010' },
    { unit: 'Patrol Unit 08', sector: 'Indiranagar 100ft Rd', status: 'On Scene', eta: '0 min', priority: 'MEDIUM', fir: 'FIR/BLR/2026/0008' },
    { unit: 'Interceptor 03', sector: 'Hebbal Flyover Checkpost', status: 'En Route', eta: '7 min', priority: 'HIGH', fir: 'FIR/BLR/2026/0012' },
    { unit: 'Patrol Unit 14', sector: 'Devaraja Market Sector', status: 'Patrolling', eta: '12 min', priority: 'LOW', fir: 'FIR/MYS/2026/0042' }
  ]);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={20} color="var(--accent-red)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Control Room Live Dispatch Board
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Real-time field patrol dispatch status</span>
          </div>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--accent-green)', background: 'rgba(22, 163, 74, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
          ● LIVE TELEMETRY
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="crime-table" style={{ fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th>Patrol Unit</th>
              <th>Assigned Sector</th>
              <th>Dispatch Status</th>
              <th>ETA</th>
              <th>Priority</th>
              <th>Assigned Case</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map(d => (
              <tr key={d.unit}>
                <td style={{ fontWeight: '700', color: 'var(--police-light)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Navigation size={14} />
                    {d.unit}
                  </span>
                </td>
                <td>{d.sector}</td>
                <td>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: d.status === 'Responding' ? 'var(--accent-red)' : d.status === 'On Scene' ? 'var(--accent-green)' : 'var(--police-light)'
                  }}>
                    ● {d.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    {d.eta}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: d.priority === 'HIGH' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                    color: d.priority === 'HIGH' ? 'var(--accent-red)' : 'var(--police-gold)'
                  }}>
                    {d.priority}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace' }}>{d.fir}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
