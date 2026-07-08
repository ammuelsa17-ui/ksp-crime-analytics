import { useState, useEffect } from 'react'
import './App.css'

// Dynamic API Base URL configuration:
// - Uses localhost:8000 during local development.
// - Resolves to the deployed Catalyst AppSail URL in production (customizable via VITE_API_URL env variable).
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : (import.meta.env.VITE_API_URL || 'https://server-50043662505.development.catalystappsail.in');

function App() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState("Checking...")

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
      } else {
        throw new Error(result.detail || "Failed to fetch cases")
      }
    } catch (err) {
      console.error("API Connection Error:", err)
      setError(err.message)
      setApiStatus("Offline")
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
    setSubmitSuccess(false)

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
        setSubmitSuccess(true)
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

        // Hide success message after a delay
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else {
        throw new Error(result.detail || "Failed to register case")
      }
    } catch (err) {
      console.error("Submission Error:", err)
      setSubmitError(err.message)
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
      } else {
        throw new Error(result.detail || 'Failed to update case')
      }
    } catch (err) {
      console.error(err)
      setUpdateError(err.message)
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
        setCases(prev => prev.filter(c => c.id !== selectedCase.id))
        handleCloseModal()
      } else {
        throw new Error(result.detail || 'Failed to delete case')
      }
    } catch (err) {
      console.error(err)
      setUpdateError(err.message)
    } finally {
      setUpdateLoading(false)
    }
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

  return (

    <div className="dashboard-container">
      {/* Top Police Banner Header */}
      <header className="dashboard-header">
        <div className="header-logo">🛡️</div>
        <div className="header-text">
          <h1>Karnataka State Police</h1>
          <h2>Crime Analytics Platform — Prototype</h2>
        </div>
        <div className={`status-badge ${apiStatus.toLowerCase()}`}>
          API Status: {apiStatus}
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


      {/* Main Dashboard Grid */}
      <main className="dashboard-grid">
        
        {/* Left: Register Case Form Card */}
        <section className="form-card-wrapper">
          <div className="form-card">
            <h3>📝 Register New Case</h3>
            <p className="form-subtitle">Submit details of the FIR to insert into Catalyst Data Store.</p>
            
            {submitSuccess && (
              <div className="alert success">
                ✅ Case registered successfully in database!
              </div>
            )}
            
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
        </section>

        {/* Right: Table / States */}
        <section className="data-view-wrapper">
          <div className="action-bar">
            <p className="subtitle">
              Verify end-to-end data flow. Cases are persisted to Catalyst or local JSON backup. Click a row to view details, edit, or delete.
            </p>
            <button className="refresh-btn" onClick={fetchCases}>
              🔄 Refresh
            </button>
          </div>

          {/* Search, Filters, and Sorting Controls */}
          {!loading && !error && (
            <div className="filter-controls-bar">
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
          )}

          {/* Loading / Error States */}
          {loading && (
            <div className="state-card loading">
              <span className="spinner">⏳</span> Fetching database records...
            </div>
          )}

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
                        {cases.length === 0 
                          ? "No crime cases found. Register a case on the left!" 
                          : "No matching crime cases found. Adjust your search or filters!"}
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((item) => (
                      <tr key={item.id} className="case-row-clickable case-row-new" onClick={() => handleRowClick(item)}>
                        <td className="fir-col">{item.fir_number}</td>
                        <td>
                          <span className={`category-tag ${item.category.toLowerCase()}`}>
                            {item.category}
                          </span>
                        </td>
                        <td>{item.district}</td>
                        <td>{item.police_station}</td>
                        <td className="date-col">{item.incident_date}</td>
                        <td className="summary-col">{item.summary}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>


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
                      <span className="val fir-code">{selectedCase.fir_number}</span>
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


