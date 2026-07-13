import os
import sys
import traceback

print("FastAPI app starting...")

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import get_all_cases, create_case, update_case, delete_case
from pydantic import BaseModel

app = FastAPI(
    title="KSP Crime Intelligence Platform API",
    description="Backend API running on Zoho Catalyst AppSail",
    version="1.0.0"
)

@app.get("/api/v1/logs")
def get_logs():
    try:
        log_file.flush()
        if os.path.exists(log_path):
            with open(log_path, "r") as f:
                logs = f.read()
        else:
            logs = "Log file not found."
        from fastapi.responses import Response
        return Response(content=logs, media_type="text/plain")
    except Exception as e:
        return f"Error reading logs: {e}"

@app.get("/api/v1/debug/db")
def debug_db(request: Request):
    try:
        from app.database import use_fallback, init_error, get_catalyst_app
        app_instance = get_catalyst_app(request)
        if use_fallback or app_instance is None:
            return {
                "mode": "fallback (local JSON)",
                "info": "Catalyst SDK initialization was skipped.",
                "init_error": init_error
            }
        
        zcql = app_instance.zcql()
        cases = zcql.execute_query("SELECT * FROM crime_cases")
        locations = zcql.execute_query("SELECT * FROM location")
        return {
            "mode": "live (Catalyst Data Store)",
            "crime_cases_rows": cases,
            "location_rows": locations
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.post("/api/v1/debug/seed-large")
def seed_large(request: Request):
    try:
        # 1. Fetch existing cases to prevent duplicates
        existing_cases = get_all_cases(request)
        existing_firs = {c.get("fir_number") for c in existing_cases}
        
        # 2. Define the 20 realistic records
        large_dataset = [
            {"fir_number": "FIR/BLR/2026/0006", "category": "Cybercrime", "district": "Bengaluru", "police_station": "Koramangala PS", "incident_date": "2026-07-01 10:15:00", "summary": "Phishing campaign targeted elderly residents in Koramangala, leading to unauthorized withdrawals totaling Rs 2,40,000."},
            {"fir_number": "FIR/BLR/2026/0007", "category": "Theft", "district": "Bengaluru", "police_station": "Indiranagar PS", "incident_date": "2026-07-02 03:00:00", "summary": "Nighttime burglary at a boutique shop on Indiranagar 100 Feet Road. Designer apparel and cash box stolen."},
            {"fir_number": "FIR/MYS/2026/0008", "category": "Assault", "district": "Mysuru", "police_station": "Lashkar PS", "incident_date": "2026-07-02 18:30:00", "summary": "Street confrontation near Suburban Bus Stand. Two rival groups clashed over auto parking slots, resulting in minor injuries."},
            {"fir_number": "FIR/HUB/2026/0009", "category": "Fraud", "district": "Hubballi-Dharwad", "police_station": "Suburban PS", "incident_date": "2026-07-03 14:00:00", "summary": "Fake employment agency operating near Hubballi Station cheated 12 candidates under the pretext of railways job placement."},
            {"fir_number": "FIR/UDP/2026/0010", "category": "Theft", "district": "Udupi", "police_station": "Manipal PS", "incident_date": "2026-07-04 22:00:00", "summary": "Motorcycle theft reported from the student parking lot at Manipal University campus. Red Pulsar 150 stolen."},
            {"fir_number": "FIR/BLR/2026/0011", "category": "Cybercrime", "district": "Bengaluru", "police_station": "HSR Layout PS", "incident_date": "2026-07-04 11:30:00", "summary": "Identity theft report. Complainant's credit card cloned online and used for transactions worth Rs 1,15,000 in foreign currencies."},
            {"fir_number": "FIR/BLR/2026/0012", "category": "Fraud", "district": "Bengaluru", "police_station": "Koramangala PS", "incident_date": "2026-07-05 16:45:00", "summary": "Investment scam promising 25% monthly returns. Suspect vanished after collecting deposits from local merchants."},
            {"fir_number": "FIR/MYS/2026/0013", "category": "Theft", "district": "Mysuru", "police_station": "Lashkar PS", "incident_date": "2026-07-05 12:00:00", "summary": "Pickpocket incident at Mysuru Palace grounds. Complainant lost a gold necklace and a smartphone worth Rs 85,000."},
            {"fir_number": "FIR/HUB/2026/0014", "category": "Assault", "district": "Hubballi-Dharwad", "police_station": "Suburban PS", "incident_date": "2026-07-06 20:00:00", "summary": "Physical assault inside a restaurant following an argument over billing dispute. Complainant was punched by a staff member."},
            {"fir_number": "FIR/UDP/2026/0015", "category": "Cybercrime", "district": "Udupi", "police_station": "Manipal PS", "incident_date": "2026-07-06 09:00:00", "summary": "Ransomware attack on local clinic database, locking patient medical records. Suspects demanded payments in Bitcoin."},
            {"fir_number": "FIR/BLR/2026/0016", "category": "Assault", "district": "Bengaluru", "police_station": "Indiranagar PS", "incident_date": "2026-07-07 23:45:00", "summary": "Late-night road rage fight on Indiranagar Double Road. Driver assaulted after overtaking dispute."},
            {"fir_number": "FIR/BLR/2026/0017", "category": "Theft", "district": "Bengaluru", "police_station": "HSR Layout PS", "incident_date": "2026-07-08 04:30:00", "summary": "Laptops and tablet stolen from a software startup office located in Sector 3 of HSR Layout."},
            {"fir_number": "FIR/MYS/2026/0018", "category": "Fraud", "district": "Mysuru", "police_station": "Lashkar PS", "incident_date": "2026-07-08 11:00:00", "summary": "Fake property document scam. Suspect sold a residential plot using forged ownership records."},
            {"fir_number": "FIR/HUB/2026/0019", "category": "Theft", "district": "Hubballi-Dharwad", "police_station": "Suburban PS", "incident_date": "2026-07-09 17:15:00", "summary": "Shoplifting incident at a grocery supermarket. Goods worth Rs 12,000 recovered from the suspect."},
            {"fir_number": "FIR/UDP/2026/0020", "category": "Assault", "district": "Udupi", "police_station": "Manipal PS", "incident_date": "2026-07-09 21:00:00", "summary": "Fight between hostel roommates over loud music, leading to physical altercation and minor hand injuries."},
            {"fir_number": "FIR/BLR/2026/0021", "category": "Cybercrime", "district": "Bengaluru", "police_station": "Koramangala PS", "incident_date": "2026-07-10 13:00:00", "summary": "Business Email Compromise (BEC) scam. Accounts department tricked into paying Rs 4,50,000 to a dummy contractor account."},
            {"fir_number": "FIR/BLR/2026/0022", "category": "Theft", "district": "Bengaluru", "police_station": "Indiranagar PS", "incident_date": "2026-07-10 15:30:00", "summary": "Smartphone snatched by two bike-borne riders from a pedestrian near Indiranagar Metro Station."},
            {"fir_number": "FIR/MYS/2026/0023", "category": "Cybercrime", "district": "Mysuru", "police_station": "Lashkar PS", "incident_date": "2026-07-11 08:30:00", "summary": "Fake police officer scam call. Victim transferred Rs 50,000 online to clear dynamic customs duty fraud allegations."},
            {"fir_number": "FIR/HUB/2026/0024", "category": "Fraud", "district": "Hubballi-Dharwad", "police_station": "Suburban PS", "incident_date": "2026-07-11 11:45:00", "summary": "Suspect leased out a rented vehicle using fake papers, and is currently uncontactable."},
            {"fir_number": "FIR/UDP/2026/0025", "category": "Theft", "district": "Udupi", "police_station": "Manipal PS", "incident_date": "2026-07-11 14:15:00", "summary": "Bicycle theft from a private apartment cellar in Manipal. High-end mountain bike stolen."}
        ]
        
        # 3. Insert non-duplicate entries
        inserted_count = 0
        for case in large_dataset:
            if case["fir_number"] not in existing_firs:
                create_case(case, request)
                inserted_count += 1
                
        return {
            "success": True,
            "message": f"Successfully seeded {inserted_count} new cases to database.",
            "total_inserted": inserted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database seeding failed: {str(e)}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domains in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static assets compiled from client build
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

@app.get("/favicon.svg")
def get_favicon():
    return FileResponse("static/favicon.svg")

@app.get("/icons.svg")
def get_icons():
    return FileResponse("static/icons.svg")

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "Healthy",
        "database_connected": True
    }

@app.get("/api/v1/cases")
def read_cases(request: Request):
    try:
        cases = get_all_cases(request)
        return {
            "success": True,
            "count": len(cases),
            "data": cases
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cases: {str(e)}")

class CaseCreate(BaseModel):
    fir_number: str
    category: str
    district: str
    police_station: str
    incident_date: str
    summary: str

from typing import Optional

class CaseUpdate(BaseModel):
    fir_number: Optional[str] = None
    category: Optional[str] = None
    district: Optional[str] = None
    police_station: Optional[str] = None
    incident_date: Optional[str] = None
    summary: Optional[str] = None

@app.post("/api/v1/cases")
def add_case(case: CaseCreate, request: Request):
    try:
        new_case = create_case(case.model_dump(), request)
        return {
            "success": True,
            "data": new_case
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create case: {str(e)}")

@app.put("/api/v1/cases/{case_id}")
def edit_case(case_id: int, case: CaseUpdate, request: Request):
    try:
        # Only pass fields that were actually provided
        updates = {k: v for k, v in case.model_dump().items() if v is not None}
        updated_case = update_case(case_id, updates, request)
        return {
            "success": True,
            "data": updated_case
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update case: {str(e)}")

@app.delete("/api/v1/cases/{case_id}")
def remove_case(case_id: int, request: Request):
    try:
        success = delete_case(case_id, request)
        if not success:
            raise HTTPException(status_code=404, detail="Case not found")
        return {
            "success": True,
            "message": "Case deleted successfully"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete case: {str(e)}")
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
    return FileResponse("static/index.html")



if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", 9000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)



