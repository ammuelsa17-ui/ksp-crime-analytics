# Karnataka State Police (KSP) Crime Intelligence Platform

An end-to-end prototype of the KSP Crime Intelligence Platform built for the Datathon 2026. This platform enables data-driven crime analysis, case registration, and intelligence mapping, running serverless on Zoho Catalyst.

---

## 📋 Problem Statement & Impact
Modern policing requires rapid data retrieval and real-time visualization of crime patterns. This platform bridges the gap between field reporting (FIR registration) and database management by providing:
*   **Instant Case Registration:** Field officers can register FIRs directly, populating location coordinates and category details.
*   **Geospatial Insights:** Integrated mapping parameters (latitude and longitude) to map crime hotspots.
*   **Robust Serverless Architecture:** Hosted on Zoho Catalyst AppSail (FastAPI) and Data Store, ensuring high availability and secure storage.

---

## 🛠️ Technology Stack
*   **Frontend:** React 19, Vite (Vanilla CSS for premium modern UI)
*   **Backend:** FastAPI (Python 3.9+), Pydantic v2
*   **Cloud Platform (Exclusively Zoho Catalyst):**
    *   **Data Store:** Relational NoSQL tables (`location` and `crime_cases`)
    *   **AppSail:** Hosting environment for containerized backend services
    *   **Web Client (Slate):** Serverless static hosting for the React client

---

## 🏗️ Project Architecture
```text
/root
├── /client                 # React Frontend (Vite)
│   ├── /src
│   │   ├── App.jsx         # Case form, cases table, state management
│   │   ├── App.css         # Premium Glassmorphic Theme CSS
│   │   └── main.jsx        # App entry point
│   └── package.json
│
├── /server                 # Python Backend (FastAPI on AppSail)
│   ├── /app
│   │   └── database.py     # Catalyst SDK initialization & local fallback logic
│   ├── main.py             # API endpoints (GET/POST /api/v1/cases)
│   ├── seed_database.py    # Database seeder for sample records
│   ├── app-config.json     # AppSail configuration file
│   └── requirements.txt    # Python dependencies
│
├── catalyst.json           # Catalyst root project registry config
└── README.md               # Main documentation
```

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.9+)

### 2. Backend Setup
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## ☁️ Zoho Catalyst Deployment

To satisfy the **exclusively on Catalyst** requirement:

### Option A: Deploy From GitHub (Recommended)
1.  Push this project to a **public GitHub repository**.
2.  Log in to the **Zoho Catalyst Console** and open **Slate**.
3.  Select **Deploy From Repository** and connect your GitHub account.
4.  Configure the build settings for the `client` directory (Vite output folder: `dist`) and deploy.
5.  Deploy the FastAPI backend under **AppSail** pointing to the `server` directory.

### Option B: Deploy By Direct Upload
1.  Build the client locally:
    ```bash
    cd client
    ```
    ```bash
    npm run build
    ```
2.  Zip the generated `dist` folder.
3.  On the **Slate** console, choose **Deploy By Direct Upload**, drag the zip file, and publish.
