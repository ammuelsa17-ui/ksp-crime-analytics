import React, { useState } from 'react';
import { UserCheck, Shield, Radio, MapPin } from 'lucide-react';

export default function OfficerAvailabilityBoard() {
  const [officers] = useState([
    { badgeId: 'KSP-1001', name: 'Inspector K. S. Rao', rank: 'Inspector', district: 'Bengaluru Urban', station: 'Koramangala PS', status: 'Available', color: '#10B981', shift: 'Day Patrol' },
    { badgeId: 'KSP-1025', name: 'SI V. Kumar', rank: 'Sub-Inspector', district: 'Bengaluru Urban', station: 'HSR Layout PS', status: 'On Patrol', color: '#3B82F6', shift: 'Night Shift' },
    { badgeId: 'KSP-1037', name: 'Constable P. Ravi', rank: 'Constable', district: 'Mysuru', station: 'Devaraja PS', status: 'Busy', color: '#F59E0B', shift: 'Field Duty' },
    { badgeId: 'KSP-1040', name: 'SP M. Sharma', rank: 'Superintendent', district: 'Hubballi-Dharwad', station: 'District HQ', status: 'In Meeting', color: '#EF4444', shift: 'Executive' },
    { badgeId: 'KSP-1055', name: 'Constable S. Gowda', rank: 'Constable', district: 'Udupi', station: 'Town PS', status: 'Available', color: '#10B981', shift: 'Day Patrol' },
    { badgeId: 'KSP-1088', name: 'Inspector A. Patil', rank: 'Inspector', district: 'Belagavi', station: 'Central PS', status: 'On Patrol', color: '#3B82F6', shift: 'Night Shift' }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredOfficers = selectedFilter === 'All'
    ? officers
    : officers.filter(o => o.status === selectedFilter);

  return (
    <div className="analytics-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={18} color="var(--police-blue)" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Officer Availability &amp; Patrol Board
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['All', 'Available', 'On Patrol', 'Busy', 'In Meeting'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedFilter(st)}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '4px',
                border: selectedFilter === st ? '1px solid var(--police-blue)' : '1px solid var(--border-color)',
                backgroundColor: selectedFilter === st ? 'rgba(29, 78, 216, 0.15)' : 'transparent',
                color: selectedFilter === st ? 'var(--police-light)' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="crime-table" style={{ fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th>Badge ID</th>
              <th>Officer Name</th>
              <th>Rank</th>
              <th>District / Precinct</th>
              <th>Current Shift</th>
              <th>Roster Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfficers.map(o => (
              <tr key={o.badgeId}>
                <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{o.badgeId}</td>
                <td style={{ fontWeight: '600' }}>{o.name}</td>
                <td>{o.rank}</td>
                <td>{o.district} ({o.station})</td>
                <td>{o.shift}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: o.color, fontWeight: '700', fontSize: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: o.color }} />
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
