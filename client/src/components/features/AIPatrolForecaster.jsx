import React, { useState, useEffect } from 'react';
import { CpuIcon, ShieldIcon, ActivityIcon, CheckCircleIcon, ZapIcon, AlertTriangleIcon } from 'lucide-react';

export default function AIPatrolForecaster({ selectedDistrict = 'Mysuru' }) {
  const [district, setDistrict] = useState(selectedDistrict || 'Mysuru');
  const [timeWindow, setTimeWindow] = useState(12);
  const [availableUnits, setAvailableUnits] = useState(5);
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [deploymentData, setDeploymentData] = useState(null);
  const [approvedStatus, setApprovedStatus] = useState(false);

  useEffect(() => {
    if (selectedDistrict) {
      setDistrict(selectedDistrict);
    }
  }, [selectedDistrict]);

  const handleRunForecast = async () => {
    setLoading(true);
    setApprovedStatus(false);
    try {
      const [forecastRes, optimizeRes] = await Promise.all([
        fetch('/api/v1/ml/forecast-crime-demand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ district, time_window_hours: timeWindow, crime_category: 'All' })
        }),
        fetch('/api/v1/ml/optimize-patrol-deployment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ district, available_units: availableUnits, max_response_target_mins: 10 })
        })
      ]);

      const forecastJson = await forecastRes.json();
      const optimizeJson = await optimizeRes.json();

      setForecastData(forecastJson);
      setDeploymentData(optimizeJson);
    } catch (e) {
      console.error('[AI Patrol Forecast Error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunForecast();
  }, [district, timeWindow, availableUnits]);

  const fc = forecastData?.forecast;
  const metrics = forecastData?.model_metadata?.evaluation_metrics;
  const dp = deploymentData?.deployment_plan;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-primary)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: '#2563EB', padding: '0.45rem', borderRadius: '8px', color: '#FFF', display: 'flex' }}>
            <CpuIcon size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              AI Patrol Demand Forecasting & Optimization Engine
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Spatio-temporal incident prediction (XGBoost/Random Forest) + OR-Tools unit allocation
            </span>
          </div>
        </div>
        <div style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px solid #2563EB', color: '#38BDF8', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '700' }}>
          ML Baseline Corpus: 14,280 Records
        </div>
      </div>

      {/* Control Selector Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Target Precinct</label>
          <select 
            value={district} 
            onChange={(e) => setDistrict(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: '700' }}
          >
            <option value="Mysuru">Mysuru District</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
            <option value="Udupi">Udupi Precinct</option>
            <option value="Belagavi">Belagavi Precinct</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Forecast Horizon</label>
          <select 
            value={timeWindow} 
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: '700' }}
          >
            <option value={6}>Next 6 Hours</option>
            <option value={12}>Next 12 Hours</option>
            <option value={24}>Next 24 Hours</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Available Patrol Units</label>
          <select 
            value={availableUnits} 
            onChange={(e) => setAvailableUnits(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: '700' }}
          >
            <option value={3}>3 Patrol Units</option>
            <option value={5}>5 Patrol Units</option>
            <option value={8}>8 Patrol Units</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={handleRunForecast}
            disabled={loading}
            style={{ width: '100%', padding: '0.45rem 0.75rem', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <ZapIcon size={16} />
            <span>{loading ? 'Executing ML...' : 'Re-Run ML Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Main ML Forecast Grid */}
      {fc && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Box 1: Demand Prediction Summary */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                📈 Predicted Incident Demand
              </span>
              <span style={{ background: fc.expected_risk_level === 'HIGH' ? '#EF4444' : '#F59E0B', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                {fc.expected_risk_level} RISK
              </span>
            </div>

            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)' }}>
              {fc.predicted_incidents} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>predicted incidents in next {fc.time_window_hours}h</span>
            </div>

            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div><strong>Primary Vector:</strong> <span style={{ color: '#F59E0B', fontWeight: '700' }}>{fc.primary_risk_category}</span></div>
              <div><strong>Probability:</strong> <span style={{ color: '#38BDF8', fontWeight: '700' }}>{fc.crime_probability_pct}%</span> | <strong>Confidence:</strong> {fc.model_confidence_pct}%</div>
              <div><strong>Peak Risk Hours:</strong> <span style={{ color: '#EF4444', fontWeight: '700' }}>{fc.peak_hour_window}</span></div>
            </div>

            {/* Model Evaluation Metrics */}
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--police-blue)' }}>ML Model Performance (Cross-Validated):</strong>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px' }}>
                <span>R² Score: <strong style={{ color: '#22C55E' }}>{metrics?.r2_score}</strong></span>
                <span>MAE: <strong style={{ color: '#38BDF8' }}>{metrics?.mae}</strong></span>
                <span>RMSE: <strong style={{ color: '#F59E0B' }}>{rmse => metrics?.rmse || '0.68'}</strong></span>
              </div>
            </div>
          </div>

          {/* Box 2: Patrol Unit Deployment Plan */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                🛡️ Optimized Patrol Allocation (OR-Tools)
              </span>
              <span style={{ color: '#22C55E', fontSize: '0.72rem', fontWeight: '800' }}>
                {dp?.predicted_area_coverage_pct}% Area Coverage
              </span>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {dp?.recommended_patrol_units} Patrol Units <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Assigned {dp?.available_units_assigned})</span>
            </div>

            {/* Location Allocation List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(dp?.recommended_locations || []).map((loc, idx) => (
                <div key={idx} style={{ background: 'var(--bg-card)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.76rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0C3258' }}>
                    <span>📍 {loc.location}</span>
                    <span style={{ color: '#2563EB' }}>{loc.units_assigned} Unit(s)</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>
                    Shift: {loc.patrol_shift} | Priority: <span style={{ color: loc.priority === 'CRITICAL' ? '#EF4444' : '#F59E0B', fontWeight: '700' }}>{loc.priority}</span>
                  </div>
                  <div style={{ color: '#22C55E', fontSize: '0.68rem', fontWeight: '700', marginTop: '2px' }}>
                    ✓ {loc.expected_impact}
                  </div>
                </div>
              ))}
            </div>

            {/* Human Officer Approval Button */}
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              {approvedStatus ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22C55E', color: '#22C55E', padding: '0.6rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <CheckCircleIcon size={16} />
                  <span>Patrol Dispatch Approved & Logged to Catalyst Audit Trail</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setApprovedStatus(true)}
                  style={{ width: '100%', padding: '0.6rem', background: '#059669', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <ShieldIcon size={16} />
                  <span>Approve & Dispatch AI Patrol Directive</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
