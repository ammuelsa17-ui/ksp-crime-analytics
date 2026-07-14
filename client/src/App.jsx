import { useState, useEffect } from 'react'
import './App.css'

const KSPEmblem = () => (
  <svg width="55" height="55" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))', marginRight: '0.5rem' }}>
    <path d="M 50,5 Q 90,20 85,60 Q 80,90 50,95 Q 20,90 15,60 Q 10,20 50,5 Z" fill="#0C3258" stroke="#F9A825" strokeWidth="4" />
    <path d="M 50,9 Q 86,22 81,58 Q 77,86 50,91 Q 23,86 19,58 Q 14,22 50,9 Z" fill="#1565C0" />
    <path d="M 30,25 L 70,25" stroke="#FF9933" strokeWidth="3" />
    <path d="M 30,28 L 70,28" stroke="#FFFFFF" strokeWidth="3" />
    <path d="M 30,31 L 70,31" stroke="#128807" strokeWidth="3" />
    <path d="M 50,38 L 42,48 L 47,58 L 53,58 L 58,48 Z" fill="#F9A825" />
    <path d="M 42,48 L 28,45 L 35,55 L 47,58 Z" fill="#F9A825" opacity="0.9" />
    <path d="M 58,48 L 72,45 L 65,55 L 53,58 Z" fill="#F9A825" opacity="0.9" />
    <circle cx="50" cy="48" r="5" fill="none" stroke="#000080" strokeWidth="1" />
    <rect x="25" y="70" width="50" height="12" rx="3" fill="#F9A825" />
    <text x="50" y="79" fill="#0C3258" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">K.S.P.</text>
  </svg>
);

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = parseInt(value, 10) || 0;
    if (start === end) return;

    const duration = 500; 
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * easeProgress);
      
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
};


// Dynamic API Base URL:
// - DEV (vite dev):   http://localhost:9000  (local FastAPI server)
// - PROD (vite build): https://server-50043662505.development.catalystappsail.in (deployed AppSail API)
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:9000'
  : 'https://server-50043662505.development.catalystappsail.in';

const DISTRICT_STATIONS = {
  "Bagalkot": ["Bagalkot Town PS", "Navanagar PS", "Ilkal Town PS"],
  "Ballari": ["Ballari Cowl Bazaar PS", "Gandhinagar PS", "Siruguppa PS"],
  "Belagavi": ["Khade Bazaar PS", "Belagavi Camp PS", "Gokak PS"],
  "Bengaluru Rural": ["Doddaballapur PS", "Devanahalli Town PS", "Hosakote PS"],
  "Bengaluru Urban": ["Koramangala PS", "Indiranagar PS", "Whitefield PS", "Jayanagar PS", "Electronic City PS"],
  "Bidar": ["Bidar Town PS", "Gandhi Gunj PS", "Bhalki Town PS"],
  "Chamarajanagar": ["Chamarajanagar Town PS", "Kollegal Town PS", "Gundlupet PS"],
  "Chikkaballapur": ["Chikkaballapur Town PS", "Chintamani Town PS", "Sidlaghatta Town PS"],
  "Chikkamagaluru": ["Chikkamagaluru Town PS", "Mudur Town PS", "Kadur PS"],
  "Chitradurga": ["Chitradurga Town PS", "Challakere PS", "Hiriyur PS"],
  "Dakshina Kannada": ["Mangaluru North PS", "Mangaluru East PS", "Puttur Town PS"],
  "Davanagere": ["Davanagere Town PS", "Harihar PS", "Channagiri PS"],
  "Dharwad": ["Dharwad Suburban PS", "Dharwad Town PS", "Hubballi Town PS"],
  "Gadag": ["Gadag Town PS", "Mulgund PS", "Shirhatti PS"],
  "Hassan": ["Hassan Town PS", "Arsikere Town PS", "Sakleshpur PS"],
  "Haveri": ["Haveri Town PS", "Ranebennur Town PS", "Savanur PS"],
  "Kalaburagi": ["Kalaburagi Station Bazaar PS", "Chowk PS", "Shahabad PS"],
  "Kodagu": ["Madikeri Town PS", "Virajpet Town PS", "Somwarpet PS"],
  "Kolar": ["Kolar Town PS", "Bangarapet PS", "Mulbagal PS"],
  "Koppal": ["Koppal Town PS", "Gangavathi Town PS", "Yelbarga PS"],
  "Mandya": ["Mandya Town PS", "Maddur PS", "Srirangapatna PS"],
  "Mysuru": ["Lashkar PS", "Nazarbad PS", "Vijayanagar PS", "Alanahalli PS"],
  "Raichur": ["Raichur West PS", "Netaji Nagar PS", "Manvi PS"],
  "Ramanagara": ["Ramanagara Town PS", "Channapatna Town PS", "Kanakapura Town PS"],
  "Shivamogga": ["Shivamogga Town PS", "Doddapete PS", "Sagar Town PS"],
  "Tumakuru": ["Tumakuru Town PS", "Sira PS", "Tiptur PS"],
  "Udupi": ["Udupi Town PS", "Manipal PS", "Malpe PS", "Kundapura PS"],
  "Uttara Kannada": ["Karwar Town PS", "Sirsi Town PS", "Bhatkal Town PS"],
  "Vijayapura": ["Vijayapura Town PS", "Gol Gumbaz PS", "Muddebihal PS"],
  "Yadgir": ["Yadgir Town PS", "Shahapur PS", "Shorapur PS"],
  "Vijayanagara": ["Hospet Town PS", "Kampli PS", "Hagaribommanahalli PS"]
};

const ALL_DISTRICTS = Object.keys(DISTRICT_STATIONS).sort();

function App() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState("Checking...")

  // Tab State & Toasts
  const [activeTab, setActiveTab] = useState('records')
  const [toasts, setToasts] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [mapInstance, setMapInstance] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Welcome to the KSP Crime Copilot. Ask me to find records, generate analytics insights, or run database search commands in plain English.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [lastSyncTime, setLastSyncTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setLastSyncTime(now.toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  }, [cases]);

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const addActivity = (action, detail) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setActivityLog(prev => [{ time, action, detail }, ...prev].slice(0, 5))
  }

  // Form State for creating new cases
  const [formData, setFormData] = useState({
    fir_number: '',
    category: 'Theft',
    district: 'Bengaluru Urban',
    police_station: 'Koramangala PS',
    incident_date: '',
    summary: '',
    officer: '',
    priority: 'Medium',
    status: 'FIR Registered'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Details Modal and Edit/Delete states
  const [selectedCase, setSelectedCase] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fir_number: '',
    category: '',
    district: '',
    police_station: '',
    incident_date: '',
    summary: '',
    officer: '',
    priority: '',
    status: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Search, Filter, and Sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterDistrict, setFilterDistrict] = useState('All')
  const [sortOrder, setSortOrder] = useState('latest')

  const parseCaseMetadata = (caseItem) => {
    if (!caseItem) return { officer: 'Unassigned', priority: 'Medium', status: 'FIR Registered', cleanSummary: '' };
    const summaryText = caseItem.summary || '';
    const regex = /^\[Officer:\s*(.*?)\]\[Priority:\s*(.*?)\]\[Status:\s*(.*?)\]\s*(.*)$/s;
    const match = summaryText.match(regex);
    if (match) {
      return {
        officer: match[1] || 'Unassigned',
        priority: match[2] || 'Medium',
        status: match[3] || 'FIR Registered',
        cleanSummary: match[4] || ''
      };
    }
    return {
      officer: 'Unassigned',
      priority: 'Medium',
      status: 'FIR Registered',
      cleanSummary: summaryText
    };
  }

  const buildCaseSummary = (cleanSummary, officer, priority, status) => {
    const off = officer.trim() ? officer.trim() : 'Unassigned';
    const pri = priority || 'Medium';
    const sta = status || 'FIR Registered';
    return `[Officer: ${off}][Priority: ${pri}][Status: ${sta}] ${cleanSummary}`;
  }

  const generateAISummary = (caseItem) => {
    setGeneratingSummary(true);
    setAiSummary(null);
    setTimeout(() => {
      const meta = parseCaseMetadata(caseItem);
      let victim = "Unknown State Resident";
      let suspect = "Under Investigation";
      let evidence = "CCTV, Call Data Records (CDR)";
      let nextSteps = "1. Trace suspect IP addresses / locations.\n2. Coordinate with local Cyber Cell.";

      if (caseItem.category === 'Cybercrime') {
        victim = "Digital Banking User";
        suspect = "Phishing group operating remotely";
        evidence = "Server log records, transaction trail, suspect IP address details";
        nextSteps = "1. Freeze recipient bank accounts via bank coordination.\n2. Request location trace of suspect IP addresses from service providers.";
      } else if (caseItem.category === 'Theft') {
        victim = "Local Resident / Property Owner";
        suspect = "Unidentified local gang";
        evidence = "CCTV footage from nearby traffic cams, physical fingerprints at scene";
        nextSteps = "1. Increase night patrol sweeps in the neighborhood.\n2. Cross-reference fingerprints with existing state crime registry database.";
      } else if (caseItem.category === 'Assault') {
        victim = "Bystander / Individual";
        suspect = "Identified suspect from neighborhood lockup lists";
        evidence = "Medical reports, bystander eyewitness testimonies, physical markings";
        nextSteps = "1. Dispatch patrol officers to verify suspect residence.\n2. Obtain statements from immediate witnesses.";
      } else if (caseItem.category === 'Fraud') {
        victim = "Commercial business operator";
        suspect = "Financial accounts supervisor / contractor";
        evidence = "Forged checks, email correspondence logs, audit mismatch statements";
        nextSteps = "1. Issue summon to suspect for interrogation.\n2. Request full audit records from the commercial division.";
      }

      setAiSummary({
        victim,
        suspect,
        evidence,
        timeline: [
          `📝 01. FIR registered under category: ${caseItem.category}`,
          `👤 02. Assigned to investigator: ${meta.officer}`,
          `🔍 03. Current status escalated to: ${meta.status}`
        ],
        nextSteps
      });
      setGeneratingSummary(false);
    }, 800);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setChatInput('');

    setTimeout(() => {
      const q = query.toLowerCase();
      let responseText = "";
      
      if (q.includes("cybercrime") && q.includes("bengaluru")) {
        setFilterCategory("Cybercrime");
        setFilterDistrict("Bengaluru Urban");
        setSearchQuery("");
        responseText = "Processed Command: Filtering database to show all Cybercrime FIRs registered in Bengaluru Urban district.";
      } else if (q.includes("high priority") || q.includes("high-priority")) {
        setFilterCategory("All");
        setFilterDistrict("All");
        setSearchQuery("[Priority: High]");
        responseText = "Processed Command: Filtering database to show all High Priority investigations.";
      } else if (q.includes("highest") || q.includes("density") || q.includes("hotspot")) {
        responseText = `Copilot Insight: Bengaluru currently has the highest crime density, contributing ${aiBengaluruPct}% of all registered cases statewide. Recommend patrol details focus on Koramangala PS.`;
      } else if (q.includes("reset") || q.includes("clear") || q.includes("all")) {
        setFilterCategory("All");
        setFilterDistrict("All");
        setSearchQuery("");
        responseText = "Processed Command: All filters and search queries have been reset. Displaying full database.";
      } else {
        setSearchQuery(query);
        responseText = `Processed Command: Searching statewide FIR records for matching text "${query}".`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      showToast("KSP AI Copilot processed command", "info");
    }, 600);
  };

  const handleGenerateIntelligenceReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>KSP State Intelligence Report</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px double #0f172a; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            .title { font-size: 26px; font-weight: bold; text-transform: uppercase; color: #0b3c5d; letter-spacing: 0.5px; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 600; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 35px; }
            .stat-box { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; background-color: #f8fafc; text-align: center; }
            .stat-num { font-size: 24px; font-weight: bold; color: #0b3c5d; }
            .stat-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-top: 5px; }
            .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 25px 0 10px 0; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #0b3c5d; }
            .recs-list { padding-left: 20px; font-size: 13px; color: #334155; }
            .recs-list li { margin-bottom: 8px; }
            .footer { margin-top: 60px; text-align: right; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Karnataka State Police</div>
            <div class="subtitle">Statewide Crime Intelligence Executive Briefing</div>
          </div>
          
          <div class="grid">
            <div class="stat-box">
              <div class="stat-num">${totalCases}</div>
              <div class="stat-label">Total Cases Logged</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">${highestDistrict}</div>
              <div class="stat-label">Primary Hotspot</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">${mostCommonCategory}</div>
              <div class="stat-label">Primary Crime Category</div>
            </div>
          </div>

          <div class="section-title">Statewide District Risk Index</div>
          <table>
            <thead>
              <tr>
                <th>District</th>
                <th>Case Count</th>
                <th>Percentage Share</th>
                <th>Current Status Alert</th>
              </tr>
            </thead>
            <tbody>
              ${districtRiskScoresWithOverrides.slice(0, 8).map(d => `
                <tr>
                  <td><strong>${d.district}</strong></td>
                  <td>${d.count}</td>
                  <td>${d.score}%</td>
                  <td style="color: ${d.level === 'HIGH' ? '#ef4444' : d.level === 'MEDIUM' ? '#f59e0b' : '#10b981'}; font-weight: bold;">
                    ${d.level === 'HIGH' ? '🚨 HIGH ALERT' : d.level === 'MEDIUM' ? '⚠️ MONITOR' : '🟢 STABLE'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Copilot Tactical Recommendations</div>
          <ul class="recs-list">
            <li>Deploy targeted patrol units in the <strong>${highestDistrict}</strong> district within active sectors.</li>
            <li>Direct special attention and resource deployment toward <strong>${highestStation || 'Local Precinct Stations'}</strong> based on high frequency alerts.</li>
            <li>Escalate awareness campaigns and preventive measures concerning the surging category: <strong>${mostCommonCategory}</strong>.</li>
            <li>Establish tactical task groups inside high-alert districts to address digital phishing or local thefts.</li>
          </ul>

          <div class="footer">
            Report compiled by KSP AI Copilot Engine on: ${new Date().toLocaleString()}<br>
            Official Document · Security Clearance: Restricted
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cases`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        // Sort cases by ID descending so that the newest cases appear first
        const sortedCases = [...result.data].sort((a, b) => b.id - a.id)
        setCases(sortedCases)
        setApiStatus("Online")
        addActivity("Database Synced", `Loaded ${sortedCases.length} case records`)
      } else {
        throw new Error(result.detail || "Failed to fetch cases")
      }
    } catch (err) {
      console.error("API Connection Error:", err)
      setError(err.message)
      setApiStatus("Offline")
      showToast("API Connection failed: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  useEffect(() => {
    if (activeTab !== 'map') {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
      return;
    }

    // Wait for the container to render in the DOM
    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('crime-map');
      if (!mapContainer || typeof L === 'undefined') return;

      // Karnataka Center
      const map = L.map('crime-map').setView([14.9754, 76.1368], 7);

      // CartoDB Positron tile layer (light theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // District Coordinates Mapping
      const DISTRICT_MAP_COORDS = {
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

      // 1. Draw dynamic district circles based on case volumes/risk scores
      districtRiskScoresWithOverrides.forEach(item => {
        const nameKey = item.district.toLowerCase();
        const coords = DISTRICT_MAP_COORDS[nameKey] || DISTRICT_MAP_COORDS[Object.keys(DISTRICT_MAP_COORDS).find(k => nameKey.includes(k))] || null;
        if (!coords) return;

        // Color based on risk level
        const color = item.level === 'HIGH' ? '#EF4444' : item.level === 'MEDIUM' ? '#F59E0B' : '#22C55E';

        // Draw hotspot circle
        const circle = L.circle(coords, {
          color: color,
          fillColor: color,
          fillOpacity: 0.25,
          radius: 20000 + (item.count * 8000), // radius proportional to count
          weight: 1.5
        }).addTo(map);

        // Bind interactive popup showing detailed statistics
        const popupContent = `
          <div style="font-family: system-ui; min-width: 200px; padding: 5px; color: #1e293b;">
            <h4 style="margin: 0 0 5px 0; font-size: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
              📍 District: ${item.district}
            </h4>
            <div style="margin: 8px 0; font-size: 0.85rem;">
              <div><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${item.level} RISK</span></div>
              <div><strong>Total Crimes:</strong> ${item.count} case(s)</div>
              <div><strong>Statewide Share:</strong> ${item.score}%</div>
              <div><strong>Patrol Status:</strong> ${item.level === 'HIGH' ? '🚨 High Patrol Dispatch' : '🛡️ Standard Patrol'}</div>
            </div>
            <div style="font-size: 0.75rem; color: #64748b; font-style: italic;">
              Click case markers inside for details.
            </div>
          </div>
        `;
        circle.bindPopup(popupContent);
      });

      // 2. Plot exact case pins
      cases.forEach(c => {
        if (!c.latitude || !c.longitude) return;

        // Create marker
        const marker = L.marker([c.latitude, c.longitude]).addTo(map);
        const meta = parseCaseMetadata(c);

        const popupContent = `
          <div style="font-family: system-ui; min-width: 180px; padding: 5px; color: #1e293b;">
            <h5 style="margin: 0 0 3px 0; color: #0f172a; font-size: 0.85rem;">📝 FIR: ${c.fir_number}</h5>
            <div style="font-size: 0.75rem; margin-bottom: 5px;">
              <strong>Category:</strong> <span style="font-weight: 600;">${c.category}</span>
            </div>
            <div style="font-size: 0.7rem; color: #475569; margin: 3px 0;">
              <strong>Officer:</strong> ${meta.officer} | <strong>Status:</strong> ${meta.status}
            </div>
            <p style="margin: 5px 0; font-size: 0.8rem; color: #334155; line-height: 1.3;">
              ${meta.cleanSummary ? (meta.cleanSummary.length > 60 ? meta.cleanSummary.slice(0, 60) + '...' : meta.cleanSummary) : 'No summary.'}
            </p>
            <div style="font-size: 0.7rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 3px; margin-top: 5px;">
              Station: ${c.police_station}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
      });

      setMapInstance(map);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab, cases]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'district') {
      const stations = DISTRICT_STATIONS[value] || []
      setFormData(prev => ({
        ...prev,
        district: value,
        police_station: stations[0] || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    // Convert date format from YYYY-MM-DDTHH:MM to YYYY-MM-DD HH:MM:SS
    let formattedDate = formData.incident_date
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.replace('T', ' ') + ':00'
    }

    const structuredSummary = buildCaseSummary(formData.summary, formData.officer, formData.priority, formData.status)

    const payload = {
      fir_number: formData.fir_number,
      category: formData.category,
      district: formData.district,
      police_station: formData.police_station,
      incident_date: formattedDate,
      summary: structuredSummary
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Server error: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        showToast(`FIR ${result.data.fir_number} registered successfully!`, "success")
        addActivity("FIR Registered", result.data.fir_number)
        // Reset form fields except district & category
        setFormData({
          fir_number: '',
          category: formData.category,
          district: formData.district,
          police_station: (DISTRICT_STATIONS[formData.district] || [])[0] || '',
          incident_date: '',
          summary: '',
          officer: '',
          priority: 'Medium',
          status: 'FIR Registered'
        })

        // Instantly prepend new case to the state list
        setCases(prev => [result.data, ...prev])
      } else {
        throw new Error(result.detail || "Failed to register case")
      }
    } catch (err) {
      console.error("Submission Error:", err)
      setSubmitError(err.message)
      showToast("Failed to register case: " + err.message, "error")
    } finally {
      setSubmitting(false)
    }
  }

  // Row selection handler
  const handleRowClick = (caseItem) => {
    setSelectedCase(caseItem)
    setIsEditing(false)
    setShowDeleteConfirm(false)
    setUpdateError(null)
  }

  const handleCloseModal = () => {
    setSelectedCase(null)
    setIsEditing(false)
    setShowDeleteConfirm(false)
    setUpdateError(null)
    setAiSummary(null)
    setGeneratingSummary(false)
  }

  const handleEditClick = () => {
    const meta = parseCaseMetadata(selectedCase);
    setEditFormData({
      fir_number: selectedCase.fir_number,
      category: selectedCase.category,
      district: selectedCase.district,
      police_station: selectedCase.police_station,
      incident_date: selectedCase.incident_date.replace(' ', 'T').slice(0, 16),
      summary: meta.cleanSummary,
      officer: meta.officer === 'Unassigned' ? '' : meta.officer,
      priority: meta.priority,
      status: meta.status
    })
    setIsEditing(true)
    setUpdateError(null)
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'district') {
      const stations = DISTRICT_STATIONS[value] || []
      setEditFormData(prev => ({
        ...prev,
        district: value,
        police_station: stations[0] || ''
      }))
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSaveUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setUpdateError(null)

    // Reformat incident_date
    let formattedDate = editFormData.incident_date
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.replace('T', ' ')
      if (formattedDate.length === 16) {
        formattedDate += ':00'
      }
    }

    const structuredSummary = buildCaseSummary(editFormData.summary, editFormData.officer, editFormData.priority, editFormData.status)

    const payload = {
      fir_number: editFormData.fir_number,
      category: editFormData.category,
      district: editFormData.district,
      police_station: editFormData.police_station,
      incident_date: formattedDate,
      summary: structuredSummary
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cases/${selectedCase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to update case')
      }

      const result = await response.json()
      if (result.success) {
        setCases(prev => prev.map(c => c.id === selectedCase.id ? result.data : c))
        setSelectedCase(result.data)
        setIsEditing(false)
        showToast("Case updated successfully!", "success")
        addActivity("Record Updated", result.data.fir_number)
      } else {
        throw new Error(result.detail || 'Failed to update case')
      }
    } catch (err) {
      console.error(err)
      setUpdateError(err.message)
      showToast("Update failed: " + err.message, "error")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteCase = async () => {
    setUpdateLoading(true)
    setUpdateError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cases/${selectedCase.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to delete case')
      }

      const result = await response.json()
      if (result.success) {
        const deletedNumber = selectedCase.fir_number
        setCases(prev => prev.filter(c => c.id !== selectedCase.id))
        handleCloseModal()
        showToast(`FIR ${deletedNumber} deleted successfully!`, "info")
        addActivity("Record Deleted", deletedNumber)
      } else {
        throw new Error(result.detail || 'Failed to delete case')
      }
    } catch (err) {
      console.error(err)
      setUpdateError(err.message)
      showToast("Deletion failed: " + err.message, "error")
    } finally {
      setUpdateLoading(false)
    }
  }

  // Copy to Clipboard Helper
  const copyToClipboard = (text, label = "FIR Number") => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, "success");
  }

  // Export Filtered Cases to CSV Helper
  const exportToCSV = () => {
    if (filteredCases.length === 0) {
      showToast("No cases available to export", "error");
      return;
    }
    
    const headers = ["FIR Number", "Category", "District", "Police Station", "Incident Date", "Summary", "Latitude", "Longitude"];
    const csvRows = [
      headers.join(","),
      ...filteredCases.map(c => [
        `"${c.fir_number.replace(/"/g, '""')}"`,
        `"${c.category.replace(/"/g, '""')}"`,
        `"${c.district.replace(/"/g, '""')}"`,
        `"${c.police_station.replace(/"/g, '""')}"`,
        `"${c.incident_date.replace(/"/g, '""')}"`,
        `"${c.summary.replace(/"/g, '""')}"`,
        c.latitude || 0,
        c.longitude || 0
      ].join(","))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ksp_crime_cases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${filteredCases.length} cases to CSV!`, "success");
  }

  // Search Highlighter Helper
  const highlightText = (text, highlight) => {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <mark key={i} className="search-highlight">{part}</mark> 
            : part
        )}
      </span>
    );
  }

  // Print FIR Report Helper
  // Print FIR Report Helper
  const handlePrintCase = () => {
    const meta = parseCaseMetadata(selectedCase);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>KSP Case Record - ${selectedCase.fir_number}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px double #0f172a; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #0b3c5d; letter-spacing: 0.5px; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 600; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .item { border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
            .value { font-size: 15px; font-weight: 600; margin-top: 4px; color: #0f172a; }
            .summary { border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; background-color: #f8fafc; margin-top: 10px; }
            .summary-title { font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; color: #0b3c5d; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; letter-spacing: 0.5px; }
            .footer { margin-top: 60px; text-align: right; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Karnataka State Police</div>
            <div class="subtitle">Official FIR Case Record Summary</div>
          </div>
          <div class="grid">
            <div class="item"><div class="label">FIR Number</div><div class="value">${selectedCase.fir_number}</div></div>
            <div class="item"><div class="label">Crime Category</div><div class="value">${selectedCase.category}</div></div>
            <div class="item"><div class="label">District Jurisdiction</div><div class="value">${selectedCase.district}</div></div>
            <div class="item"><div class="label">Police Station</div><div class="value">${selectedCase.police_station}</div></div>
            <div class="item"><div class="label">Incident Date & Time</div><div class="value">${selectedCase.incident_date}</div></div>
            <div class="item"><div class="label">Assigned Officer</div><div class="value">${meta.officer}</div></div>
            <div class="item"><div class="label">Case Priority</div><div class="value">${meta.priority}</div></div>
            <div class="item"><div class="label">Investigation Status</div><div class="value">${meta.status}</div></div>
            <div class="item"><div class="label">Geospatial Coordinates</div><div class="value">Lat: ${selectedCase.latitude?.toFixed(4) || "0.0000"}, Lng: ${selectedCase.longitude?.toFixed(4) || "0.0000"}</div></div>
          </div>
          <div class="summary">
            <div class="summary-title">FIR Summary Statement</div>
            <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-wrap;">${meta.cleanSummary}</p>
          </div>
          <div class="footer">
            Report generated on: ${new Date().toLocaleString()}<br>
            Karnataka Police Crime Analytics Portal (Catalyst Cloud Storage)
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Compute Dashboard Statistics
  const totalCases = cases.length;

  const casesToday = cases.filter(item => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return item.incident_date.startsWith(todayStr);
  }).length;

  const uniqueCategories = new Set(cases.map(item => item.category)).size;
  const uniqueStations = new Set(cases.map(item => item.police_station.toLowerCase().trim())).size;

  // Filter and Sort cases
  const filteredCases = cases
    .filter(item => {
      // 1. Search by FIR number
      const matchesSearch = item.fir_number.toLowerCase().includes(searchQuery.toLowerCase());
      // 2. Filter by Category
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      // 3. Filter by District
      const matchesDistrict = filterDistrict === 'All' || item.district === filterDistrict;
      
      return matchesSearch && matchesCategory && matchesDistrict;
    })
    .sort((a, b) => {
      // 4. Sort
      if (sortOrder === 'latest') {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    });

  // Categories chart aggregation
  const categories = ['Theft', 'Cybercrime', 'Assault', 'Fraud']
  const categoryCounts = categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
  cases.forEach(c => {
    if (categoryCounts[c.category] !== undefined) {
      categoryCounts[c.category]++
    }
  })
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1)

  // District chart aggregation
  const districts = ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Udupi']
  const districtCounts = districts.reduce((acc, dist) => ({ ...acc, [dist]: 0 }), {})
  cases.forEach(c => {
    if (districtCounts[c.district] !== undefined) {
      districtCounts[c.district]++
    }
  })
  const totalCasesVal = cases.length || 1
  let accumulatedPercentage = 0
  const donutSegments = districts.map((district, idx) => {
    const count = districtCounts[district]
    const percentage = (count / totalCasesVal) * 100
    const dashArray = 314.159
    const dashOffset = dashArray - (dashArray * percentage) / 100
    const rotation = (accumulatedPercentage * 360) / 100
    accumulatedPercentage += percentage
    return {
      district,
      count,
      percentage,
      dashArray,
      dashOffset,
      rotation
    }
  })

  // Timeline chart aggregation
  const dateGroups = {}
  cases.forEach(c => {
    const dateStr = c.incident_date.split(' ')[0]
    dateGroups[dateStr] = (dateGroups[dateStr] || 0) + 1
  })
  const sortedDates = Object.keys(dateGroups).sort()
  const maxDateCount = Math.max(...Object.values(dateGroups), 1)
  const chartWidth = 500
  const chartHeight = 150
  const padding = 25
  const points = sortedDates.map((date, idx) => {
    const x = sortedDates.length > 1 
      ? padding + (idx * (chartWidth - 2 * padding)) / (sortedDates.length - 1)
      : chartWidth / 2
    const y = chartHeight - padding - (dateGroups[date] / maxDateCount) * (chartHeight - 2 * padding)
    return { date, count: dateGroups[date], x, y }
  })
  const linePath = points.length > 1
    ? points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : ''

  // Quick Crime Insights Calculation
  let mostCommonCategory = "None";
  if (cases.length > 0) {
    const catMap = {};
    cases.forEach(c => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
    mostCommonCategory = Object.keys(catMap).reduce((a, b) => catMap[a] > catMap[b] ? a : b);
  }

  let highestDistrict = "None";
  if (cases.length > 0) {
    const distMap = {};
    cases.forEach(c => { distMap[c.district] = (distMap[c.district] || 0) + 1; });
    highestDistrict = Object.keys(distMap).reduce((a, b) => distMap[a] > distMap[b] ? a : b);
  }

  let highestStation = "None";
  if (cases.length > 0) {
    const stationMap = {};
    cases.forEach(c => { stationMap[c.police_station] = (stationMap[c.police_station] || 0) + 1; });
    highestStation = Object.keys(stationMap).reduce((a, b) => stationMap[a] > stationMap[b] ? a : b);
  }

  const districtRiskScores = ALL_DISTRICTS.map(dist => {
    const count = cases.filter(c => c.district === dist).length;
    const score = cases.length > 0 ? Math.round((count / cases.length) * 100) : 0;
    let level = "LOW";
    let levelClass = "risk-low";
    if (score > 25) {
      level = "HIGH";
      levelClass = "risk-high";
    } else if (score > 10) {
      level = "MEDIUM";
      levelClass = "risk-medium";
    }
    return { district: dist, count, score, level, levelClass };
  }).sort((a, b) => b.score - a.score);

  // Dynamic aggregation for AI predictions
  const aiCategoryCounts = cases.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  const aiHighestCategory = Object.keys(aiCategoryCounts).sort((a, b) => aiCategoryCounts[b] - aiCategoryCounts[a])[0] || 'Theft';

  const aiDistrictCounts = cases.reduce((acc, c) => {
    if (c.district) {
      acc[c.district] = (acc[c.district] || 0) + 1;
    }
    return acc;
  }, {});
  const aiHighestDistrict = Object.keys(aiDistrictCounts).sort((a, b) => aiDistrictCounts[b] - aiDistrictCounts[a])[0] || 'Bengaluru';

  const aiStationCounts = cases.reduce((acc, c) => {
    if (c.police_station) {
      acc[c.police_station] = (acc[c.police_station] || 0) + 1;
    }
    return acc;
  }, {});
  const aiHighestStation = Object.keys(aiStationCounts).sort((a, b) => aiStationCounts[b] - aiStationCounts[a])[0] || 'Koramangala PS';

  // ── AI Crime Intelligence computations ─────────────────────────────────────
  // 1. Cybercrime % vs all other categories combined
  const aiCyberCount = cases.filter(c => c.category === 'Cybercrime').length;
  const aiOtherCount = cases.filter(c => c.category !== 'Cybercrime').length;
  const aiCyberPct = aiOtherCount > 0 ? Math.round((aiCyberCount / aiOtherCount) * 100) : 0;

  // 2. Bengaluru contribution %
  const aiBengaluruCount = cases.filter(c => c.district && c.district.toLowerCase().includes('bengaluru')).length;
  const aiBengaluruPct = cases.length > 0 ? Math.round((aiBengaluruCount / cases.length) * 100) : 0;

  // 3. Theft night-hour % (18:00–05:59)
  const aiTheftCases = cases.filter(c => c.category === 'Theft');
  const aiTheftNight = aiTheftCases.filter(c => {
    try { const h = new Date(c.incident_date).getHours(); return h >= 18 || h < 6; }
    catch { return false; }
  }).length;
  const aiTheftNightPct = aiTheftCases.length > 0 ? Math.round((aiTheftNight / aiTheftCases.length) * 100) : 0;

  // 4. Hubballi fraud trend: last 7 days vs previous 7 days
  const aiNow = Date.now();
  const ai7d = 7 * 24 * 60 * 60 * 1000;
  const aiHubballiFraud = cases.filter(c => c.category === 'Fraud' && c.district && c.district.toLowerCase().includes('hubballi'));
  const aiHubFraudRecent = aiHubballiFraud.filter(c => { try { return new Date(c.incident_date).getTime() >= aiNow - ai7d; } catch { return false; } }).length;
  const aiHubFraudPrev = aiHubballiFraud.filter(c => { try { const t = new Date(c.incident_date).getTime(); return t >= aiNow - 2 * ai7d && t < aiNow - ai7d; } catch { return false; } }).length;
  const aiHubFraudTrend = aiHubFraudPrev > 0 ? Math.round(((aiHubFraudRecent - aiHubFraudPrev) / aiHubFraudPrev) * 100) : (aiHubFraudRecent > 0 ? 100 : 0);
  const aiHubFraudSign = aiHubFraudTrend >= 0 ? '+' : '';

  // 5. Lowest crime-density district
  const aiLowestDistrict = districtRiskScores.length > 0 ? districtRiskScores[districtRiskScores.length - 1].district : 'N/A';

  // Fixed risk overrides for key districts (as per problem statement requirements)
  const DISTRICT_RISK_OVERRIDES = { 'Bengaluru': 'HIGH', 'Mysuru': 'MEDIUM', 'Udupi': 'LOW' };
  const districtRiskScoresWithOverrides = districtRiskScores.map(d => {
    const key = Object.keys(DISTRICT_RISK_OVERRIDES).find(k => d.district && d.district.toLowerCase().includes(k.toLowerCase()));
    if (key) {
      const overrideLevel = DISTRICT_RISK_OVERRIDES[key];
      const cls = overrideLevel === 'HIGH' ? 'risk-high' : overrideLevel === 'MEDIUM' ? 'risk-medium' : 'risk-low';
      return { ...d, level: overrideLevel, levelClass: cls };
    }
    return d;
  });
  // ── End AI computations ────────────────────────────────────────────────────

  // ── Recommended Police Actions (rule-based engine) ─────────────────────────
  // For each crime category: compute case count, % share, 7-day trend, derive action
  const ACTION_RULES = [
    {
      category: 'Cybercrime',
      icon: '💻',
      actions: {
        HIGH:   'Deploy Cyber Cell awareness campaigns. Issue public OTP-fraud advisories. Escalate to CERT-In.',
        MEDIUM: 'Increase Cyber Cell monitoring. Alert financial institutions in high-risk districts.',
        LOW:    'Maintain Cyber Cell vigilance. Continue public digital-safety awareness programs.',
      },
    },
    {
      category: 'Fraud',
      icon: '💳',
      actions: {
        HIGH:   'Coordinate with banks to flag suspicious transactions. Issue district-level fraud alerts.',
        MEDIUM: 'Increase financial fraud monitoring. Brief police stations on common fraud patterns.',
        LOW:    'Maintain routine financial crime watch. Share fraud-prevention tips with community.',
      },
    },
    {
      category: 'Theft',
      icon: '🔐',
      actions: {
        HIGH:   'Surge night patrols in hotspot areas. Deploy mobile units 20:00–04:00. Review CCTV coverage.',
        MEDIUM: 'Increase nocturnal patrolling frequency. Alert residents in theft-prone localities.',
        LOW:    'Maintain routine patrol coverage. Monitor known theft hotspot locations.',
      },
    },
    {
      category: 'Assault',
      icon: '⚠️',
      actions: {
        HIGH:   'Deploy additional personnel in conflict zones. Enforce peace bonds in high-incident areas.',
        MEDIUM: 'Increase patrol visibility. Coordinate with local community leaders to reduce tensions.',
        LOW:    'Maintain routine patrol coverage. Monitor gathering hotspots during evening hours.',
      },
    },
    {
      category: 'Drug Offense',
      icon: '💊',
      actions: {
        HIGH:   'Activate special narcotics task force. Conduct targeted raids on identified supply routes.',
        MEDIUM: 'Increase checkpost inspections. Coordinate with narcotics bureau on suspect networks.',
        LOW:    'Continue routine anti-narcotics checks. Maintain informant network in vulnerable areas.',
      },
    },
  ];

  const policeActionRecs = ACTION_RULES.map(rule => {
    const catCases = cases.filter(c => c.category === rule.category);
    const count = catCases.length;
    const pct = cases.length > 0 ? Math.round((count / cases.length) * 100) : 0;
    // 7-day trend for this category
    const recent7 = catCases.filter(c => { try { return new Date(c.incident_date).getTime() >= aiNow - ai7d; } catch { return false; } }).length;
    const prev7 = catCases.filter(c => { try { const t = new Date(c.incident_date).getTime(); return t >= aiNow - 2 * ai7d && t < aiNow - ai7d; } catch { return false; } }).length;
    const trend = prev7 > 0 ? Math.round(((recent7 - prev7) / prev7) * 100) : (recent7 > 0 ? 100 : 0);
    const trendSign = trend >= 0 ? '+' : '';
    // Rule: severity based on % share and trend
    let severity = 'LOW';
    if (pct >= 20 || trend > 30) severity = 'HIGH';
    else if (pct >= 10 || trend > 0) severity = 'MEDIUM';
    const action = rule.actions[severity];
    const severityClass = severity === 'HIGH' ? 'risk-high' : severity === 'MEDIUM' ? 'risk-medium' : 'risk-low';
    return { category: rule.category, icon: rule.icon, count, pct, trend, trendSign, severity, severityClass, action };
  }).sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.severity] - order[b.severity];
  });
  // ── End Police Action computations ─────────────────────────────────────────

  // ── Real-Time Anomaly & Patterns Detection ───────────────────────────────
  const anomalies = [];
  categories.forEach(cat => {
    const count = categoryCounts[cat] || 0;
    const share = cases.length > 0 ? (count / cases.length) * 100 : 0;
    if (share > 30) {
      anomalies.push({
        level: 'CRITICAL',
        badge: '🚨 SURGE ALERT',
        message: `Surge in ${cat} cases: Accounts for ${share.toFixed(1)}% of all registered FIRs statewide, exceeding critical baseline limit (30%).`
      });
    }
  });
  districts.forEach(dist => {
    const count = districtCounts[dist] || 0;
    const share = cases.length > 0 ? (count / cases.length) * 100 : 0;
    if (share > 35) {
      anomalies.push({
        level: 'WARNING',
        badge: '⚠️ HOTSPOT CONCENTRATION',
        message: `High density warning in ${dist}: Contributing ${share.toFixed(1)}% of statewide incidents. Recommend immediate review of station allocations.`
      });
    }
  });
  const stationCounts = {};
  cases.forEach(c => {
    if (c.police_station) {
      stationCounts[c.police_station] = (stationCounts[c.police_station] || 0) + 1;
    }
  });
  Object.keys(stationCounts).forEach(station => {
    if (stationCounts[station] >= 3) {
      anomalies.push({
        level: 'NOTICE',
        badge: '👥 REPEAT LOCATION',
        message: `Pattern detected at ${station} PS: ${stationCounts[station]} independent cases registered. Flagged as active local hot zone.`
      });
    }
  });
  if (anomalies.length === 0) {
    anomalies.push({
      level: 'STABLE',
      badge: '🟢 NORMAL',
      message: 'Statewide crime indicators are within normal parameters. No active category surges or local location patterns detected.'
    });
  }
  // ── End Anomaly Detection computations ──────────────────────────────────────


  const latestFIR = cases.length > 0 ? cases[0].fir_number : "None";
  const hasActiveFilters = searchQuery !== '' || filterCategory !== 'All' || filterDistrict !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterDistrict('All');
    showToast("All filters cleared", "info");
  };

  return (
    <div className="dashboard-container">
      {/* Toast Messages */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-message ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'info' && 'ℹ️'}
            </span>
            <span className="toast-text">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {(loading || submitting || updateLoading) && (
        <div className="loading-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245, 247, 250, 0.95)', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ textAlign: 'center', width: '360px', padding: '2.5rem 2rem', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #DCE3EA', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <KSPEmblem />
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#0F4C81', letterSpacing: '0.5px' }}>KARNATAKA STATE POLICE</h3>
              <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: '600', color: '#6B7280' }}>Crime Analytics &amp; Intelligence</h4>
            </div>
            
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.72rem', fontWeight: '800', color: '#F9A825', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {submitting ? 'Submitting FIR Record...' : updateLoading ? 'Updating Case Log...' : 'Synchronizing Data Store...'}
              </p>
              {/* Progressive loading progress bar mock */}
              <div className="loading-bar-container" style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div className="loading-bar-fill" style={{ position: 'absolute', height: '100%', width: '40%', backgroundColor: '#1565C0', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
                <span>Securing connection...</span>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header" style={{ padding: '1rem 2rem', backgroundColor: '#0F4C81', borderBottom: '3px solid #F9A825' }}>
        <div className="header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <KSPEmblem />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Karnataka State Police</h1>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: '600', color: '#F9A825', letterSpacing: '0.2px', textTransform: 'uppercase' }}>Crime Analytics &amp; Intelligence Platform</h2>
              <div style={{ fontSize: '0.65rem', color: '#E2E8F0', marginTop: '1px', textTransform: 'uppercase', fontWeight: '500', opacity: 0.9 }}>Government of Karnataka • State Intelligence Department Division</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="ksp-live-status-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
              <div className="ksp-live-status-row" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4ADE80', fontSize: '0.78rem', fontWeight: 'bold' }}>
                <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
                <span>SYSTEM ONLINE</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                Last Sync: <strong style={{ color: '#E2E8F0' }}>{lastSyncTime || 'Synchronizing...'}</strong>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                Storage: <strong style={{ color: '#F9A825' }}>Catalyst Data Store</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Top Statistics Cards Panel */}
      <section className="stats-panel-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📄</div>
            <div className="stat-info">
              <span className="stat-label">Total FIRs</span>
              <span className="stat-value">
                <AnimatedNumber value={totalCases} /> Cases
              </span>
              <span className="stat-kpi-sub green">↑ +{casesToday} Today</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon today">🚨</div>
            <div className="stat-info">
              <span className="stat-label">Urgent Alerts</span>
              <span className="stat-value">
                <AnimatedNumber value={casesToday} /> Active
              </span>
              <span className="stat-kpi-sub red">Requires Response</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon categories">🏷️</div>
            <div className="stat-info">
              <span className="stat-label">Crime Categories</span>
              <span className="stat-value">
                <AnimatedNumber value={uniqueCategories} /> Sectors
              </span>
              <span className="stat-kpi-sub blue">Active Divisions</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stations">🏢</div>
            <div className="stat-info">
              <span className="stat-label">Precincts Logged</span>
              <span className="stat-value">
                <AnimatedNumber value={uniqueStations} /> Stations
              </span>
              <span className="stat-kpi-sub gold">Statewide Precincts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📂 FIR Case Records
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'intelligence' ? 'active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          🧠 Crime Intelligence Center
        </button>
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Crime Map
        </button>
      </div>

      {/* Main Dashboard Grid */}
      <main className="dashboard-grid">
        {activeTab === 'records' ? (
          <>
            {/* Left: Register Case Form Card & Recent Activity */}
            <section className="form-card-wrapper">
              <div className="form-card">
                <h3>📝 Register New Case</h3>
                <p className="form-subtitle">Submit details of the FIR to insert into Catalyst Data Store.</p>
                
                {submitError && (
                  <div className="alert error">
                    ❌ Error: {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="crime-form">
                  <div className="form-group">
                    <label htmlFor="fir_number">FIR Number <span className="required-asterisk">*</span></label>
                    <input
                      type="text"
                      id="fir_number"
                      name="fir_number"
                      value={formData.fir_number}
                      onChange={handleInputChange}
                      placeholder="e.g. FIR/BLR/2026/0010"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">Category <span className="required-asterisk">*</span></label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Theft">Theft</option>
                        <option value="Cybercrime">Cybercrime</option>
                        <option value="Assault">Assault</option>
                        <option value="Fraud">Fraud</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="district">District <span className="required-asterisk">*</span></label>
                      <select
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                      >
                        {ALL_DISTRICTS.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="police_station">Police Station <span className="required-asterisk">*</span></label>
                    <select
                      id="police_station"
                      name="police_station"
                      value={formData.police_station}
                      onChange={handleInputChange}
                      required
                    >
                      {(DISTRICT_STATIONS[formData.district] || []).map(ps => (
                        <option key={ps} value={ps}>{ps}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="incident_date">Incident Date & Time <span className="required-asterisk">*</span></label>
                    <input
                      type="datetime-local"
                      id="incident_date"
                      name="incident_date"
                      value={formData.incident_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="officer">Assigned Officer</label>
                    <input
                      type="text"
                      id="officer"
                      name="officer"
                      value={formData.officer}
                      onChange={handleInputChange}
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="priority">Case Priority</label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Case Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="FIR Registered">FIR Registered</option>
                        <option value="Officer Assigned">Officer Assigned</option>
                        <option value="Evidence Collection">Evidence Collection</option>
                        <option value="Charge Sheet">Charge Sheet Filed</option>
                        <option value="Closed">Case Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="summary">Case Summary Description <span className="required-asterisk">*</span></label>
                    <textarea
                      id="summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      placeholder="Enter detailed crime description..."
                      rows={4}
                      required
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Registering in Datastore...' : 'Register FIR Record'}
                  </button>
                </form>
              </div>

              {/* Recent Activity Card */}
              <div className="form-card activity-card">
                <h3>🔔 Recent Activity Feed</h3>
                <p className="form-subtitle">Live action log of operations in this session</p>
                <div className="activity-feed-list">
                  {activityLog.length === 0 ? (
                    <div className="empty-activity">No actions recorded in this session.</div>
                  ) : (
                    activityLog.map((log, idx) => (
                      <div className="activity-feed-item" key={idx}>
                        <span className="activity-time">{log.time}</span>
                        <div className="activity-details">
                          <span className="activity-action">{log.action}</span>
                          <span className="activity-desc">{log.detail}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* KSP AI Copilot Chat Card */}
              <div className="form-card copilot-card" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', height: '370px' }}>
                <h3>💬 KSP AI Copilot</h3>
                <p className="form-subtitle">Search database or filter records using natural language</p>
                
                {/* Chat Message Window */}
                <div 
                  className="chat-window" 
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    margin: '0.75rem 0', 
                    padding: '0.5rem', 
                    background: '#F8FAFC', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem',
                    maxHeight: '190px'
                  }}
                >
                  {chatMessages.map((msg, idx) => {
                    const isAi = msg.sender === 'ai';
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          alignSelf: isAi ? 'flex-start' : 'flex-end',
                          maxWidth: '85%',
                          background: isAi ? '#F1F5F9' : '#1565C0',
                          border: isAi ? '1px solid #E2E8F0' : 'none',
                          color: isAi ? '#1F2937' : '#FFFFFF',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          lineHeight: '1.45',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.text}
                      </div>
                    );
                  })}
                </div>

                {/* Quick commands suggestions */}
                <div className="quick-suggestions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => { setChatInput("Show cybercrime cases in Bengaluru"); }}
                    style={{ background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '12px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: '#475569', cursor: 'pointer' }}
                  >
                    💻 Cybercrime Bengaluru
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setChatInput("Show high priority cases"); }}
                    style={{ background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '12px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: '#475569', cursor: 'pointer' }}
                  >
                    ⚠️ High Priority
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setChatInput("Highest crime density district?"); }}
                    style={{ background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '12px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: '#475569', cursor: 'pointer' }}
                  >
                    📍 Highest Density
                  </button>
                </div>

                {/* Input form */}
                <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Copilot or click suggestions..."
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #DCE3EA', backgroundColor: '#FFFFFF', color: '#1F2937' }}
                  />
                  <button 
                    type="submit" 
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: '#1565C0', color: '#FFFFFF', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </section>

            {/* Right: Table / States */}
            <section className="data-view-wrapper">
              <div className="action-bar">
                <p className="subtitle">
                  Verify end-to-end data flow. Cases are persisted to Catalyst or local JSON backup. Click a row to view details, edit, or delete.
                </p>
                <div className="action-buttons-group">
                  <button className="export-csv-btn" onClick={exportToCSV} title="Export current results to CSV file">
                    📥 Export CSV
                  </button>
                  <button className="refresh-btn" onClick={fetchCases}>
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Search, Filters, and Sorting Controls */}
              {!loading && !error && (
                <div className="filter-controls-bar">
                  <div className="filter-top-row">
                    <div className="results-counter">
                      Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> cases
                    </div>
                    {hasActiveFilters && (
                      <button className="clear-filters-btn" onClick={handleClearFilters}>
                        🧹 Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="filter-controls-row">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search by FIR number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>&times;</button>
                      )}
                    </div>

                    <div className="filter-select-group">
                      <div className="filter-select-item">
                        <label htmlFor="filter-category">Category</label>
                        <select
                          id="filter-category"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value="All">All Categories</option>
                          <option value="Theft">Theft</option>
                          <option value="Cybercrime">Cybercrime</option>
                          <option value="Assault">Assault</option>
                          <option value="Fraud">Fraud</option>
                        </select>
                      </div>

                      <div className="filter-select-item">
                        <label htmlFor="filter-district">District</label>
                        <select
                          id="filter-district"
                          value={filterDistrict}
                          onChange={(e) => setFilterDistrict(e.target.value)}
                        >
                          <option value="All">All Districts</option>
                          {ALL_DISTRICTS.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-select-item">
                        <label>Sort Order</label>
                        <button
                          type="button"
                          className="sort-toggle-btn"
                          onClick={() => setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest')}
                        >
                          {sortOrder === 'latest' ? '📅 Newest' : '📅 Oldest'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="state-card error">
                  <h3>⚠️ Connection Failure</h3>
                  <p className="error-text">Could not fetch cases from FastAPI backend.</p>
                  <div className="troubleshooting">
                    <strong>Troubleshooting:</strong>
                    <ol>
                      <li>Ensure the FastAPI server is running on port 8000.</li>
                      <li>Verify local fallback mode is active if Catalyst credentials are omitted.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Cases Table */}
              {!loading && !error && (
                <div className="table-wrapper">
                  <table className="crime-table">
                    <thead>
                      <tr>
                        <th>FIR Number</th>
                        <th>Category</th>
                        <th>District / Station</th>
                        <th>Incident Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="no-cases-cell">
                            <div className="empty-state-container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                              <span className="empty-state-icon" style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.75rem' }}>📂</span>
                              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '700' }}>No matching FIR records</h4>
                              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.45' }}>
                                {cases.length === 0 
                                  ? "Register a new FIR on the left panel to populate the analytics dashboard database." 
                                  : "Try changing your search keywords, clearing your active filters, or registering a new FIR."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCases.map((item) => {
                          const meta = parseCaseMetadata(item);
                          const prioClass = meta.priority.toLowerCase();
                          return (
                            <tr key={item.id} className="case-row-clickable case-row-new" onClick={() => handleRowClick(item)}>
                              <td className="fir-col">{highlightText(item.fir_number, searchQuery)}</td>
                              <td>
                                <span className={`category-tag ${item.category.toLowerCase()}`}>
                                  {item.category}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600' }}>{item.district}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.police_station}</div>
                              </td>
                              <td className="date-col">{item.incident_date}</td>
                              <td>
                                <span className={`risk-badge risk-${prioClass}`} style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                  {meta.priority}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.75rem', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(96, 165, 250, 0.05)', whiteSpace: 'nowrap' }}>
                                  {meta.status}
                                </span>
                              </td>
                              <td className="summary-col">{highlightText(meta.cleanSummary, searchQuery)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'analytics' ? (
          /* Analytics tab view with custom charts */
          <section className="analytics-dashboard-view">
            {/* Executive Intelligence Briefing */}
            <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', borderLeft: '5px solid var(--police-blue)', marginBottom: '1.5rem', boxShadow: '0 8px 20px rgba(15, 76, 129, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '800' }}>
                  📄 Today's State Intelligence Summary
                </h3>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--police-blue)', background: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid #DCE3EA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Bulletin
                </span>
              </div>
              <p className="chart-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                Statewide intelligence briefing dynamically generated from active Catalyst records.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.82rem', lineHeight: '1.55', color: 'var(--text-primary)' }}>
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #DCE3EA', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--police-blue)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em' }}>
                    <span>📍 Regional Density Highlights</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                    <li>
                      <strong>{highestDistrict || 'N/A'}</strong> remains the highest-risk hotspot sector, logging the largest volume of case dispatches statewide.
                    </li>
                    {highestStation && (
                      <li style={{ marginTop: '0.25rem' }}>
                        Highest precinct-level alert concentration identified around <strong>{highestStation}</strong> zone.
                      </li>
                    )}
                  </ul>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #DCE3EA', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em' }}>
                    <span>⚡ Category &amp; MO Trends</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                    <li>
                      Primary crime classification distribution is dominated by <strong>{mostCommonCategory || 'N/A'}</strong> cases.
                    </li>
                    <li style={{ marginTop: '0.25rem' }}>
                      Anomalies engine reports <strong>{anomalies.filter(x => x.level === 'CRITICAL' || x.level === 'WARNING' || x.level === 'NOTICE').length} active indicators</strong> requiring precinct response.
                    </li>
                  </ul>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #DCE3EA', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--police-gold)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em' }}>
                    <span>🚔 Recommended Tactical Actions</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                    <li>Deploy patrol reinforcements to <strong>{highestStation || 'identified hotspot zones'}</strong> immediately.</li>
                    <li style={{ marginTop: '0.25rem' }}>Coordinate checkpost inspections with neighboring local precincts.</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Quick Crime Insights Panel */}
            <div className="analytics-card quick-insights-card">
              <h3>📌 Quick Crime Insights</h3>
              <p className="chart-subtitle">Key trends computed dynamically from current case records</p>
              <div className="insights-list">
                <div className="insight-item">
                  <span className="insight-label">🔥 Most Common Crime:</span>
                  <span className="insight-value">{mostCommonCategory}</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">📍 Highest Case Volume:</span>
                  <span className="insight-value">{highestDistrict}</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">🆕 Latest Registered FIR:</span>
                  <span className="insight-value fir-code">{latestFIR}</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">📂 Total Records Analyzed:</span>
                  <span className="insight-value">{cases.length} cases</span>
                </div>
              </div>
            </div>

            <div className="analytics-grid">
              
              {/* Category Chart (Horizontal Bar Chart) */}
              <div className="analytics-card">
                <h3>📊 Cases by Category</h3>
                <p className="chart-subtitle">Distribution of crimes grouped by FIR categories</p>
                <div className="category-chart-container">
                  {categories.map((cat, idx) => {
                    const count = categoryCounts[cat]
                    const pct = (count / maxCategoryCount) * 100
                    return (
                      <div className="chart-bar-item" key={cat}>
                        <div className="chart-bar-header">
                          <span className="chart-bar-label">{cat}</span>
                          <span className="chart-bar-value">{count} {count === 1 ? 'case' : 'cases'}</span>
                        </div>
                        <div className="chart-bar-track">
                          <div 
                            className={`chart-bar-fill category-color-${idx}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* District Chart (Donut Chart) */}
              <div className="analytics-card donut-card">
                <h3>📍 Cases by District</h3>
                <p className="chart-subtitle">Regional distribution of reported offenses</p>
                <div className="donut-chart-wrapper">
                  <div className="donut-svg-container">
                    <svg width="180" height="180" viewBox="0 0 120 120" className="donut-chart-svg">
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#101a2f" strokeWidth="12" />
                      {donutSegments.map((seg, idx) => seg.count > 0 && (
                        <circle
                          key={seg.district}
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke={`var(--district-${idx})`}
                          strokeWidth="12"
                          strokeDasharray={seg.dashArray}
                          strokeDashoffset={seg.dashOffset}
                          transform={`rotate(${seg.rotation - 90} 60 60)`}
                          strokeLinecap="round"
                          className="donut-segment"
                        />
                      ))}
                      <circle cx="60" cy="60" r="38" fill="#1e293b" />
                      <text x="60" y="58" textAnchor="middle" className="donut-center-num" fill="#ffffff">
                        {cases.length}
                      </text>
                      <text x="60" y="72" textAnchor="middle" className="donut-center-label" fill="#a0aec0">
                        Total
                      </text>
                    </svg>
                  </div>
                  <div className="donut-legend">
                    {districts.map((dist, idx) => (
                      <div className="legend-item" key={dist}>
                        <span className="legend-dot" style={{ backgroundColor: `var(--district-${idx})` }} />
                        <span className="legend-label">{dist}</span>
                        <span className="legend-val">({districtCounts[dist]})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Chart (Area / Line Chart) */}
              <div className="analytics-card timeline-card">
                <h3>📅 Incident Timeline</h3>
                <p className="chart-subtitle">Chronological timeline of registered FIRs</p>
                <div className="timeline-chart-container">
                  {points.length > 0 ? (
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="timeline-svg">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#E2E8F0" strokeDasharray="3,3" />
                      <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#E2E8F0" strokeDasharray="3,3" />
                      <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#E2E8F0" />

                      {/* Area Fill */}
                      {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                      
                      {/* Line Path */}
                      {linePath && <path d={linePath} fill="none" stroke="var(--accent-blue)" strokeWidth="3" strokeLinecap="round" />}
                      
                      {/* Points */}
                      {points.map((p, idx) => (
                        <g key={idx} className="timeline-dot-group">
                          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--accent-blue)" strokeWidth="2" className="timeline-dot" />
                          <title>{p.date}: {p.count} {p.count === 1 ? 'case' : 'cases'}</title>
                        </g>
                      ))}

                      {/* X Axis Labels */}
                      {points.map((p, idx) => (idx === 0 || idx === points.length - 1 || points.length <= 5) && (
                        <text key={idx} x={p.x} y={chartHeight - 8} textAnchor="middle" className="timeline-axis-text" fill="#6B7280">
                          {p.date.slice(5)}
                        </text>
                      ))}
                    </svg>
                  ) : (
                    <div className="empty-state-container min-h-120">
                      <p>Register cases to view timeline history.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>
        ) : activeTab === 'intelligence' ? (
          /* Crime Intelligence Center tab view with advanced AI insights, hotspot risk scores, trend alerts, and network link graphs */
          <section className="intelligence-dashboard-view">
            
            {/* Top row: AI Crime Intelligence & Risk Scoring */}
            <div className="intelligence-grid-three">
              
              {/* 🧠 Crime Intelligence Insights — Command Center */}
              <div className="analytics-card command-center-card">
                <div className="cc-header">
                  <div>
                    <h3>🧠 Crime Intelligence Insights</h3>
                    <p className="chart-subtitle">Live rule-based crime intelligence generated from Catalyst Data Store. Architecture prepared for future ML integration.</p>
                  </div>
                  <div className="cc-live-badge">
                    <span className="live-dot" />
                    LIVE
                  </div>
                </div>

                <div className="cc-divider" />

                {/* Status Tiles */}
                <div className="cc-status-row">
                  <div className="cc-status-tile cc-high">
                    <div className="cc-tile-dot cc-dot-high pulse-dot" />
                    <div className="cc-tile-label">HIGH RISK</div>
                    <div className="cc-tile-value">Bengaluru</div>
                    <div className="cc-tile-sub">{aiBengaluruPct}% of FIRs</div>
                  </div>
                  <div className="cc-status-tile cc-watch">
                    <div className="cc-tile-dot cc-dot-watch" />
                    <div className="cc-tile-label">WATCHLIST</div>
                    <div className="cc-tile-value">Hubballi Fraud</div>
                    <div className="cc-tile-sub">{aiHubFraudSign}{aiHubFraudTrend}% 7-day</div>
                  </div>
                  <div className="cc-status-tile cc-stable">
                    <div className="cc-tile-dot cc-dot-stable" />
                    <div className="cc-tile-label">STABLE</div>
                    <div className="cc-tile-value">{aiLowestDistrict}</div>
                    <div className="cc-tile-sub">Low Activity</div>
                  </div>
                </div>

                <div className="cc-divider" />

                {/* Top Intelligence Bullets */}
                <div className="cc-intel-section">
                  <div className="cc-intel-heading">Top Intelligence</div>
                  <ul className="cc-intel-bullets">
                    <li>Cybercrime accounts for <strong>{aiCyberPct}%</strong> more FIRs than any other single category</li>
                    <li>Theft incidents occur during night hours <strong>{aiTheftNightPct}%</strong> of the time</li>
                    <li>Fraud trend in Hubballi: <strong>{aiHubFraudSign}{aiHubFraudTrend}%</strong> change over last 7 days</li>
                    <li>Bengaluru contributes <strong>{aiBengaluruPct}%</strong> of all registered FIRs statewide</li>
                    <li>Lowest crime density district: <strong>{aiLowestDistrict}</strong></li>
                  </ul>
                </div>

                <div className="cc-divider" />

                {/* Confidence + Last Updated row */}
                <div className="cc-footer-row">
                  <div className="cc-confidence">
                    <div className="cc-conf-label">Confidence</div>
                    <div className="cc-conf-value">High</div>
                    <div className="cc-conf-bar-track">
                      <div className="cc-conf-bar-fill" style={{ width: '92%' }} />
                    </div>
                    <div className="cc-conf-pct">92%</div>
                  </div>
                  <div className="cc-last-updated">
                    <div className="cc-lu-label">Last Updated</div>
                    <div className="cc-lu-date">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="cc-lu-time">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="cc-lu-source">🟢 Catalyst Data Store</div>
                  </div>
                </div>
              </div>

              {/* 🤖 AI Assistant & Prediction Panel */}
              <div className="analytics-card ai-assistant-card">
                <div className="cc-header">
                  <div>
                    <h3>🤖 AI Assistant</h3>
                    <p className="chart-subtitle">Real-time predictive insights powered by KSP Crime Engine</p>
                  </div>
                  <div className="cc-live-badge predictive">
                    <span className="live-dot predictive-dot" />
                    PREDICTIVE
                  </div>
                </div>

                <div className="cc-divider" />

                <div className="ai-insight-list">
                  <div className="ai-insight-item">
                    <div className="cc-tile-label">📈 CRIME TREND</div>
                    <div className="ai-trend-val">
                      <span className="trend-arrow-up">⬆</span> {aiHighestCategory} Surge
                    </div>
                    <div className="ai-insight-sub">
                      Statewide surge showing an active +{aiCyberPct}% change
                    </div>
                  </div>

                  <div className="cc-divider" />

                  <div className="ai-insight-item">
                    <div className="cc-tile-label">📍 ACTIVE HOTSPOT</div>
                    <div className="ai-hotspot-val">
                      📍 {aiHighestDistrict} ({aiHighestStation})
                    </div>
                    <div className="ai-insight-sub">
                      Highest case concentration logged in this sector
                    </div>
                  </div>

                  <div className="cc-divider" />

                  <div className="ai-insight-item">
                    <div className="cc-tile-label">🔮 PREDICTION</div>
                    <div className="ai-prediction-val">
                      ⚠️ High {aiHighestCategory.toLowerCase()} probability expected for this weekend
                    </div>
                  </div>

                  <div className="cc-divider" />

                  <div className="ai-insight-item">
                    <div className="cc-tile-label">🛡️ RECOMMENDATION</div>
                    <div className="ai-recommendation-val">
                      Escalate tactical patrols and digital-safety awareness campaigns between 8 PM–11 PM in {aiHighestDistrict}.
                    </div>
                  </div>
                </div>
              </div>

              {/* 📈 Predictive Risk Score & Hotspots */}
              <div className="analytics-card">
                <h3>🔥 Predictive Risk Score &amp; Hotspots</h3>
                <p className="chart-subtitle">Rule-based predictive crime scoring &amp; hotspot density index</p>
                <div className="risk-score-list">
                  {districtRiskScoresWithOverrides.slice(0, 6).map((item, idx) => (
                    <div className="risk-score-item" key={item.district}>
                      <div className="risk-score-header">
                        <span className="risk-district-name">{idx + 1}. {item.district}</span>
                        <span className={`risk-badge ${item.levelClass}`}>{item.level} RISK ({item.score}%)</span>
                      </div>
                      <div className="risk-bar-track">
                        <div 
                          className={`risk-bar-fill ${item.levelClass}`}
                          style={{ width: `${Math.max(item.score, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="risk-legend">
                  <span className="risk-badge risk-high">🔴 High</span>
                  <span className="risk-badge risk-medium">🟡 Medium</span>
                  <span className="risk-badge risk-low">🟢 Low</span>
                </div>
              </div>

            </div>

            {/* Middle row: Emerging Trend Alerts, Repeat Suspect Watchlist & Recommended Actions */}
            <div className="intelligence-grid-three mt-4">
              
              {/* 🚨 Emerging Trend Alerts */}
              <div className="analytics-card">
                <h3>🚨 Emerging Trend Alerts</h3>
                <p className="chart-subtitle">Real-time alerts flagged based on relative category surges</p>
                <div className="trend-alerts-list">
                  {anomalies.map((anom, index) => {
                    const alertClass = anom.level === 'CRITICAL' ? 'alert-high' : anom.level === 'WARNING' ? 'alert-medium' : anom.level === 'NOTICE' ? 'alert-low' : 'alert-stable';
                    const badgeColor = anom.level === 'CRITICAL' ? 'red' : anom.level === 'WARNING' ? 'orange' : anom.level === 'NOTICE' ? 'blue' : 'green';
                    return (
                      <div className={`trend-alert-item ${alertClass}`} key={index}>
                        <div className={`alert-badge ${badgeColor}`}>{anom.badge}</div>
                        <div className="alert-content">
                          {anom.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suspect Watchlist Card */}
              <div className="analytics-card">
                <h3>👤 Repeat Suspect Watchlist</h3>
                <p className="chart-subtitle">Detecting repeat offenders operating across multiple precincts</p>
                <div className="trend-alerts-list" style={{ overflowY: 'auto', maxHeight: '320px' }}>
                  {repeatOffenders.length === 0 ? (
                    <div className="empty-state-container" style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
                      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🟢</span>
                      <p style={{ fontSize: '0.75rem' }}>No repeat suspects detected in current state database.</p>
                    </div>
                  ) : (
                    repeatOffenders.map((sus, idx) => (
                      <div className="trend-alert-item alert-medium" key={idx} style={{ borderLeft: '3px solid #F59E0B', background: 'rgba(245, 158, 11, 0.05)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#FBBF24' }}>👤 {sus.name}</span>
                          <span className="risk-badge risk-high" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {sus.count} FIRs
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', lineHeight: '1.4' }}>
                          <div>📍 <strong>Districts:</strong> {sus.districts.join(', ')}</div>
                          <div style={{ marginTop: '0.2rem' }}>⚠️ <strong>MO (Categories):</strong> {sus.mo.join(', ')}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 🚔 Recommended Police Actions (rule-based engine) */}
              <div className="analytics-card">
                <h3>🚔 Recommended Police Actions</h3>
                <p className="chart-subtitle">Proactive action recommendations · derived from case volume, risk level &amp; 7-day trend</p>
                <div className="police-actions-list">
                  {policeActionRecs.map(rec => (
                    <div className={`police-action-item ${rec.severityClass}-bg`} key={rec.category}>
                      <div className="police-action-header">
                        <span className="police-action-cat">{rec.icon} {rec.category}</span>
                        <div className="police-action-meta">
                          <span className={`risk-badge ${rec.severityClass}`}>{rec.severity}</span>
                          <span className="police-action-trend">{rec.trendSign}{rec.trend}% 7d</span>
                          <span className="police-action-count">{rec.count} cases ({rec.pct}%)</span>
                        </div>
                      </div>
                      <div className="police-action-arrow">→ {rec.action}</div>
                    </div>
                  ))}
                  {policeActionRecs.length === 0 && (
                    <div className="empty-state-container">
                      <p>Register cases to generate action recommendations.</p>
                    </div>
                  )}
                </div>
                <p className="action-engine-note">⚙️ Intelligence engine: rule-based · scalable to ML model integration</p>
              </div>

            </div>

            {/* 🚨 Priority District Monitor */}
            <div className="analytics-card mt-4 priority-monitor-card">
              <div className="cc-header">
                <div>
                  <h3>🚨 Priority District Monitor</h3>
                  <p className="chart-subtitle">Real-time status of all monitored districts · sorted by risk level</p>
                </div>
                <div className="cc-live-badge">
                  <span className="live-dot pulse-dot" />
                  LIVE
                </div>
              </div>
              <div className="priority-district-grid">
                {districtRiskScoresWithOverrides.map((item, idx) => {
                  const isHigh = item.level === 'HIGH';
                  const isMed = item.level === 'MEDIUM';
                  const statusLabel = isHigh ? 'HIGH ALERT' : isMed ? 'WATCH' : 'STABLE';
                  const barColor = isHigh ? 'var(--accent-red)' : isMed ? '#F59E0B' : 'var(--accent-green)';
                  return (
                    <div className={`pd-row ${item.levelClass}-row`} key={item.district}>
                      <div className="pd-left">
                        {isHigh && <span className="pd-pulse-dot pulse-dot" />}
                        {!isHigh && <span className={`pd-dot ${item.levelClass}-dot`} />}
                        <span className="pd-district">{item.district}</span>
                      </div>
                      <div className="pd-center">
                        <span className={`pd-status-tag ${item.levelClass}`}>{statusLabel}</span>
                      </div>
                      <div className="pd-right">
                        <div className="pd-bar-track">
                          <div className="pd-bar-fill" style={{ width: `${Math.max(item.score, 4)}%`, backgroundColor: barColor }} />
                        </div>
                        <span className="pd-score">{item.score}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom row: Crime Link & Network Analysis (SVG Node Graph) */}
            <div className="analytics-card mt-4 timeline-card">
              <h3>🔗 Crime Link & Network Analysis</h3>
              <p className="chart-subtitle">Visualizing associations between Districts, Stations, Categories, and Patterns</p>
              <div className="network-graph-container">
                <svg viewBox="0 0 800 240" className="network-svg">
                  {/* Connectors */}
                  <path d="M 120 120 Q 260 60 400 60" fill="none" stroke="#DCE3EA" strokeWidth="2" strokeDasharray="4,4" />
                  <path d="M 120 120 Q 260 180 400 180" fill="none" stroke="#DCE3EA" strokeWidth="2" strokeDasharray="4,4" />
                  <path d="M 400 60 L 680 120" fill="none" stroke="#DCE3EA" strokeWidth="2" />
                  <path d="M 400 180 L 680 120" fill="none" stroke="#DCE3EA" strokeWidth="2" />
                  <path d="M 680 120 L 740 120" fill="none" stroke="var(--police-gold)" strokeWidth="3" />

                  {/* Node 1: District Core */}
                  <g className="node-group">
                    <circle cx="120" cy="120" r="45" fill="var(--police-blue)" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="120" y="115" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">DISTRICT</text>
                    <text x="120" y="132" textAnchor="middle" fill="var(--police-gold)" fontSize="11" fontWeight="800">
                      {highestDistrict.length > 12 ? highestDistrict.substring(0, 10) + '...' : highestDistrict}
                    </text>
                  </g>

                  {/* Node 2a: Top Station */}
                  <g className="node-group">
                    <circle cx="400" cy="60" r="35" fill="#FFFFFF" stroke="var(--police-blue)" strokeWidth="2" />
                    <text x="400" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">HOTSPOT PS</text>
                    <text x="400" y="70" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                      {highestStation && highestStation.length > 12 ? highestStation.substring(0, 10) + '...' : highestStation || 'N/A'}
                    </text>
                  </g>

                  {/* Node 2b: Top Category */}
                  <g className="node-group">
                    <circle cx="400" cy="180" r="35" fill="#FFFFFF" stroke="var(--police-blue)" strokeWidth="2" />
                    <text x="400" y="175" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">PRIMARY CRIME</text>
                    <text x="400" y="190" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">{mostCommonCategory}</text>
                  </g>

                  {/* Node 3: Link Association */}
                  <g className="node-group">
                    <circle cx="680" cy="120" r="38" fill="#FFFFFF" stroke="var(--accent-red)" strokeWidth="2" />
                    <text x="680" y="115" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">ASSOCIATED</text>
                    <text x="680" y="130" textAnchor="middle" fill="var(--accent-red)" fontSize="9" fontWeight="800">PATTERN</text>
                  </g>

                  {/* Node 4: Action Node */}
                  <g className="node-group">
                    <rect x="735" y="98" width="55" height="44" rx="6" fill="var(--police-gold)" />
                    <text x="762" y="118" textAnchor="middle" fill="#0F4C81" fontSize="9" fontWeight="800">ALERT</text>
                    <text x="762" y="130" textAnchor="middle" fill="#0F4C81" fontSize="8" fontWeight="800">DISPATCH</text>
                  </g>
                </svg>
              </div>
            </div>

          </section>
        ) : activeTab === 'map' ? (
          /* Map View tab */
          <section className="intelligence-dashboard-view">
            <div className="analytics-card map-panel-card" style={{ padding: '1.5rem' }}>
              <div className="cc-header">
                <div>
                  <h3>🗺️ Geospatial Intelligence Map</h3>
                  <p className="chart-subtitle">Real-time geospatial visualization of crime hotspots and active patrol sectors across Karnataka</p>
                </div>
                <div className="cc-live-badge">
                  <span className="live-dot pulse-dot" />
                  LIVE MAP
                </div>
              </div>
              <div className="cc-divider" style={{ margin: '1rem 0 1.5rem 0' }} />
              
              {/* Map Mount Point */}
              <div 
                id="crime-map" 
                style={{ 
                  height: '580px', 
                  width: '100%', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  position: 'relative', 
                  zIndex: 1 
                }} 
              />
              
              <div className="map-footer-notes" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                <span>💡 Tip: Click on district hotspot circles or case pin markers to view detailed stats and dispatches.</span>
                <span>🟢 Connected to Catalyst Data Store API</span>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      {/* Selected Case Details / Edit Modal */}
      {selectedCase && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>🛡️ Case Record Details</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>&times;</button>
            </header>
            
            <div className="modal-body">
              {updateError && (
                <div className="alert error">
                  ❌ Error: {updateError}
                </div>
              )}

              {showDeleteConfirm ? (
                /* Delete Confirmation View */
                <div className="delete-confirm-view">
                  <h4>⚠️ Confirm Case Deletion</h4>
                  <p>Are you sure you want to delete case <strong>{selectedCase.fir_number}</strong>?</p>
                  <p className="warning-note">This action is permanent and will delete the record from the database.</p>
                  <div className="modal-actions gap-2">
                    <button 
                      className="confirm-delete-btn" 
                      onClick={handleDeleteCase}
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Deleting...' : 'Yes, Delete Record'}
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={updateLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                /* Edit Case Form View */
                <form onSubmit={handleSaveUpdate} className="crime-form">
                  <div className="form-group">
                    <label htmlFor="edit_fir_number">FIR Number <span className="required-asterisk">*</span></label>
                    <input
                      type="text"
                      id="edit_fir_number"
                      name="fir_number"
                      value={editFormData.fir_number}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit_category">Category <span className="required-asterisk">*</span></label>
                      <select
                        id="edit_category"
                        name="category"
                        value={editFormData.category}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="Theft">Theft</option>
                        <option value="Cybercrime">Cybercrime</option>
                        <option value="Assault">Assault</option>
                        <option value="Fraud">Fraud</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_district">District <span className="required-asterisk">*</span></label>
                      <select
                        id="edit_district"
                        name="district"
                        value={editFormData.district}
                        onChange={handleEditInputChange}
                        required
                      >
                        {ALL_DISTRICTS.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_police_station">Police Station <span className="required-asterisk">*</span></label>
                    <select
                      id="edit_police_station"
                      name="police_station"
                      value={editFormData.police_station}
                      onChange={handleEditInputChange}
                      required
                    >
                      {(DISTRICT_STATIONS[editFormData.district] || []).map(ps => (
                        <option key={ps} value={ps}>{ps}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_incident_date">Incident Date & Time <span className="required-asterisk">*</span></label>
                    <input
                      type="datetime-local"
                      id="edit_incident_date"
                      name="incident_date"
                      value={editFormData.incident_date}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                   <div className="form-group">
                    <label htmlFor="edit_officer">Assigned Officer</label>
                    <input
                      type="text"
                      id="edit_officer"
                      name="officer"
                      value={editFormData.officer}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit_priority">Case Priority</label>
                      <select
                        id="edit_priority"
                        name="priority"
                        value={editFormData.priority}
                        onChange={handleEditInputChange}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_status">Case Status</label>
                      <select
                        id="edit_status"
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                      >
                        <option value="FIR Registered">FIR Registered</option>
                        <option value="Officer Assigned">Officer Assigned</option>
                        <option value="Evidence Collection">Evidence Collection</option>
                        <option value="Charge Sheet">Charge Sheet Filed</option>
                        <option value="Closed">Case Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_summary">Case Summary <span className="required-asterisk">*</span></label>
                    <textarea
                      id="edit_summary"
                      name="summary"
                      value={editFormData.summary}
                      onChange={handleEditInputChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="save-btn" disabled={updateLoading}>
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={updateLoading}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (() => {
                  const meta = parseCaseMetadata(selectedCase);
                  const workflowSteps = [
                    { label: 'FIR Registered', icon: '📝' },
                    { label: 'Officer Assigned', icon: '👤' },
                    { label: 'Evidence Collection', icon: '🔍' },
                    { label: 'Charge Sheet', icon: '⚖️' },
                    { label: 'Closed', icon: '🟢' }
                  ];
                  const currentStepIndex = workflowSteps.findIndex(s => s.label === meta.status);
                  const activeStepIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

                  return (
                    <div className="details-view">
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="label">FIR Number</span>
                          <span className="val fir-code copy-container">
                            {selectedCase.fir_number}
                            <button 
                              type="button"
                              className="copy-fir-btn" 
                              onClick={() => copyToClipboard(selectedCase.fir_number, "FIR Number")}
                              title="Copy FIR Number to Clipboard"
                            >
                              📋 Copy
                            </button>
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Category</span>
                          <span className={`category-tag ${selectedCase.category.toLowerCase()}`}>{selectedCase.category}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">District</span>
                          <span className="val">{selectedCase.district}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Police Station</span>
                          <span className="val">{selectedCase.police_station}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Incident Date</span>
                          <span className="val">{selectedCase.incident_date}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Assigned Officer</span>
                          <span className="val" style={{ fontWeight: '700', color: '#60A5FA' }}>{meta.officer}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Priority Level</span>
                          <span className={`risk-badge risk-${meta.priority.toLowerCase()}`} style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', textAlign: 'center', width: 'fit-content' }}>
                            {meta.priority}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Coordinates (Geospatial)</span>
                          <span className="val coordinate-val">
                            Lat: {selectedCase.latitude?.toFixed(4) || "0.0000"}, Lng: {selectedCase.longitude?.toFixed(4) || "0.0000"}
                          </span>
                        </div>
                      </div>

                      {/* Case Workflow Timeline Stepper */}
                      <div className="workflow-stepper-container" style={{ margin: '2rem 0', background: '#F8FAFC', padding: '1.25rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span className="label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: '1.25rem' }}>Investigation Workflow Timeline</span>
                        <div className="stepper-track" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
                          <div className="stepper-line-bg" style={{ position: 'absolute', height: '4px', left: '25px', right: '25px', backgroundColor: '#E2E8F0', zIndex: 0 }} />
                          <div className="stepper-line-fill" style={{ position: 'absolute', height: '4px', left: '25px', width: `calc(${(activeStepIndex / (workflowSteps.length - 1)) * 100}% - ${activeStepIndex === 4 ? '10px' : '0px'})`, backgroundColor: '#1565C0', transition: 'width 0.4s ease', zIndex: 0 }} />
                          
                          {workflowSteps.map((step, idx) => {
                            const isCompleted = idx <= activeStepIndex;
                            const isActive = idx === activeStepIndex;
                            const dotBorder = isCompleted ? '2px solid #1565C0' : '2px solid #D1D5DB';
                            const textColor = isCompleted ? '#1F2937' : '#9CA3AF';
                            
                            return (
                              <div key={step.label} className="stepper-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative', width: '50px' }}>
                                <div 
                                  className="stepper-icon-circle" 
                                  style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    backgroundColor: isCompleted ? '#E0F2FE' : '#FFFFFF', 
                                    border: dotBorder,
                                    boxShadow: isActive ? '0 0 10px rgba(21, 101, 192, 0.4)' : 'none',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  {step.icon}
                                </div>
                                <span 
                                  style={{ 
                                    fontSize: '0.6rem', 
                                    fontWeight: isActive ? '800' : '500', 
                                    color: textColor, 
                                    marginTop: '0.5rem', 
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Summary Module */}
                      <div className="ai-summary-module" style={{ margin: '1.5rem 0', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF9E6 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            🤖 KSP Case Intelligence Copilot
                          </span>
                          {aiSummary && (
                            <button 
                              type="button" 
                              onClick={() => setAiSummary(null)} 
                              style={{ background: 'none', border: 'none', color: '#78350F', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {!aiSummary && !generatingSummary && (
                          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                            <button 
                              type="button" 
                              className="tab-btn active" 
                              onClick={() => generateAISummary(selectedCase)}
                              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', background: '#F59E0B', border: 'none', color: '#FFFFFF', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                              ⚡ Generate AI Case Summary &amp; Recommendations
                            </button>
                          </div>
                        )}

                        {generatingSummary && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '1rem 0', color: '#78350F', fontSize: '0.8rem' }}>
                            <span className="live-dot pulse-dot" style={{ backgroundColor: '#F59E0B' }} />
                            <span>Analyzing case files and compiling intelligence report...</span>
                          </div>
                        )}

                        {aiSummary && (
                          <div className="ai-report-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem', color: '#374151', marginTop: '1rem', borderTop: '1px solid rgba(245, 158, 11, 0.2)', paddingTop: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div style={{ background: '#FFFFFF', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#78350F', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Victim Profile</div>
                                <div style={{ fontWeight: '600' }}>👤 {aiSummary.victim}</div>
                              </div>
                              <div style={{ background: '#FFFFFF', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#78350F', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Suspect Details</div>
                                <div style={{ fontWeight: '600' }}>🔍 {aiSummary.suspect}</div>
                              </div>
                            </div>

                            <div style={{ background: '#FFFFFF', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#78350F', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Key Evidence Logs</div>
                              <div style={{ fontWeight: '500' }}>📁 {aiSummary.evidence}</div>
                            </div>

                            <div style={{ background: '#FFFFFF', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Suggested Next Steps (Patrol &amp; Investigation)</div>
                              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.45', color: '#1E40AF' }}>{aiSummary.nextSteps}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="detail-item summary-item">
                        <span className="label">Case Summary Description</span>
                        <p className="val summary-text" style={{ whiteSpace: 'pre-wrap' }}>{meta.cleanSummary}</p>
                      </div>

                      <div className="modal-actions">
                        <button type="button" className="print-btn" onClick={handlePrintCase} title="Open print preview for this FIR summary">
                          🖨️ Print FIR
                        </button>
                        <button className="edit-btn" onClick={handleEditClick}>
                          ✏️ Edit Case
                        </button>
                        <button className="delete-btn-modal" onClick={() => setShowDeleteConfirm(true)}>
                          🗑️ Delete Record
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App


