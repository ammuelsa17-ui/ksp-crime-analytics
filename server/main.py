import os
import sys
import traceback

log_path = "/tmp/app.log"
log_file = open(log_path, "w", buffering=1)
sys.stdout = log_file
sys.stderr = log_file

print("FastAPI app starting...")

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domains in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "message": "Welcome to the KSP Crime Intelligence Platform API!"
    }

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
def edit_case(case_id: int, case: CaseCreate, request: Request):
    try:
        updated_case = update_case(case_id, case.model_dump(), request)
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", 9000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)



