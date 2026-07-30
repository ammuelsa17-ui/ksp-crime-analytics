import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const DISTRICT_COORDINATES = {
  'bengaluru': [77.5946, 12.9716],
  'bengaluru urban': [77.5946, 12.9716],
  'bengaluru rural': [77.7000, 13.1500],
  'mysuru': [76.6394, 12.2958],
  'mangaluru': [74.8560, 12.9141],
  'dakshina kannada': [74.8560, 12.9141],
  'udupi': [74.7421, 13.3409],
  'shivamogga': [75.5681, 13.9299],
  'dharwad': [75.0078, 15.4589],
  'hubballi': [75.1240, 15.3647],
  'hubballi-dharwad': [75.1240, 15.3647],
  'ballari': [76.9214, 15.1394],
  'kalaburagi': [76.8343, 17.3297],
  'belagavi': [74.4977, 15.8497],
  'davanagere': [75.9218, 14.4644],
  'bagalkot': [75.6616, 16.1852],
  'bidar': [77.5199, 17.9104],
  'chamarajanagar': [76.9437, 11.9261],
  'chikkamagaluru': [75.7739, 13.3161],
  'chikkaballapur': [77.7275, 13.4355],
  'chitradurga': [76.4010, 14.2251],
  'gadag': [75.6268, 15.4319],
  'hassan': [76.1011, 13.0072],
  'haveri': [75.4054, 14.7954],
  'kodagu': [75.7382, 12.4244],
  'kolar': [78.1291, 13.1367],
  'koppal': [76.1550, 15.3486],
  'mandya': [76.8973, 12.5218],
  'raichur': [77.3566, 16.2076],
  'ramanagara': [77.2810, 12.7209],
  'tumakuru': [77.1010, 13.3379],
  'uttara kannada': [74.6869, 14.8158],
  'vijayanagara': [76.3895, 15.2750],
  'yadgir': [77.1378, 16.7667]
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
  const [activeMapMode, setActiveMapMode] = useState(
    () => localStorage.getItem('ksp-map-mode') || (theme === 'dark' ? 'dark' : 'light')
  );

  // 1. Initialize MapLibre GL WebGL Engine focused strictly on Karnataka
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const initialMode = localStorage.getItem('ksp-map-mode') || (theme === 'dark' ? 'dark' : 'light');

    const map = new maplibregl.Map({
      container,
      center: [75.7139, 15.3173],
      zoom: 6.8,
      minZoom: 5.8,
      maxZoom: 14,
      maxBounds: [
        [73.5, 11.3], // Southwest Karnataka coordinates
        [78.8, 18.8], // Northeast Karnataka coordinates
      ],
      style: {
        version: 8,
        sources: {
          'dark-tiles': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors © CARTO',
          },
          'light-tiles': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors © CARTO',
          },
          'satellite-tiles': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Tiles © Esri',
          },
        },
        layers: [
          {
            id: 'dark-base',
            type: 'raster',
            source: 'dark-tiles',
            layout: { visibility: initialMode === 'dark' ? 'visible' : 'none' },
          },
          {
            id: 'light-base',
            type: 'raster',
            source: 'light-tiles',
            layout: { visibility: initialMode === 'light' ? 'visible' : 'none' },
          },
          {
            id: 'satellite-base',
            type: 'raster',
            source: 'satellite-tiles',
            layout: { visibility: 'none' },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
      map.resize();

      // Safe Source & Layer Registration for Hotspots
      if (!map.getSource('hotspots')) {
        map.addSource('hotspots', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      if (!map.getLayer('hotspot-glow')) {
        map.addLayer({
          id: 'hotspot-glow',
          type: 'circle',
          source: 'hotspots',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'riskScore'],
              0, 14,
              100, 48,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'riskScore'],
              0, '#22c55e',
              40, '#f59e0b',
              70, '#ef4444',
            ],
            'circle-opacity': 0.28,
            'circle-blur': 0.5,
          },
        });
      }

      if (!map.getLayer('hotspot-core')) {
        map.addLayer({
          id: 'hotspot-core',
          type: 'circle',
          source: 'hotspots',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'riskScore'],
              0, 7,
              100, 20,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'riskScore'],
              0, '#22c55e',
              40, '#f59e0b',
              70, '#ef4444',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });
      }

      // Add GeoJSON Source for FIR Incident Pins (rendered above hotspots)
      if (!map.getSource('fir-points')) {
        map.addSource('fir-points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      if (!map.getLayer('fir-points-layer')) {
        map.addLayer({
          id: 'fir-points-layer',
          type: 'circle',
          source: 'fir-points',
          paint: {
            'circle-radius': 7,
            'circle-color': [
              'match',
              ['get', 'priority'],
              'High', '#ef4444',
              'Critical', '#ef4444',
              'Medium', '#f59e0b',
              /* default */ '#0284c7'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });
      }
    });

    // Global Click Handler for FIR Popup navigation button
    window.kspViewFir = (firNum) => {
      if (setActiveTab) setActiveTab('records');
      if (setSearchQuery) setSearchQuery(firNum);
    };

    // Hotspot Click Popup
    map.on('click', 'hotspot-core', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const props = feature.properties;
      const coordinates = feature.geometry.coordinates.slice();
      const color = props.level === 'HIGH' ? '#EF4444' : props.level === 'MEDIUM' ? '#F59E0B' : '#22C55E';

      new maplibregl.Popup({ offset: 10 })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;padding:6px;color:#0F172A;">
            <h4 style="margin:0 0 6px 0;font-size:0.95rem;font-weight:800;border-bottom:1px solid #E2E8F0;padding-bottom:4px;color:#0C3258;">📍 ${props.district} Precinct</h4>
            <div style="font-size:0.82rem;display:flex;flex-direction:column;gap:3px;">
              <div><strong>Risk Level:</strong> <span style="color:${color};font-weight:800;">${props.level} RISK</span></div>
              <div><strong>Active FIRs:</strong> ${props.count}</div>
              <div><strong>State Share:</strong> ${props.score}%</div>
            </div>
          </div>
        `)
        .addTo(map);
    });

    // FIR Point Click Popup
    map.on('click', 'fir-points-layer', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const props = feature.properties;
      const coordinates = feature.geometry.coordinates.slice();

      new maplibregl.Popup({ offset: 12 })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="font-family:system-ui,sans-serif;min-width:220px;padding:6px;color:#0F172A;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0284C7;padding-bottom:5px;margin-bottom:6px;">
              <strong style="font-size:0.88rem;color:#0C3258;">📝 ${props.fir_number}</strong>
              <span style="background:${props.isCyber?'#0284C7':'#EF4444'};color:#FFF;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">${props.category}</span>
            </div>
            <div style="font-size:0.78rem;margin-bottom:4px;color:#334155;">
              <strong>District:</strong> ${props.district}<br><strong>Station:</strong> ${props.police_station}
            </div>
            <div style="font-size:0.75rem;color:#475569;margin-bottom:8px;">
              <strong>Investigator:</strong> ${props.officer}<br>
              <strong>Priority:</strong> <span style="color:${props.priority==='High'?'#EF4444':'#F59E0B'};font-weight:700;">${props.priority}</span> |
              <strong>Status:</strong> <span style="color:#0284C7;font-weight:700;">${props.status}</span>
            </div>
            <button type="button" onclick="window.kspViewFir('${props.fir_number}')"
              style="width:100%;padding:6px;background:#1565C0;color:#FFF;border:none;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;">
              📂 Inspect Full FIR Record
            </button>
          </div>
        `)
        .addTo(map);
    });

    // Pointer cursor on hover over interactive features
    map.on('mouseenter', 'hotspot-core', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'hotspot-core', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'fir-points-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'fir-points-layer', () => { map.getCanvas().style.cursor = ''; });

    mapRef.current = map;

    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Base-map Switcher Handler
  const switchBaseMap = (mode) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const visibility = {
      dark: mode === 'dark' ? 'visible' : 'none',
      light: mode === 'light' ? 'visible' : 'none',
      satellite: mode === 'satellite' ? 'visible' : 'none',
    };

    if (map.getLayer('dark-base')) map.setLayoutProperty('dark-base', 'visibility', visibility.dark);
    if (map.getLayer('light-base')) map.setLayoutProperty('light-base', 'visibility', visibility.light);
    if (map.getLayer('satellite-base')) map.setLayoutProperty('satellite-base', 'visibility', visibility.satellite);

    if (map.getLayer('hotspot-core')) {
      map.setPaintProperty(
        'hotspot-core',
        'circle-stroke-color',
        mode === 'satellite' ? '#ffffff' : '#ffffff'
      );
      map.setPaintProperty(
        'hotspot-core',
        'circle-stroke-width',
        mode === 'satellite' ? 3 : 2
      );
    }

    setActiveMapMode(mode);
    try {
      localStorage.setItem('ksp-map-mode', mode);
    } catch (e) {}
  };

  // 3. Update GeoJSON Sources Instantly when cases or risk scores change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateMapSources = () => {
      if (!map.isStyleLoaded()) {
        map.once('idle', updateMapSources);
        return;
      }

      const hotspotSource = map.getSource('hotspots');
      const firSource = map.getSource('fir-points');

      // Build GeoJSON Features for Hotspots
      const hotspotFeatures = (districtRiskScoresWithOverrides || [])
        .map(item => {
          const key = item.district.toLowerCase();
          const coords = DISTRICT_COORDINATES[key] || DISTRICT_COORDINATES[Object.keys(DISTRICT_COORDINATES).find(k => key.includes(k))] || null;
          if (!coords) {
            console.warn(`[GIS Radar] No valid coordinates for district: ${item.district}`);
            return null;
          }

          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coords },
            properties: {
              district: item.district,
              level: item.level,
              count: item.count,
              score: item.score,
              riskScore: item.score || (item.level === 'HIGH' ? 85 : item.level === 'MEDIUM' ? 50 : 20)
            }
          };
        })
        .filter(Boolean);

      const hotspotGeoJson = {
        type: 'FeatureCollection',
        features: hotspotFeatures
      };

      if (hotspotSource) {
        hotspotSource.setData(hotspotGeoJson);
      }

      // Build GeoJSON Features for FIR Points
      const firFeatures = (cases || [])
        .map(c => {
          if (!c.latitude || !c.longitude) return null;
          const lat = parseFloat(c.latitude);
          const lng = parseFloat(c.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const meta = parseCaseMetadata ? parseCaseMetadata(c) : { officer: c.investigating_officer || 'Inspector In-Charge', priority: c.priority || 'Medium', status: c.status || 'Active' };

          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {
              fir_number: c.fir_number,
              category: c.category || 'General Crime',
              district: c.district,
              police_station: c.police_station,
              officer: meta.officer,
              priority: meta.priority,
              status: meta.status,
              isCyber: c.category?.toLowerCase().includes('cyber') || false
            }
          };
        })
        .filter(Boolean);

      const firGeoJson = {
        type: 'FeatureCollection',
        features: firFeatures
      };

      if (firSource) {
        firSource.setData(firGeoJson);
      }
    };

    if (map.isStyleLoaded()) {
      updateMapSources();
    } else {
      map.once('load', updateMapSources);
    }
  }, [cases, districtRiskScoresWithOverrides, parseCaseMetadata]);

  // Handler to fly map back to Karnataka focus
  const handleResetKarnatakaView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [75.7139, 15.3173],
        zoom: 6.8,
        essential: true,
      });
    }
  };

  return (
    <div
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
    >
      {/* WebGL Canvas Map Container */}
      <div ref={containerRef} className="gis-map-v3" style={{ width: '100%', height: '100%' }} />

      {/* Control Overlay Button: Reset Karnataka Focus */}
      <div style={{ position: 'absolute', top: '12px', left: '50px', zIndex: 10 }}>
        <button
          type="button"
          onClick={handleResetKarnatakaView}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.45rem 0.75rem',
            fontSize: '0.72rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          🎯 Reset Karnataka Radar View
        </button>
      </div>

      {/* 🗺️ 3-Mode Base-Map Layer Selector UI (Top-Right) */}
      <div className="map-mode-selector">
        <button
          type="button"
          className={activeMapMode === 'dark' ? 'active' : ''}
          onClick={() => switchBaseMap('dark')}
        >
          🌙 Dark
        </button>
        <button
          type="button"
          className={activeMapMode === 'light' ? 'active' : ''}
          onClick={() => switchBaseMap('light')}
        >
          ☀️ Light
        </button>
        <button
          type="button"
          className={activeMapMode === 'satellite' ? 'active' : ''}
          onClick={() => switchBaseMap('satellite')}
        >
          🛰️ Satellite
        </button>
      </div>

      {/* Compact GIS Map Legend Overlay (Bottom-Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.68rem',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ fontWeight: '800', color: 'var(--police-blue)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          GIS Command Radar Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', border: '1px solid #FFF', display: 'inline-block' }}></span>
          <span>High Risk Precinct (Score &gt; 70%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', border: '1px solid #FFF', display: 'inline-block' }}></span>
          <span>Moderate Risk Precinct (40–70%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E', border: '1px solid #FFF', display: 'inline-block' }}></span>
          <span>Low Risk Precinct (&lt; 40%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284C7', border: '2px solid #FFF', display: 'inline-block' }}></span>
          <span>Active FIR Incident Point</span>
        </div>
      </div>
    </div>
  );
}
