import { useState, useEffect } from 'react'
import './App.css'

// Dynamic API Base URL configuration:
// - Uses localhost:8000 during local development.
// - Resolves to the deployed Catalyst AppSail URL in production (customizable via VITE_API_URL env variable).
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : window.location.origin;

function App() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState("Checking...")

  // Tab State & Toasts
  const [activeTab, setActiveTab] = useState('records')
  const [toasts, setToasts] = useState([])
  const [activityLog, setActivityLog] = useState([])

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
    district: 'Bengaluru',
    police_station: '',
    incident_date: '',
    summary: ''
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
    summary: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Search, Filter, and Sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterDistrict, setFilterDistrict] = useState('All')
  const [sortOrder, setSortOrder] = useState('latest')


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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

    const payload = {
      ...formData,
      incident_date: formattedDate
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
          police_station: '',
          incident_date: '',
          summary: ''
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
  }

  const handleEditClick = () => {
    setEditFormData({
      fir_number: selectedCase.fir_number,
      category: selectedCase.category,
      district: selectedCase.district,
      police_station: selectedCase.police_station,
      incident_date: selectedCase.incident_date.replace(' ', 'T').slice(0, 16),
      summary: selectedCase.summary
    })
    setIsEditing(true)
    setUpdateError(null)
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

    const payload = {
      ...editFormData,
      incident_date: formattedDate
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
  const handlePrintCase = () => {
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
            <div class="item"><div class="label">Geospatial Coordinates</div><div class="value">Lat: ${selectedCase.latitude?.toFixed(4) || "0.0000"}, Lng: ${selectedCase.longitude?.toFixed(4) || "0.0000"}</div></div>
          </div>
          <div class="summary">
            <div class="summary-title">FIR Summary Statement</div>
            <p style="margin: 0; font-size: 14px; color: #334155;">${selectedCase.summary}</p>
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
        <div className="loading-overlay">
          <div className="spinner-container">
            <span className="spinner">🚨</span>
            <p>Processing Request...</p>
          </div>
        </div>
      )}

      {/* Top Police Banner Header */}
      <header className="dashboard-header">
        <div className="header-logo">🛡️</div>
        <div className="header-text">
          <h1>Karnataka State Police</h1>
          <h2>Crime Analytics Platform — Prototype</h2>
        </div>
        <div className="header-badges">
          <div className="storage-mode-badge">
            Storage: <span>🟢 Catalyst Data Store</span>
          </div>
          <div className={`status-badge ${apiStatus.toLowerCase()}`}>
            API Status: {apiStatus}
          </div>
        </div>
      </header>

      {/* Top Statistics Cards Panel */}
      <section className="stats-panel-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📂</div>
            <div className="stat-info">
              <span className="stat-label">Total Cases</span>
              <span className="stat-value">{totalCases}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon today">🚨</div>
            <div className="stat-info">
              <span className="stat-label">Cases Today</span>
              <span className="stat-value">{casesToday}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon categories">🏷️</div>
            <div className="stat-info">
              <span className="stat-label">Crime Categories</span>
              <span className="stat-value">{uniqueCategories}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stations">🏢</div>
            <div className="stat-info">
              <span className="stat-label">Stations Covered</span>
              <span className="stat-value">{uniqueStations}</span>
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
                    <label htmlFor="fir_number">FIR Number</label>
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
                      <label htmlFor="category">Category</label>
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
                      <label htmlFor="district">District</label>
                      <select
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mysuru">Mysuru</option>
                        <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                        <option value="Udupi">Udupi</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="police_station">Police Station</label>
                    <input
                      type="text"
                      id="police_station"
                      name="police_station"
                      value={formData.police_station}
                      onChange={handleInputChange}
                      placeholder="e.g. Koramangala PS"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="incident_date">Incident Date & Time</label>
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
                    <label htmlFor="summary">Case Summary</label>
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
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Mysuru">Mysuru</option>
                          <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                          <option value="Udupi">Udupi</option>
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
                        <th>District</th>
                        <th>Police Station</th>
                        <th>Incident Date</th>
                        <th>Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="no-cases-cell">
                            <div className="empty-state-container">
                              <span className="empty-state-icon">🔍</span>
                              <h4>No Records Found</h4>
                              <p>
                                {cases.length === 0 
                                  ? "No crime cases found. Register a case on the left!" 
                                  : "No matching crime cases found. Adjust your search or filters!"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCases.map((item) => (
                          <tr key={item.id} className="case-row-clickable case-row-new" onClick={() => handleRowClick(item)}>
                            <td className="fir-col">{highlightText(item.fir_number, searchQuery)}</td>
                            <td>
                              <span className={`category-tag ${item.category.toLowerCase()}`}>
                                {item.category}
                              </span>
                            </td>
                            <td>{item.district}</td>
                            <td>{item.police_station}</td>
                            <td className="date-col">{item.incident_date}</td>
                            <td className="summary-col">{highlightText(item.summary, searchQuery)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Analytics tab view with custom charts */
          <section className="analytics-dashboard-view">
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
                      <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1a263f" strokeDasharray="3,3" />
                      <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1a263f" strokeDasharray="3,3" />
                      <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1a263f" />

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
                        <text key={idx} x={p.x} y={chartHeight - 8} textAnchor="middle" className="timeline-axis-text" fill="#a0aec0">
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
        )}
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
                    <label htmlFor="edit_fir_number">FIR Number</label>
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
                      <label htmlFor="edit_category">Category</label>
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
                      <label htmlFor="edit_district">District</label>
                      <select
                        id="edit_district"
                        name="district"
                        value={editFormData.district}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mysuru">Mysuru</option>
                        <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                        <option value="Udupi">Udupi</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_police_station">Police Station</label>
                    <input
                      type="text"
                      id="edit_police_station"
                      name="police_station"
                      value={editFormData.police_station}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_incident_date">Incident Date & Time</label>
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
                    <label htmlFor="edit_summary">Case Summary</label>
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
              ) : (
                /* Standard Details View */
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
                      <span className="label">Coordinates (Geospatial)</span>
                      <span className="val coordinate-val">
                        Lat: {selectedCase.latitude?.toFixed(4) || "0.0000"}, Lng: {selectedCase.longitude?.toFixed(4) || "0.0000"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item summary-item">
                    <span className="label">Case Summary Description</span>
                    <p className="val summary-text">{selectedCase.summary}</p>
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App


