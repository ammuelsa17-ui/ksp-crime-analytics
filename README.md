# Karnataka State Police (KSP) Crime Intelligence & Analytics Platform

An end-to-end cloud-native prototype of the **KSP Crime Intelligence & Analytics Platform** built for **Datathon 2026**. This enterprise-quality dashboard enables real-time crime case recording, instant visualization of key trends, spatio-temporal ML crime demand forecasting, Google OR-Tools patrol deployment optimization, interactive MapLibre GIS mapping (Dark, Light, Satellite modes), and official officer directive dispatch workflows running serverless on **Zoho Catalyst**.

*   **Live Deployed Web Application (Catalyst Slate):** [https://project-rainfall-60076677593.development.catalystserverless.in/app/index.html](https://project-rainfall-60076677593.development.catalystserverless.in/app/index.html)
*   **Live Backend API Server (Catalyst AppSail):** [https://server-50043662505.development.catalystappsail.in/](https://server-50043662505.development.catalystappsail.in/)

---

## 📋 Problem Statement & Scope
Modern policing requires rapid database access, immediate visualization of crime patterns, predictive resource allocation, and human officer governance. This platform bridges the gap between field incident reporting and police command center operations by providing:

1. **Instant FIR Case Registration**: Field officers can register FIRs directly, populating location coordinates, categories, and severity ratings.
2. **Interactive MapLibre GIS Map**: High-performance GPU vector map with **Dark Command**, **Light Administrative**, and **Esri Satellite** base-layer views.
3. **AI Patrol Demand Forecasting**: Spatio-temporal demand model trained on historical incident patterns to predict high-risk time windows and incident counts by district and crime category.
4. **Google OR-Tools Patrol Optimization**: Constraint-based linear programming optimizer that allocates available patrol units to maximize coverage and minimize response times.
5. **Human Officer Governance & Audit Trail**: Requires explicit officer review and approval before dispatching patrol directives, generating a persistent audit trail and downloadable official TXT summary reports.

---

## 🔬 Synthetic Dataset & Model Provenance Disclosure

> **Transparency Notice for Datathon Judges**:
> We trained and evaluated a Random Forest Regressor model using a synthetic dataset of **12,000 historical crime records** (`server/data/synthetic_crime_history.csv`) split chronologically (80% train / 20% test). To ensure lightweight cloud package size and instant startup on Zoho Catalyst AppSail, model-derived forecast artifacts are exported to JSON (`models/crime_forecast_rf.json`) alongside the trained joblib model (`models/crime_forecast_rf.joblib`). This engine acts as a **human-in-the-loop decision-support tool**, not an autonomous policing system.

---

## ✨ Key Features & Capabilities

### 1. Spatio-Temporal Crime Forecasting & Patrol Optimization
* **Random Forest Regressor Baseline Model**: Trained on 12,000 synthetic records across Karnataka districts ($R^2 = 0.8206$, $\text{MAE} = 0.7707$, $\text{RMSE} = 0.9727$).
* **Google OR-Tools Linear Solver**: Solves unit allocation linear programs returning real solver status (`OPTIMAL`), coverage percentage, and expected response times.
* **Category-Aware Demand Vectors**: Dynamically adjusts risk vectors (e.g. Cyber fraud, nocturnal burglary, public altercation) based on target precinct and crime category.
* **Persistent Directive Audit Log**: Approved directives (`DIR-KSP-...`) are logged to disk (`server/data/approved_directives.json`) and exposed via `GET /api/v1/ml/patrol-directives`.
* **Strict Validation**: Rejects empty location dispatch plans with `400 Bad Request`.

### 2. Interactive MapLibre GL JS GIS Command Radar
* **3-Mode Base Map Selector**:
  * 🌙 **Command Dark** (Carto Dark vector tiles)
  * ☀️ **Administrative Light** (Carto Positron tiles)
  * 🛰️ **Satellite** (Esri World Imagery)
* **Layer Persistence & State Preservation**: Mode selector persists in `localStorage`, maintaining zoom level, filters, popups, and FIR pins when switching views.

### 3. Core FIR Case Management & SVG Analytics
* **Live CRUD Operations**: Register new FIRs, view full case details in interactive glassmorphism modals, edit records, or delete cases.
* **SVG Data Visualization**: Dynamic category bar charts, district breakdown donut charts, and timeline incident area charts.
* **Export & Reports**: Instant CSV data export and printable official KSP case summary sheets.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│              React 19 + MapLibre GL Client              │
│          (Hosted serverless on Catalyst Slate)          │
└────────────────────────────┬────────────────────────────┘
                             │  HTTP API requests
                             ▼
┌─────────────────────────────────────────────────────────┐
│               FastAPI Python 3.9 Backend                │
│          (Hosted serverless on Catalyst AppSail)        │
│                                                         │
│   • Scikit-Learn Model / Model-Derived JSON Artifacts  │
│   • Google OR-Tools Linear Optimizer Solver             │
│   • Persistent Audit Directive Register (`.json`)      │
└────────────────────────────┬────────────────────────────┘
                             │  Catalyst Python SDK
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Catalyst Data Store                   │
│          (Relational Tables: location & crime_cases)    │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack
* **Frontend**: React 19, Vite, MapLibre GL JS, Lucide Icons, Vanilla CSS Design System.
* **Backend**: FastAPI, Python 3.9, Pydantic v2, Scikit-Learn, Pandas, Joblib, Google OR-Tools.
* **Zoho Catalyst Cloud Services**:
  * **AppSail**: Containerized serverless environment running FastAPI backend routes and ML engines.
  * **Slate**: Serverless web app hosting serving the compiled React bundle.
  * **Data Store**: NoSQL / relational tables for case storage.

---

## 🚀 Setup & Local Execution

### 1. Model Training & Data Generation
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 1. Generate 12,000 synthetic records and train Random Forest model
python train_crime_model.py
```

### 2. Run Local Backend Server
```bash
uvicorn main:app --reload --port 8000
```

### 3. Run Local Frontend App
```bash
cd ../client
npm install
npm run dev
```

---

## ☁️ Zoho Catalyst Deployment Command

```bash
# 1. Build client bundle
cd client && npm run build && cd ..

# 2. Deploy Slate client & AppSail backend
catalyst deploy
```

---

## 🛡️ License & Acknowledgements
Developed for **Karnataka State Police Datathon 2026**. Built on Zoho Catalyst Cloud Infrastructure.
