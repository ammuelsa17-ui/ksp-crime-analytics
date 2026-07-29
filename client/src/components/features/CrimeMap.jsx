import React, { useEffect, useRef } from 'react';

const DISTRICT_COORDS = {
  'bengaluru': [12.9716, 77.5946],
  'mysuru': [12.2958, 76.6394],
  'hubballi-dharwad': [15.3647, 75.1240],
  'hubballi': [15.3647, 75.1240],
  'udupi': [13.3409, 74.7421],
  'belagavi': [15.8497, 74.4977],
  'mangaluru': [12.9141, 74.8560],
  'kalaburagi': [17.3297, 76.8343],
  'ballari': [15.1394, 76.9214],
  'davanagere': [14.4644, 75.9218]
};

export const CrimeMap = ({
  cases = [],
  districtRiskScoresWithOverrides = [],
  theme = 'dark',
  activeTab = 'map',
  setActiveTab,
  setSearchQuery,
  parseCaseMetadata
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // 1. Mount Leaflet Instance ONLY when activeTab === 'map' and container is visible (> 100px)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof L === 'undefined') return;
    if (activeTab !== 'map') return;
    if (mapInstanceRef.current) return;

    const container = mapContainerRef.current;
    if (!container) return;

    // Ensure layout width is calculated before L.map attaches
    if (container.clientWidth < 100) return;

    // Clean any previous initialization state on container
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }
    container.innerHTML = '';

    // Initialize Leaflet Map
    const map = L.map(container, {
      center: [14.9754, 76.1368],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true
    });
    mapInstanceRef.current = map;

    // Define Tile Layers with clean options (tileSize: 256, keepBuffer: 4)
    const cartoDark = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20, tileSize: 256, updateWhenIdle: false, keepBuffer: 4 }
    );
    const cartoLight = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20, tileSize: 256, updateWhenIdle: false, keepBuffer: 4 }
    );
    const osm = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19, tileSize: 256, updateWhenIdle: false, keepBuffer: 4 }
    );
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 19, tileSize: 256, updateWhenIdle: false, keepBuffer: 4 }
    );

    // Apply default theme tile layer
    (theme === 'dark' ? cartoDark : cartoLight).addTo(map);

    L.control.layers({
      '🌑 Command Dark': cartoDark,
      '☀️ Government Light': cartoLight,
      '🗺️ OpenStreetMap': osm,
      '🛰️ Satellite': satellite
    }, null, { position: 'topright' }).addTo(map);

    // Dedicated LayerGroup for markers and circles
    map._kspLayerGroup = L.layerGroup().addTo(map);

    // Cleanup on component unmount
    return () => {
      try {
        map.off();
        map.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    };
  }, [activeTab, theme]);

  // 2. ResizeObserver + tab-switch resize handling
  useEffect(() => {
    const container = mapContainerRef.current;
    const map = mapInstanceRef.current;

    if (!container || !map || activeTab !== 'map') return;

    const observer = new ResizeObserver(() => {
      if (container.clientWidth > 300 && container.clientHeight > 300) {
        requestAnimationFrame(() => {
          map.invalidateSize({
            animate: false,
            pan: false,
          });
        });
      }
    });

    observer.observe(container);

    requestAnimationFrame(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: false, pan: false });
      }
    });

    return () => observer.disconnect();
  }, [activeTab]);

  // 3. Update Markers & Hotspot Circles when cases, districtRiskScores, or theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._kspLayerGroup || activeTab !== 'map') return;

    map._kspLayerGroup.clearLayers();

    // Helper for marker pin icons
    const createCustomMarkerIcon = (category, priority) => {
      const isCyber = category?.toLowerCase().includes('cyber');
      const isHigh = priority?.toLowerCase().includes('high') || priority?.toLowerCase().includes('critical');
      const pinColor = isHigh ? '#EF4444' : isCyber ? '#0284C7' : '#F59E0B';
      const svg = `<svg width="28" height="36" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <filter id="ps" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
        </filter>
        <path d="M15 0 C6.7 0 0 6.7 0 15 C0 26.2 15 38 15 38 C15 38 30 26.2 30 15 C30 6.7 23.3 0 15 0 Z" fill="${pinColor}" filter="url(#ps)"/>
        <circle cx="15" cy="14" r="7" fill="#FFF"/>
        <circle cx="15" cy="14" r="4" fill="${pinColor}"/>
      </svg>`;
      return L.divIcon({ html: svg, className: 'custom-ksp-marker', iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -32] });
    };

    // Plot District Hotspot Circles
    (districtRiskScoresWithOverrides || []).forEach(item => {
      const key = item.district.toLowerCase();
      const coords = DISTRICT_COORDS[key] || DISTRICT_COORDS[Object.keys(DISTRICT_COORDS).find(k => key.includes(k))] || null;
      if (!coords) return;

      const color = item.level === 'HIGH' ? '#EF4444' : item.level === 'MEDIUM' ? '#F59E0B' : '#22C55E';
      const circle = L.circle(coords, {
        color, fillColor: color, fillOpacity: 0.25,
        radius: 18000 + (item.count * 6000), weight: 1.5
      });

      circle.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:200px;padding:6px;color:#0F172A;">
          <h4 style="margin:0 0 6px 0;font-size:0.95rem;font-weight:800;border-bottom:1px solid #E2E8F0;padding-bottom:4px;color:#0C3258;">📍 ${item.district} Precinct</h4>
          <div style="font-size:0.82rem;display:flex;flex-direction:column;gap:3px;">
            <div><strong>Risk Level:</strong> <span style="color:${color};font-weight:800;">${item.level} RISK</span></div>
            <div><strong>Active FIRs:</strong> ${item.count}</div>
            <div><strong>State Share:</strong> ${item.score}%</div>
          </div>
        </div>
      `);
      map._kspLayerGroup.addLayer(circle);
    });

    // Global Click Handler for FIR popup buttons
    window.kspViewFir = (firNum) => {
      if (setActiveTab) setActiveTab('records');
      if (setSearchQuery) setSearchQuery(firNum);
    };

    // Plot Case Pin Markers
    (cases || []).forEach(c => {
      if (!c.latitude || !c.longitude) return;
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const meta = parseCaseMetadata ? parseCaseMetadata(c) : { officer: c.investigating_officer || 'Inspector In-Charge', priority: c.priority || 'Medium', status: c.status || 'Active' };
      const marker = L.marker([lat, lng], { icon: createCustomMarkerIcon(c.category, meta.priority) });

      marker.bindPopup(`
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
      map._kspLayerGroup.addLayer(marker);
    });
  }, [cases, districtRiskScoresWithOverrides, theme, activeTab, parseCaseMetadata]);

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
      <div 
        ref={mapContainerRef}
        id="crime-map" 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '600px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }} 
      />
    </div>
  );
};
