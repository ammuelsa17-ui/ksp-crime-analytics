import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const DISTRICT_COORDS = {
  'bengaluru': [77.5946, 12.9716],
  'mysuru': [76.6394, 12.2958],
  'hubballi-dharwad': [75.1240, 15.3647],
  'hubballi': [75.1240, 15.3647],
  'udupi': [74.7421, 13.3409],
  'belagavi': [74.4977, 15.8497],
  'mangaluru': [74.8560, 12.9141],
  'kalaburagi': [76.8343, 17.3297],
  'ballari': [76.9214, 15.1394],
  'davanagere': [75.9218, 14.4644]
};

export default function CrimeMapV3({
  cases = [],
  districtRiskScoresWithOverrides = [],
  theme = 'dark',
  setActiveTab,
  setSearchQuery,
  parseCaseMetadata
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 1. Initialize MapLibre GL Canvas Map Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const tileUrl = theme === 'dark'
      ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const map = new maplibregl.Map({
      container,
      center: [76.1368, 14.9754],
      zoom: 6.5,
      style: {
        version: 8,
        sources: {
          'base-raster': {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors © CARTO',
          },
        },
        layers: [
          {
            id: 'base-raster-layer',
            type: 'raster',
            source: 'base-raster',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
      map.resize();
    });

    mapRef.current = map;

    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers and Hotspot Circles on MapLibre Canvas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Global Click Handler for FIR popup buttons
    window.kspViewFir = (firNum) => {
      if (setActiveTab) setActiveTab('records');
      if (setSearchQuery) setSearchQuery(firNum);
    };

    // Plot District Hotspot Circle Markers
    (districtRiskScoresWithOverrides || []).forEach(item => {
      const key = item.district.toLowerCase();
      const coords = DISTRICT_COORDS[key] || DISTRICT_COORDS[Object.keys(DISTRICT_COORDS).find(k => key.includes(k))] || null;
      if (!coords) return;

      const color = item.level === 'HIGH' ? '#EF4444' : item.level === 'MEDIUM' ? '#F59E0B' : '#22C55E';
      const size = 36 + Math.min(item.count * 8, 40);

      const el = document.createElement('div');
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.background = color;
      el.style.opacity = '0.35';
      el.style.border = `2px solid ${color}`;
      el.style.boxShadow = `0 0 12px ${color}`;
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
        <div style="font-family:system-ui,sans-serif;min-width:200px;padding:6px;color:#0F172A;">
          <h4 style="margin:0 0 6px 0;font-size:0.95rem;font-weight:800;border-bottom:1px solid #E2E8F0;padding-bottom:4px;color:#0C3258;">📍 ${item.district} Precinct</h4>
          <div style="font-size:0.82rem;display:flex;flex-direction:column;gap:3px;">
            <div><strong>Risk Level:</strong> <span style="color:${color};font-weight:800;">${item.level} RISK</span></div>
            <div><strong>Active FIRs:</strong> ${item.count}</div>
            <div><strong>State Share:</strong> ${item.score}%</div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Plot FIR Case Pins
    (cases || []).forEach(c => {
      if (!c.latitude || !c.longitude) return;
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const meta = parseCaseMetadata ? parseCaseMetadata(c) : { officer: c.investigating_officer || 'Inspector In-Charge', priority: c.priority || 'Medium', status: c.status || 'Active' };
      const isCyber = c.category?.toLowerCase().includes('cyber');
      const isHigh = meta.priority?.toLowerCase().includes('high') || meta.priority?.toLowerCase().includes('critical');
      const pinColor = isHigh ? '#EF4444' : isCyber ? '#0284C7' : '#F59E0B';

      const el = document.createElement('div');
      el.className = 'custom-ksp-maplibre-pin';
      el.style.cursor = 'pointer';
      el.innerHTML = `<svg width="28" height="36" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <filter id="ps" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
        </filter>
        <path d="M15 0 C6.7 0 0 6.7 0 15 C0 26.2 15 38 15 38 C15 38 30 26.2 30 15 C30 6.7 23.3 0 15 0 Z" fill="${pinColor}" filter="url(#ps)"/>
        <circle cx="15" cy="14" r="7" fill="#FFF"/>
        <circle cx="15" cy="14" r="4" fill="${pinColor}"/>
      </svg>`;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family:system-ui,sans-serif;min-width:220px;padding:6px;color:#0F172A;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0284C7;padding-bottom:5px;margin-bottom:6px;">
            <strong style="font-size:0.88rem;color:#0C3258;">📝 ${c.fir_number}</strong>
            <span style="background:${c.category?.toLowerCase().includes('cyber')?'#0284C7':'#EF4444'};color:#FFF;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">${c.category}</span>
          </div>
          <div style="font-size:0.78rem;margin-bottom:4px;color:#334155;">
            <strong>District:</strong> ${c.district}<br><strong>Station:</strong> ${c.police_station}
          </div>
          <div style="font-size:0.75rem;color:#475569;margin-bottom:8px;">
            <strong>Investigator:</strong> ${meta.officer}<br>
            <strong>Priority:</strong> <span style="color:${meta.priority==='High'?'#EF4444':'#F59E0B'};font-weight:700;">${meta.priority}</span> |
            <strong>Status:</strong> <span style="color:#0284C7;font-weight:700;">${meta.status}</span>
          </div>
          <button type="button" onclick="window.kspViewFir('${c.fir_number}')"
            style="width:100%;padding:6px;background:#1565C0;color:#FFF;border:none;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;">
            📂 Inspect Full FIR Record
          </button>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [cases, districtRiskScoresWithOverrides, theme, parseCaseMetadata]);

  return (
    <div
      ref={containerRef}
      className="gis-map-v3"
      style={{
        flex: '1 1 64%',
        minWidth: '320px',
        height: '600px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-primary)'
      }}
    />
  );
}
