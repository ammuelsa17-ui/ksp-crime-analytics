import os

with open('/Volumes/Disk D/datathon 2026/client/src/App.jsx', 'r') as f:
    app_code = f.read()

# 1. Add Top Imports
imports_block = """import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LoginModal from './components/common/LoginModal';
import AuditTrailDrawer from './components/features/AuditTrailDrawer';
import { catalystAuthLogin, catalystLogAuditEvent, catalystSignOut } from './services/catalystService';
import { maskPhone, maskAadhaar, maskAddress } from './utils/piiMasker';
import './App.css';
"""

# Replace top imports
first_func = app_code.find("const KSPEmblem =")
if first_func == -1:
    first_func = app_code.find("const API_BASE_URL =")

if first_func != -1:
    app_code = imports_block + "\n" + app_code[first_func:]

# 2. Add Auth & Layout States inside App()
auth_state = """
  // ── Enterprise Authentication & RBAC Session State ──
  const [authSession, setAuthSession] = useState(() => {
    const saved = sessionStorage.getItem('ksp_auth_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      isAuthenticated: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJbmFtZSI6IkRHUCBBLiBLLiBTaW5naCIsInJvbGUiOiJER1AifQ.sig_2026',
      user: { name: 'DGP A. K. Singh', role: 'DGP', badge: 'KSP-DGP-0001', district: 'Statewide HQ', station: 'Command Center' }
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
"""

if "const [authSession, setAuthSession]" not in app_code:
    app_code = app_code.replace(
        "function App() {",
        "function App() {\n" + auth_state
    )

with open('/Volumes/Disk D/datathon 2026/client/src/App.jsx', 'w') as f:
    f.write(app_code)

print("App.jsx state & imports updated!")
