# Karnataka State Police (KSP) Crime Intelligence Platform

An end-to-end cloud-native prototype of the **KSP Crime Intelligence & Analytics Platform** built for **Datathon 2026**. This enterprise-quality dashboard enables real-time crime case recording, instant visualization of key trends, export utilities, and live storage integration, running exclusively serverless on **Zoho Catalyst**.

*   **Live Deployed Frontend (Catalyst Slate):** [https://server-50043662505.development.catalystappsail.in/client/index.html](https://server-50043662505.development.catalystappsail.in/client/index.html)
*   **Live Deployed API (Catalyst AppSail):** [https://server-50043662505.development.catalystappsail.in/](https://server-50043662505.development.catalystappsail.in/)

---

## 📋 Problem Statement & Scope
Modern policing requires rapid database access and immediate visualization of crime patterns. This platform bridges the gap between field incident reporting and crime center analysis by providing:
*   **Instant Case Registration:** Field officers can register FIRs directly, which automatically populates location coordinates and category details.
*   **Storage Resiliency**: Powered by the Zoho Catalyst Python SDK with dynamic request scoping, falling back automatically to local session storage if cloud database queries encounter latency.
*   **Analytics Dashboard**: Instantly visible distribution of cases across crime categories, regional jurisdictions, and timeline trends without heavy third-party rendering frameworks.

---

## ✨ Key Features & Capabilities

### 1. Core CRUD Operations
*   **Register FIR**: Live form inputs validating FIR number formats, categories, district divisions, and detailed summaries.
*   **Interactive Modal**: Click any row in the case records table to view full details (including coordinates), edit case fields, or permanently delete the record.

### 2. Pure SVG Analytics Dashboard
*   **Cases by Category**: Horizontal bar charts with custom color gradients representing the frequency of Theft, Cybercrime, Assault, and Fraud.
*   **Cases by District**: A responsive Donut Chart showing regional case proportions with a center total counter.
*   **Timeline Trends**: Chronological area and line chart mapping case frequency over calendar dates with interactive data point tooltips.

### 3. Usability Utilities
*   **CSV Export**: Instant download of the currently filtered case dataset in a standard CSV format.
*   **Printable Reports**: Open a clean, KSP-official formatted case summary sheet, complete with print preview layouts ready for paper archiving.
*   **Search Term Highlighting**: Matches search terms inside table columns and dynamically highlights character substrings in yellow.
*   **Copy FIR button**: Copies the FIR code to clipboard instantly with success toast confirmation.

### 4. Interactive Feedback
*   **Toasts**: Toast messages (Success, Info, Error) with slide animations providing instant action confirmations.
*   **Loading Overlays**: Sleek glassmorphism overlay blocking clicks and disabling input buttons during active cloud transactions.
*   **Activity Feed**: Session log panel tracing database operations with live timestamps (e.g. `[15:42:10] FIR Registered — FIR/BLR/2026/0002`).

---

## 🏗️ System Architecture
```text
┌─────────────────────────────────────────────────────────┐
│                   React + Vite Client                   │
│          (Hosted serverless on Catalyst Slate)          │
└────────────────────────────┬────────────────────────────┘
                             │  HTTP requests
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 FastAPI Python Backend                  │
│          (Hosted serverless on Catalyst AppSail)        │
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
*   **Frontend**: React 19, Vite (Vanilla CSS design system for smooth animation, dark themes, and media queries)
*   **Backend**: FastAPI, Python 3.9, Pydantic v2
*   **Zoho Catalyst Cloud Services**:
    *   **Data Store**: Relational NoSQL storage schemas (`location` and `crime_cases`).
    *   **AppSail**: Containerized execution environment hosting backend routes.
    *   **Slate**: Static site serverless hosting serving the React bundle.

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   Catalyst CLI (`npm install -g zcatalyst-cli`)

### 2. Backend Setup
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the API server:
    ```bash
    uvicorn main:app --reload
    ```
    The local API will run at `http://localhost:8000`.

### 3. Frontend Setup
1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## ☁️ Zoho Catalyst Deployment (CLI Mode)

Deploy the entire workspace to the Zoho India data center:

1.  Log in to your Catalyst account:
    ```bash
    catalyst login --dc in
    ```
2.  Ensure you are linked to the correct project:
    ```bash
    catalyst project:use
    ```
3.  Compile the frontend client build:
    ```bash
    cd client
    npm run build
    cd ..
    ```
4.  Deploy the AppSail server and Slate client in one command:
    ```bash
    catalyst deploy
    ```
    Alternatively, deploy specific services:
    *   Deploy Backend: `catalyst deploy --only appsail`
    *   Deploy Frontend: `catalyst deploy --only slate`

---

## 🛢️ Database Seeding
To populate your live dashboard with realistic records:
*   **Seed Default Records**: The first GET query to `/api/v1/cases` automatically seeds the empty database with 5 baseline records.
*   **Seed Expanded Mock Dataset**: Make a POST request to `/api/v1/debug/seed-large` to instantly seed an additional **20 realistic cases** distributed across categories, districts, and coordinates.
    ```bash
    curl -X POST https://server-50043662505.development.catalystappsail.in/api/v1/debug/seed-large
    ```

---

## 🔮 Future Roadmap & Scope
While this prototype represents a fully functional, cloud-native case records and analytics core, a production-grade rollout would implement:
*   **Predictive Hotspot Analytics**: Train machine learning models using historical Data Store records to predict high-probability crime coordinates by time, day, and weather patterns.
*   **Interactive GIS & Map Mapping**: Replace grid coordinates with a dynamic Google Maps / Leaflet overlay mapping incident markers, cluster zones, and jurisdictional boundaries.
*   **Secure Officer Authentication**: Integrate Zoho Catalyst Authentication for role-based login (e.g. Field Officer for registration, Station Inspector for editing/deleting, Superintendent for analytics access).
*   **Instant Dispatch Alerts**: Implement Zoho Catalyst Eventing and Integration to dispatch real-time SMS/Email alerts to local stations whenever high-priority category cases (e.g. Assault, Cybercrime) are registered.
*   **AI Document Parsing & OCR**: Include OCR tools in the FIR form to scan physical handwritten police sheets and automatically extract category, date, and summaries to autofill inputs.

