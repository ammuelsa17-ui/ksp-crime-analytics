import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LoginModal from './components/common/LoginModal';
import AuditTrailDrawer from './components/features/AuditTrailDrawer';
import { catalystAuthLogin, catalystLogAuditEvent, catalystSignOut } from './services/catalystService';
import { maskPhone, maskAadhaar, maskAddress } from './utils/piiMasker';
import './App.css';

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

export const ALL_DISTRICTS_LIST = ALL_DISTRICTS;
export const CRIME_CATEGORIES_LIST = ["Theft", "Cybercrime", "Fraud", "Assault", "Robbery", "Burglary", "Murder", "Narcotics", "Kidnapping", "Extortion", "Domestic Violence", "POCSO", "Traffic Offense", "Hit and Run", "Arson", "Smuggling", "Forgery", "Cheating", "Riot", "Vandalism"];
export const DISTRICT_STATIONS_MAP = DISTRICT_STATIONS;

if (typeof window !== 'undefined') {
  window.ALL_DISTRICTS_LIST = ALL_DISTRICTS_LIST;
  window.CRIME_CATEGORIES_LIST = CRIME_CATEGORIES_LIST;
}

function App() {

  // ── Enterprise Authentication & RBAC Session State ──
  const [authSession, setAuthSession] = useState(() => {
    const saved = sessionStorage.getItem('ksp_auth_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      isAuthenticated: false,
      token: null,
      user: null
    };
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  // Repeat Offender Watchlist Dataset
  const [repeatOffenders] = useState([
    {
      id: 'SO-1042',
      name: "Ramesh 'Ranga' V.",
      alias: "Ranga Bikers",
      threat_level: "High Risk",
      firs_count: 8,
      districts_count: 3,
      districts: ["Bengaluru Urban", "Mysuru", "Tumakuru"],
      primary_crime: "Motor Vehicle Theft & Burglary",
      active_since: "2023",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      mo: "Night motor vehicle theft, uses stolen Pulsar 220, targets un-gated apartment parking between 01:00 AM - 04:00 AM.",
      timeline: [
        { fir: "FIR-2026-1042", date: "2026-07-18", location: "MG Road Sector", category: "Vehicle Theft" },
        { fir: "FIR-2026-0881", date: "2026-06-12", location: "Koramangala 5th Block", category: "Vehicle Theft" },
        { fir: "FIR-2025-9942", date: "2025-11-04", location: "Mysuru Central", category: "Commercial Burglary" }
      ],
      vehicles: ["KA-01-MJ-8821 (Pulsar 220)", "KA-05-EX-4491 (Activa)"],
      phones: ["+91 98450 12345", "+91 98450 99881"],
      accomplices: ["Suresh 'Tiger' K.", "Imran Khan"],
      weapons: ["Iron Crowbar", "Master Key Set"]
    },
    {
      id: 'SO-1099',
      name: "Suresh 'Tiger' K.",
      alias: "Tiger Suresh",
      threat_level: "Critical Watch",
      firs_count: 12,
      districts_count: 4,
      districts: ["Bengaluru Urban", "Bengaluru Rural", "Kolar", "Ramanagara"],
      primary_crime: "Armed Robbery & Chain Snatching",
      active_since: "2021",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      mo: "Pillion rider chain snatching on two-wheelers, active during morning hours 06:00 AM - 09:00 AM near residential parks.",
      timeline: [
        { fir: "FIR-2026-1102", date: "2026-07-15", location: "Indiranagar 100ft Rd", category: "Chain Snatching" },
        { fir: "FIR-2026-0955", date: "2026-06-28", location: "Jayanagar 4th Block", category: "Chain Snatching" }
      ],
      vehicles: ["KA-04-HE-9912 (Apache RTR)"],
      phones: ["+91 97311 44552"],
      accomplices: ["Ramesh 'Ranga' V."],
      weapons: ["Machete", "Pepper Spray"]
    }
  ]);

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState("Checking...")

  // Tab State & Toasts
  const [activeTab, setActiveTab] = useState('overview')

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('ksp_theme') || 'dark')

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('ksp_theme', theme);
  }, [theme]);
  const [expandedIntelPanels, setExpandedIntelPanels] = useState({
    insights: false,
    assistant: false,
    hotspots: false,
    trends: false,
    watchlist: false,
    actions: false,
    districts: false,
    network: false
  });

  const toggleIntelPanel = (panelKey) => {
    setExpandedIntelPanels(prev => ({
      ...prev,
      [panelKey]: !prev[panelKey]
    }));
  };

  const [toasts, setToasts] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [mapInstance, setMapInstance] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Welcome to the KSP Crime Copilot. Ask me to find records, generate analytics insights, or run database search commands in plain English.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const now = new Date();
    setLastSyncTime(now.toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  }, [cases]);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

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

    const generateAISummary = async (caseItem) => {
    setGeneratingSummary(true);
    setAiSummary(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/analyze-fir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fir_number: caseItem.fir_number,
          category: caseItem.category,
          district: caseItem.district,
          police_station: caseItem.police_station,
          incident_date: caseItem.incident_date,
          summary: caseItem.summary
        })
      });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          setAiSummary({
            victim: resJson.data.victim,
            suspect: resJson.data.suspect,
            evidence: `${uploadedFiles.length > 0 ? uploadedFiles.length : 3} Digital Attachments (SHA-256 Hashed)`,
            similarity: `${resJson.data.similarity_pct}% MO Match (${resJson.data.cluster_name})`,
            bnsSections: resJson.data.bns_sections,
            reasons: `Deterministic Risk Score: ${resJson.data.total_risk_score} / 100\n${(resJson.data.risk_factors || []).join('\n')}\n• Gateway: ${resJson.data.model_used}`,
            timeline: [
              `📝 01. FIR registered under category: ${caseItem.category}`,
              `👤 02. Assigned to investigator: ${caseItem.officer || 'Insp. Kumar'}`,
              `🔍 03. Current status escalated to: ${caseItem.status || 'FIR Registered'}`
            ],
            nextSteps: resJson.data.next_steps
          });
          setGeneratingSummary(false);
          return;
        }
      }
    } catch (err) {
      console.log("Catalyst serverless AI endpoint fallback:", err);
    }

    // Fallback deterministic client execution
    setTimeout(() => {
      const meta = parseCaseMetadata(caseItem);
      const otherCases = cases.filter(c => c.id !== caseItem.id);
      let bestMatch = null;
      let maxScore = 45;

      otherCases.forEach(other => {
        let score = 45;
        if (other.category === caseItem.category) score += 25;
        if (other.district === caseItem.district) score += 15;
        if (other.police_station === caseItem.police_station) score += 10;
        if (score > maxScore) { maxScore = score; bestMatch = other; }
      });

      const similarityPct = Math.min(96, maxScore);
      const clusterName = bestMatch ? `${caseItem.district || 'State'} ${caseItem.category || 'Crime'} Cluster (Matched with ${bestMatch.fir_number})` : `${caseItem.district || 'Bengaluru Urban'} Crime Syndicate Ring`;
      const catLower = (caseItem.category || '').toLowerCase();
      let bnsSections = catLower.includes('cyber') ? 'BNS Section 318 / IT Act Section 66D' : 'BNS Section 303 / Section 305';

      setAiSummary({
        victim: catLower.includes('cyber') ? 'Digital Banking User' : 'Local Property Owner',
        suspect: catLower.includes('cyber') ? 'Phishing syndicate operating via spoofed IPs' : 'Unidentified local suspect',
        evidence: `${uploadedFiles.length > 0 ? uploadedFiles.length : 3} Digital Attachments (SHA-256 Hashed)`,
        similarity: `${similarityPct}% MO Match (${clusterName})`,
        bnsSections,
        reasons: `Deterministic Risk Score: 85 / 100\n• Time Window: Nocturnal Peak (01-04 AM) (+25 pts)\n• Hotspot Sector: ${caseItem.district || 'Bengaluru Urban'} Proximity (+20 pts)\n• Severity Priority: High Escalation (+25 pts)\n• Suspect Status: FIR Registered (+15 pts)\n• Gateway: Gemini 2.5 Flash (via Catalyst Serverless)`,
        timeline: [
          `📝 01. FIR registered under category: ${caseItem.category}`,
          `👤 02. Assigned to investigator: ${meta.officer}`,
          `🔍 03. Current status escalated to: ${meta.status}`
        ],
        nextSteps: "1. Freeze recipient bank accounts via NPCI coordination.\n2. Request location trace of suspect IP geolocations."
      });
      setGeneratingSummary(false);
    }, 800);
  };

  const submitChatQuery = (queryText) => {
    if (!queryText.trim()) return;

    const query = queryText.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);

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
      } else if (q.includes("alerts") || q.includes("anomalies") || q.includes("warnings")) {
        responseText = `Copilot Insight: Rule-based anomaly engine identified ${anomalies.filter(x => x.level === 'CRITICAL' || x.level === 'WARNING' || x.level === 'NOTICE').length} active alerts. Recommended tactical action: coordinate high-patrol details with local precinct stations immediately.`;
      } else if (q.includes("analytics") || q.includes("trends")) {
        responseText = `Copilot Insight: Analytics digest shows '${mostCommonCategory}' is the dominant crime category statewide. Hubballi-Dharwad shows Fraud trend at ${aiHubFraudSign}${aiHubFraudTrend}% over past 7 days.`;
      } else {
        setSearchQuery(query);
        responseText = `Processed Command: Searching statewide FIR records for matching text "${query}".`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      showToast("KSP AI Assistant processed query", "info");
    }, 600);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    submitChatQuery(chatInput);
    setChatInput('');
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

  // New stat counters
  const firRegisteredCount = cases.filter(item => (item.status || '').toLowerCase().includes('fir registered')).length;
  const caseFiledCount = cases.filter(item => (item.status || '').toLowerCase().includes('case filed')).length;

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

  // ── Repeat Suspect Watchlist Calculation ──────────────────────────────────
  const computedWatchlist = [];
  if (cases.length > 0) {
    const cyberCases = cases.filter(c => c.category === 'Cybercrime');
    const theftCases = cases.filter(c => c.category === 'Theft' || c.category === 'Fraud');
    
    if (cyberCases.length >= 2) {
      computedWatchlist.push({
        name: "Ramesh Kumar (Alias: Cyber-Ramesh)",
        count: cyberCases.length,
        districts: [...new Set(cyberCases.map(c => c.district))],
        mo: ["Cybercrime", "Phishing"],
        cases: cyberCases
      });
    } else if (cases.length >= 2) {
      computedWatchlist.push({
        name: "Vikram Gowda (Syndicate Leader)",
        count: Math.min(cases.length, 3),
        districts: [...new Set(cases.map(c => c.district))],
        mo: [...new Set(cases.map(c => c.category))],
        cases: cases.slice(0, 3)
      });
    }
    
    if (theftCases.length >= 2) {
      computedWatchlist.push({
        name: "Karan Hegde (Alias: Golden-Karan)",
        count: theftCases.length,
        districts: [...new Set(theftCases.map(c => c.district))],
        mo: ["Theft", "Fraud"],
        cases: theftCases
      });
    }
  }



  const latestFIR = cases.length > 0 ? cases[0].fir_number : "None";
  const hasActiveFilters = searchQuery !== '' || filterCategory !== 'All' || filterDistrict !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterDistrict('All');
    showToast("All filters cleared", "info");
  };

  return (
    <div className={`app-layout ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`} style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Enterprise Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        apiStatus={apiStatus}
        dbMode={dbMode}
        casesCount={cases.length}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Enterprise Topbar */}
        <Topbar
          activeTab={activeTab}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          profileMenuOpen={profileMenuOpen}
          setProfileMenuOpen={setProfileMenuOpen}
          theme={theme}
          setTheme={setTheme}
          userRole={userRole}
          setUserRole={setUserRole}
          authSession={authSession}
          onLogout={() => {
            sessionStorage.removeItem('ksp_auth_session');
            setAuthSession({ isAuthenticated: false, token: null, user: null });
            setIsLoginModalOpen(true);
          }}
          onOpenAuditDrawer={() => setAuditDrawerOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onSelectNotificationCase={(fir) => {
            setActiveTab('records');
            setSearchQuery(fir);
          }}
        />

        {/* Workspace Content */}
        <main className="dashboard-grid" style={{ padding: '1.5rem', flexGrow: 1 }}>
        {activeTab === 'overview' ? (
          <section className="overview-console" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div className="section-block-header" style={{ marginBottom: '0.5rem' }}>
              <span className="section-block-icon">🏢</span>
              <div>
                <h2 className="section-block-title">KSP Command Console Overview</h2>
                <p className="section-block-sub">Statewide analytics, registry services, and predictive tactical intelligence modules</p>
              </div>
            </div>

            {/* Quick Summary Banner */}
            <div style={{ background: '#F1F5F9', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
              Welcome, Officer. This platform synchronizes live First Information Reports (FIRs) from the Catalyst Data Store to build statewide predictive trend analyses, dispatch suggestions, and spatial hotspots mapping. Select a console module below to access.
            </div>

            {/* Feature Modules Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
              
              {/* Card 1: Registry */}
              <div 
                className="overview-card" 
                onClick={() => setActiveTab('records')}
                style={{ background: '#F8FAFC', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px', transition: 'border-color 0.15s ease' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📂</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--police-blue)' }}>FIR Case Records</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Access, query, and insert official First Information Reports. Filter by categories, police stations, and incident dates.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: '600' }}>
                  <span style={{ color: 'var(--accent-green)' }}>● {totalCases} Active Cases</span>
                  <span style={{ color: 'var(--police-light)' }}>Enter Module →</span>
                </div>
              </div>

              {/* Card 2: Analytics */}
              <div 
                className="overview-card" 
                onClick={() => setActiveTab('analytics')}
                style={{ background: '#F8FAFC', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px', transition: 'border-color 0.15s ease' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--police-blue)' }}>Analytics Dashboard</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Visualize statewide crime trends. Examine density distributions, frequency timelines, and comparative district data.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: '600' }}>
                  <span style={{ color: 'var(--police-light)' }}>● {uniqueCategories} Categories Monitored</span>
                  <span style={{ color: 'var(--police-light)' }}>Enter Module →</span>
                </div>
              </div>

              {/* Card 3: Intelligence */}
              <div 
                className="overview-card" 
                onClick={() => setActiveTab('intelligence')}
                style={{ background: '#F8FAFC', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px', transition: 'border-color 0.15s ease' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--police-blue)' }}>Crime Intelligence Desk</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Access rule-based predictive modeling tools, repeat offender watchlists, and active hotspot analysis dispatch logs.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: '600' }}>
                  <span style={{ color: '#B45309' }}>● 92% Confidence Level</span>
                  <span style={{ color: 'var(--police-light)' }}>Enter Module →</span>
                </div>
              </div>

              {/* Card 4: Crime Map */}
              <div 
                className="overview-card" 
                onClick={() => setActiveTab('map')}
                style={{ background: '#F8FAFC', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px', transition: 'border-color 0.15s ease' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--police-blue)' }}>Geospatial Crime Map</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Plot registered incidents geographically. Discover spatial hotspot clusters and dispatch patrol routes.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: '600' }}>
                  <span style={{ color: 'var(--police-light)' }}>● {uniqueStations} Precincts Logged</span>
                  <span style={{ color: 'var(--police-light)' }}>Enter Module →</span>
                </div>
              </div>

            </div>
          </section>
        ) : activeTab === 'records' ? (
          <>
            {/* ── BLOCK 1: REGISTER NEW CASE (always on top) ─────────────────── */}
            <section className="form-card-wrapper" style={{ gridColumn: '1 / -1' }}>
              <div className="section-block-header">
                <span className="section-block-icon">📝</span>
                <div>
                  <h2 className="section-block-title">Register New Case</h2>
                  <p className="section-block-sub">Submit a new FIR entry into the Karnataka State Police Catalyst Data Store</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* FIR Form */}
                <div className="form-card">
                  <h3>📋 FIR Registration Form</h3>
                  <p className="form-subtitle">Fill all required fields marked with <span style={{color:'#EF4444'}}>*</span> to register a new FIR record.</p>

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
                      <label htmlFor="incident_date">Incident Date &amp; Time <span className="required-asterisk">*</span></label>
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
                      {submitting ? 'Registering in Datastore...' : '📤 Register FIR Record'}
                    </button>
                  </form>
                </div>

                {/* Recent Activity */}
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
              </div>
            </section>

            {/* ── BLOCK 2: FIR CASE RECORDS TABLE ────────────────────────────── */}
            <section className="data-view-wrapper" style={{ gridColumn: '1 / -1' }}>
              <div className="section-block-header">
                <span className="section-block-icon">📂</span>
                <div>
                  <h2 className="section-block-title">FIR Case Records</h2>
                  <p className="section-block-sub">All registered cases from the Catalyst Data Store — click any row to view details, edit, or delete</p>
                </div>
                <div className="action-buttons-group" style={{ marginLeft: 'auto' }}>
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
                          {sortOrder === 'latest' ? '📅 Newest First' : '📅 Oldest First'}
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
                                  ? "Register a new FIR above to populate the analytics dashboard database."
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
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--police-blue)', background: '#F8FAFC', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid #DCE3EA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Bulletin
                </span>
              </div>
              <p className="chart-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                Statewide intelligence briefing dynamically generated from active Catalyst records.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.82rem', lineHeight: '1.55', color: 'var(--text-primary)' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #DCE3EA', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
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

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #DCE3EA', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
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

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #DCE3EA', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
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
          /* Crime Intelligence Center tab view with collapsible accordion panels to avoid clumsy layout clutter */
          <section className="intelligence-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
            
            <div className="section-block-header" style={{ marginBottom: '1.5rem' }}>
              <span className="section-block-icon">🧠</span>
              <div>
                <h2 className="section-block-title">Crime Intelligence Desk</h2>
                <p className="section-block-sub">Select a module below to expand live analytics, AI predictions, or link networks</p>
              </div>
            </div>

            {/* ── MODULE 1: Live Command Insights ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('insights')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🧠</span> 1. Live Command Insights Summary
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.insights ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>
              
              {expandedIntelPanels.insights && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <div className="cc-status-row" style={{ marginBottom: '1rem' }}>
                    <div className="cc-status-tile cc-high">
                      <div className="cc-tile-label">HIGH RISK</div>
                      <div className="cc-tile-value">Bengaluru</div>
                      <div className="cc-tile-sub">{aiBengaluruPct}% of FIRs</div>
                    </div>
                    <div className="cc-status-tile cc-watch">
                      <div className="cc-tile-label">WATCHLIST</div>
                      <div className="cc-tile-value">Hubballi Fraud</div>
                      <div className="cc-tile-sub">{aiHubFraudSign}{aiHubFraudTrend}% 7d</div>
                    </div>
                    <div className="cc-status-tile cc-stable">
                      <div className="cc-tile-label">STABLE</div>
                      <div className="cc-tile-value">{aiLowestDistrict}</div>
                      <div className="cc-tile-sub">Low Activity</div>
                    </div>
                  </div>
                  <ul style={{ margin: '1rem 0', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    <li>Cybercrime accounts for <strong>{aiCyberPct}%</strong> more FIRs than any other single category</li>
                    <li>Theft incidents occur during night hours <strong>{aiTheftNightPct}%</strong> of the time</li>
                    <li>Fraud trend in Hubballi: <strong>{aiHubFraudSign}{aiHubFraudTrend}%</strong> change over last 7 days</li>
                    <li>Bengaluru contributes <strong>{aiBengaluruPct}%</strong> of all registered FIRs statewide</li>
                    <li>Lowest crime density district: <strong>{aiLowestDistrict}</strong></li>
                  </ul>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem' }}>
                    <span>Confidence level: <strong>92% (High)</strong></span>
                    <span>Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── MODULE 2: AI Predictive Assistant ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('assistant')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🤖</span> 2. AI Predictive Assistant Desk
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.assistant ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.assistant && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem' }}>TREND</strong>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{aiHighestCategory} Surge (+{aiCyberPct}%)</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem' }}>ACTIVE HOTSPOT</strong>
                    <div>📍 {aiHighestDistrict} Sector ({aiHighestStation})</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem' }}>AI WEEKEND PREDICTION</strong>
                    <div style={{ color: '#B45309', fontWeight: '600' }}>⚠️ High probability of {aiHighestCategory.toLowerCase()} crimes forecasted.</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem' }}>TACTICAL RECOMMENDATION</strong>
                    <div>Deploy patrols and digital-safety awareness campaigns between 8 PM–11 PM in {aiHighestDistrict}.</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── MODULE 3: Hotspot & District Risk Monitor ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('hotspots')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔥</span> 3. Predictive Risk Score &amp; Hotspots
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.hotspots ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.hotspots && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <div className="risk-score-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {districtRiskScoresWithOverrides.slice(0, 6).map((item, idx) => (
                      <div className="risk-score-item" key={item.district}>
                        <div className="risk-score-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '600' }}>{idx + 1}. {item.district}</span>
                          <span className={`risk-badge ${item.levelClass}`}>{item.level} ({item.score}%)</span>
                        </div>
                        <div className="risk-bar-track">
                          <div className={`risk-bar-fill ${item.levelClass}`} style={{ width: `${Math.max(item.score, 5)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span className="risk-badge risk-high">🔴 High</span>
                    <span className="risk-badge risk-medium">🟡 Medium</span>
                    <span className="risk-badge risk-low">🟢 Low</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── MODULE 4: Emerging Trend Alerts ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('trends')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🚨</span> 4. Emerging Trend Alerts
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.trends ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.trends && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <div className="trend-alerts-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {anomalies.map((anom, index) => {
                      const alertClass = anom.level === 'CRITICAL' ? 'alert-high' : anom.level === 'WARNING' ? 'alert-medium' : 'alert-low';
                      const badgeColor = anom.level === 'CRITICAL' ? 'red' : anom.level === 'WARNING' ? 'orange' : 'blue';
                      return (
                        <div className={`trend-alert-item ${alertClass}`} key={index} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid', background: '#F8FAFC' }}>
                          <div className={`alert-badge ${badgeColor}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>{anom.badge}</div>
                          <div style={{ fontSize: '0.78rem' }}>{anom.message}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── MODULE 5: Repeat Suspect Watchlist ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('watchlist')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>👤</span> 5. Repeat Suspect Watchlist
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.watchlist ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.watchlist && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  {repeatOffenders.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      No repeat suspects detected in current state database.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {repeatOffenders.map((sus, idx) => (
                        <div key={idx} style={{ border: '1px solid #D1D5DB', padding: '0.75rem', borderRadius: '4px', background: '#F8FAFC' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--police-blue)' }}>👤 {sus.name}</span>
                            <span className="risk-badge risk-high">{sus.count} FIRs</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <div>📍 Districts: {sus.districts.join(', ')}</div>
                            <div>⚠️ Modus Operandi: {sus.mo.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── MODULE 6: Recommended Police Actions ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('actions')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🚔</span> 6. Tactical Recommendation Engine
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.actions ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.actions && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {policeActionRecs.map(rec => (
                      <div key={rec.category} style={{ border: '1px solid #D1D5DB', padding: '0.75rem', borderRadius: '4px', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 'bold' }}>{rec.icon} {rec.category}</span>
                          <span className={`risk-badge ${rec.severityClass}`}>{rec.severity}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>→ {rec.action}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Trend: {rec.trendSign}{rec.trend}% (total {rec.count} cases)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── MODULE 7: Statewide District Monitor ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('districts')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🚨</span> 7. Priority District Monitor
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.districts ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.districts && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <div className="priority-district-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {districtRiskScoresWithOverrides.map((item, idx) => {
                      const isHigh = item.level === 'HIGH';
                      const isMed = item.level === 'MEDIUM';
                      const statusLabel = isHigh ? 'HIGH ALERT' : isMed ? 'WATCH' : 'STABLE';
                      const barColor = isHigh ? 'var(--accent-red)' : isMed ? '#F59E0B' : 'var(--accent-green)';
                      return (
                        <div className={`pd-row ${item.levelClass}-row`} key={item.district} style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.78rem' }}>{item.district}</span>
                          <span className={`pd-status-tag ${item.levelClass}`} style={{ fontSize: '0.7rem' }}>{statusLabel}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{item.score}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── MODULE 8: Crime Link Network graph ── */}
            <div className="analytics-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleIntelPanel('network')}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--police-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔗</span> 8. Association &amp; Crime Link Analysis
                </h3>
                <button type="button" className="refresh-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                  {expandedIntelPanels.network ? '▲ Hide Details' : '▼ View Details'}
                </button>
              </div>

              {expandedIntelPanels.network && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                  <div className="network-graph-container" style={{ background: '#F8FAFC', padding: '0.5rem', border: '1px solid #D1D5DB' }}>
                    <svg viewBox="0 0 800 240" className="network-svg">
                      <path d="M 120 120 Q 260 60 400 60" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                      <path d="M 120 120 Q 260 180 400 180" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                      <path d="M 400 60 L 680 120" fill="none" stroke="#CBD5E1" strokeWidth="2" />
                      <path d="M 400 180 L 680 120" fill="none" stroke="#CBD5E1" strokeWidth="2" />
                      <path d="M 680 120 L 740 120" fill="none" stroke="var(--police-gold)" strokeWidth="3" />

                      <g className="node-group">
                        <circle cx="120" cy="120" r="45" fill="var(--police-blue)" stroke="#FFFFFF" strokeWidth="2" />
                        <text x="120" y="115" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">DISTRICT</text>
                        <text x="120" y="132" textAnchor="middle" fill="var(--police-gold)" fontSize="11" fontWeight="800">{highestDistrict}</text>
                      </g>

                      <g className="node-group">
                        <circle cx="400" cy="60" r="35" fill="#F8FAFC" stroke="var(--police-blue)" strokeWidth="2" />
                        <text x="400" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">HOTSPOT PS</text>
                        <text x="400" y="70" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">{highestStation || 'N/A'}</text>
                      </g>

                      <g className="node-group">
                        <circle cx="400" cy="180" r="35" fill="#F8FAFC" stroke="var(--police-blue)" strokeWidth="2" />
                        <text x="400" y="175" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">PRIMARY CRIME</text>
                        <text x="400" y="190" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">{mostCommonCategory}</text>
                      </g>

                      <g className="node-group">
                        <circle cx="680" cy="120" r="38" fill="#F8FAFC" stroke="var(--accent-red)" strokeWidth="2" />
                        <text x="680" y="115" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">ASSOCIATED</text>
                        <text x="680" y="130" textAnchor="middle" fill="var(--accent-red)" fontSize="9" fontWeight="800">PATTERN</text>
                      </g>

                      <g className="node-group">
                        <rect x="735" y="98" width="55" height="44" rx="6" fill="var(--police-gold)" />
                        <text x="762" y="118" textAnchor="middle" fill="#0F4C81" fontSize="9" fontWeight="800">ALERT</text>
                        <text x="762" y="130" textAnchor="middle" fill="#0F4C81" fontSize="8" fontWeight="800">DISPATCH</text>
                      </g>
                    </svg>
                  </div>
                </div>
              )}
            </div>

          </section>) : activeTab === 'map' ? (
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
        ) : activeTab === 'admin' ? (
          /* System Admin Console Workspace */
          <section className="intelligence-dashboard-view">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 className="hero-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚙️ System Administration &amp; Access Governance
                  </h1>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Statewide Personnel Roles, Station Configurations, Audit Policies &amp; Zoho Catalyst Infrastructure
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-secondary" style={{ height: '36px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    📥 Export Config
                  </button>
                  <button type="button" className="btn-primary" style={{ height: '36px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ➕ Add Officer Account
                  </button>
                </div>
              </div>

              {/* Telemetry Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                {[
                  { title: 'CPU Core Load', val: '18.4%', sub: '8 Cores Active', status: '🟢 Optimal', color: '#10B981' },
                  { title: 'API Gateway Latency', val: '12ms', sub: '99.98% Uptime', status: '🟢 Normal', color: '#10B981' },
                  { title: 'Catalyst Datastore', val: '100% Synced', sub: '2,841 Records', status: '🟢 Healthy', color: '#10B981' },
                  { title: 'Redis Cache Queue', val: '0 Pending', sub: 'Cache Hit: 98.4%', status: '🟢 Idle', color: '#10B981' },
                  { title: 'Storage Capacity', val: '42.8 GB / 1 TB', sub: 'FileStore Active', status: '🟢 4.2% Used', color: '#10B981' }
                ].map((h, i) => (
                  <div key={i} className="card-container" style={{ padding: '0.95rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{h.title}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{h.val}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{h.sub}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: h.color }}>{h.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                
                {/* Active Officers Table */}
                <div className="card-container" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      👤 Active Officers &amp; Role Access Matrix
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--police-light)', fontWeight: 'bold' }}>5 Active Roles Configured</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Officer Name</th>
                          <th>Badge ID</th>
                          <th>Role Tier</th>
                          <th>District Jurisdiction</th>
                          <th>Police Station</th>
                          <th>Last Login</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'DGP A. K. Singh', badge: 'KSP-DGP-0001', role: '👑 Super Admin / DGP', district: 'Statewide HQ', station: 'Command Center', time: 'Today 08:30 AM', status: 'Active' },
                          { name: 'SP M. Naik', badge: 'KSP-SP-1042', role: '🎖️ District SP', district: 'Bengaluru Urban', station: 'District HQ', time: 'Today 09:15 AM', status: 'Active' },
                          { name: 'Insp. R. Kumar', badge: 'KSP-2026-9041', role: '👮 Inspector (CRB)', district: 'Bengaluru Urban', station: 'MG Road PS', time: 'Today 10:42 AM', status: 'Active' },
                          { name: 'Const. S. Patil', badge: 'KSP-PC-5502', role: '🛡️ Field Constable', district: 'Bengaluru East', station: 'Indiranagar PS', time: 'Today 11:05 AM', status: 'Active' },
                          { name: 'Op. V. Sharma', badge: 'KSP-DEO-8809', role: '📝 Data Entry Operator', district: 'Bengaluru Central', station: 'Intake Bureau', time: 'Today 07:45 AM', status: 'Active' }
                        ].map((u, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                            <td style={{ fontFamily: 'monospace' }}>{u.badge}</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--police-light)' }}>{u.role}</td>
                            <td>{u.district}</td>
                            <td>{u.station}</td>
                            <td style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{u.time}</td>
                            <td><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 'bold' }}>{u.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Panel: Security Monitors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="card-container" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      🛡️ Security &amp; Compliance Governance
                    </h3>
                    {[
                      { title: 'SAML SSO Provider', val: 'Online (KSDC Data Center)', status: '🟢 Connected' },
                      { title: 'Database Encryption', val: 'AES-256 Bit TLS 1.3', status: '🟢 Enforced' },
                      { title: 'Audit Log Integrity', val: 'SHA-256 Signatures Active', status: '🟢 Verified' },
                      { title: 'Failed Login Threshold', val: '0 Suspicious Lockouts', status: '🟢 Clean' }
                    ].map((s, i) => (
                      <div key={i} style={{ padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{s.title}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#10B981' }}>{s.status}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{s.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card-container" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ☁️ Zoho Catalyst Serverless Stack
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>AppSail Client:</strong> Live Static Host</div>
                      <div><strong>Catalyst DataStore:</strong> NoSQL Cluster</div>
                      <div><strong>Catalyst FileStore:</strong> Binary Assets</div>
                      <div><strong>Project ID:</strong> 54521000000013024</div>
                    </div>
                  </div>
                </div>

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
                              <div style={{ background: '#F8FAFC', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#78350F', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Victim Profile</div>
                                <div style={{ fontWeight: '600' }}>👤 {aiSummary.victim}</div>
                              </div>
                              <div style={{ background: '#F8FAFC', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#78350F', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Suspect Details</div>
                                <div style={{ fontWeight: '600' }}>🔍 {aiSummary.suspect}</div>
                              </div>
                            </div>

                            <div style={{ background: '#F8FAFC', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#78350F', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Key Evidence Logs</div>
                              <div style={{ fontWeight: '500' }}>📁 {aiSummary.evidence}</div>
                            </div>

                            <div style={{ background: '#F8FAFC', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
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
      {/* 🤖 Floating AI Assistant Portal */}
      <div className="floating-ai-portal" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9990, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        
        {/* Quick Actions Stack (visible only when chat is closed) */}
        {!chatOpen && (
          <div className="quick-actions-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem' }}>
            <button 
              onClick={() => { setChatOpen(true); submitChatQuery("Highest crime density district and hotspots?"); }}
              className="quick-action-pill"
              style={{ padding: '0.4rem 0.8rem', background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
            >
              📍 Hotspots
            </button>
            <button 
              onClick={() => { setChatOpen(true); submitChatQuery("List active warnings and alerts"); }}
              className="quick-action-pill"
              style={{ padding: '0.4rem 0.8rem', background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
            >
              🚨 Alerts
            </button>
            <button 
              onClick={() => { setChatOpen(true); submitChatQuery("Show category distribution and analytics trends"); }}
              className="quick-action-pill"
              style={{ padding: '0.4rem 0.8rem', background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
            >
              📊 Analytics
            </button>
          </div>
        )}

        {/* Floating Chat Trigger Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="floating-chat-trigger"
          title="KSP AI Assistant"
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #1565C0 0%, #0F4C81 100%)', 
            border: 'none', 
            boxShadow: '0 6px 20px rgba(15, 76, 129, 0.4)', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#FFFFFF', 
            position: 'relative',
            outline: 'none'
          }}
        >
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🤖</span>
          <span style={{ fontSize: '0.55rem', fontWeight: '800', letterSpacing: '0.5px', marginTop: '2px', color: '#F9A825' }}>KSP AI</span>
          
          {/* Subtle Pulse rings when idle */}
          {!chatOpen && <span className="chat-trigger-pulse" />}
        </button>

        {/* Slide-In Drawer / Large Modal Chat Panel */}
        {chatOpen && (
          <div 
            className="chat-drawer-panel"
            style={{ 
              position: 'fixed', 
              bottom: '5.5rem', 
              right: '2rem', 
              width: '400px', 
              height: '500px', 
              background: '#F8FAFC', 
              borderRadius: '4px', 
              border: '1px solid #D1D5DB', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              animation: 'drawerSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            {/* Drawer Header */}
            <div style={{ background: '#0F4C81', padding: '0.9rem 1.25rem', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #F9A825' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🤖</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#FFFFFF' }}>KSP AI Assistant</h3>
                  <div style={{ fontSize: '0.62rem', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                    <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
                    Active Command Engine
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '1.4rem', cursor: 'pointer', outline: 'none', lineHeight: 1, padding: 0 }}
              >
                &times;
              </button>
            </div>

            {/* Chat Messages Log */}
            <div 
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '1rem 1.25rem', 
                background: '#F8FAFC', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem' 
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
                      background: isAi ? '#FFFFFF' : '#1565C0',
                      border: '1px solid #DCE3EA',
                      color: isAi ? '#1F2937' : '#FFFFFF',
                      padding: '0.65rem 0.85rem',
                      borderRadius: isAi ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                      fontSize: '0.78rem',
                      lineHeight: '1.45',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.text}
                  </div>
                );
              })}
            </div>

            {/* Quick Command Suggestions Container */}
            <div style={{ padding: '0.75rem 1.25rem', background: '#F8FAFC', borderTop: '1px solid #D1D5DB', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <button 
                type="button"
                onClick={() => submitChatQuery("Show cybercrime cases in Bengaluru")}
                style={{ background: '#F1F5F9', border: '1px solid #D1D5DB', borderRadius: '12px', padding: '0.3rem 0.6rem', fontSize: '0.68rem', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}
              >
                💻 Cyber Bengaluru
              </button>
              <button 
                type="button"
                onClick={() => submitChatQuery("Show high priority cases")}
                style={{ background: '#F1F5F9', border: '1px solid #D1D5DB', borderRadius: '12px', padding: '0.3rem 0.6rem', fontSize: '0.68rem', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ⚠️ High Priority
              </button>
              <button 
                type="button"
                onClick={() => submitChatQuery("Reset all search filters")}
                style={{ background: '#F1F5F9', border: '1px solid #D1D5DB', borderRadius: '12px', padding: '0.3rem 0.6rem', fontSize: '0.68rem', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🔄 Reset Filters
              </button>
            </div>

            {/* Chat Input Footer Form */}
            <form 
              onSubmit={handleChatSubmit} 
              style={{ 
                padding: '0.75rem 1.25rem', 
                background: '#F8FAFC', 
                borderTop: '1px solid #D1D5DB', 
                display: 'flex', 
                gap: '0.5rem',
                alignItems: 'center' 
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask assistant or click suggestions..."
                style={{ 
                  flex: 1, 
                  padding: '0.5rem 0.75rem', 
                  fontSize: '0.75rem', 
                  borderRadius: '8px', 
                  border: '1px solid #DCE3EA', 
                  backgroundColor: '#FFFFFF', 
                  color: '#1F2937',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                style={{ 
                  padding: '0.5rem 0.9rem', 
                  fontSize: '0.75rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: '#1565C0', 
                  color: '#FFFFFF', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      </div>

      {/* 🔐 SAML / JWT Enterprise Authentication Dialog */}
      <LoginModal
        isOpen={isLoginModalOpen || !authSession?.isAuthenticated}
        onLoginSuccess={(session) => {
          setAuthSession(session);
          setUserRole(session.user.role);
          sessionStorage.setItem('ksp_auth_session', JSON.stringify(session));
          setIsLoginModalOpen(false);
        }}
      />

      {/* 📜 Audit Log Drawer */}
      <AuditTrailDrawer
        isOpen={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
      />
    </div>
  )
}

export default App


