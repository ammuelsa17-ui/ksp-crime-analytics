import os
import sys
import zcatalyst_sdk
from zcatalyst_sdk import credentials
from datetime import datetime

# Initialize the Catalyst SDK
refresh_token = os.environ.get("CATALYST_REFRESH_TOKEN")
client_id = os.environ.get("CATALYST_CLIENT_ID")
client_secret = os.environ.get("CATALYST_CLIENT_SECRET")
project_id = os.environ.get("CATALYST_PROJECT_ID")
project_key = os.environ.get("CATALYST_PROJECT_KEY")  # Project Key is the ZAID
environment = os.environ.get("CATALYST_ENVIRONMENT", "Development")

try:
    if refresh_token and client_id and client_secret and project_id and project_key:
        print("Initializing Catalyst SDK for seeding locally using environment credentials...")
        catalyst_credential = credentials.RefreshTokenCredential({
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret
        })
        catalyst_options = {
            "project_id": project_id,
            "project_key": project_key,
            "environment": environment
        }
        catalyst_app = zcatalyst_sdk.initialize_app(
            credential=catalyst_credential,
            options=catalyst_options
        )
        print("Catalyst SDK initialized successfully via OAuth credentials.")
    else:
        print("Initializing Catalyst SDK for seeding via environment defaults (AppSail mode)...")
        catalyst_app = zcatalyst_sdk.initialize()
        print("Catalyst SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Catalyst SDK: {e}")
    print("If running locally, please ensure environment credentials or project settings are configured.")
    sys.exit(1)

# Definition of the 5 realistic sample records
SAMPLE_LOCATIONS = [
    {"ROWID": 1, "district": "Bengaluru", "police_station": "Koramangala PS", "latitude": 12.9352, "longitude": 77.6245},
    {"ROWID": 2, "district": "Bengaluru", "police_station": "Indiranagar PS", "latitude": 12.9784, "longitude": 77.6408},
    {"ROWID": 3, "district": "Mysuru", "police_station": "Lashkar PS", "latitude": 12.3168, "longitude": 76.6534},
    {"ROWID": 4, "district": "Hubballi-Dharwad", "police_station": "Suburban PS", "latitude": 15.3524, "longitude": 75.1385},
    {"ROWID": 5, "district": "Udupi", "police_station": "Manipal PS", "latitude": 13.3529, "longitude": 74.7842}
]

SAMPLE_CASES = [
    {
        "ROWID": 1,
        "fir_number": "FIR/BLR/2026/0001",
        "location_id": 1,
        "category": "Theft",
        "incident_date": "2026-06-15 22:30:00",
        "summary": "Complainant reported that his parked Royal Enfield motorcycle (KA-01-HE-9988) was stolen from outside his residence in Koramangala 3rd block during night hours."
    },
    {
        "ROWID": 2,
        "fir_number": "FIR/BLR/2026/0002",
        "location_id": 2,
        "category": "Cybercrime",
        "incident_date": "2026-06-18 11:15:00",
        "summary": "Victim received a phone call from an unknown suspect claiming to be a Google Pay verification officer. Suspect tricked victim into sharing OTP, transferring Rs 45,000 from victim's bank account."
    },
    {
        "ROWID": 3,
        "fir_number": "FIR/MYS/2026/0003",
        "location_id": 3,
        "category": "Assault",
        "incident_date": "2026-06-20 16:45:00",
        "summary": "A physical clash occurred between two vendors at Lashkar Market over a display table layout. Suspect assaulted complainant with a metal stand, causing minor head injuries."
    },
    {
        "ROWID": 4,
        "fir_number": "FIR/HUB/2026/0004",
        "location_id": 4,
        "category": "Fraud",
        "incident_date": "2026-06-22 14:00:00",
        "summary": "Suspect collected Rs 1,50,000 from victim under false promise of securing a contract job at the Hubballi railway office. Suspect switched off phone and is absconding."
    },
    {
        "ROWID": 5,
        "fir_number": "FIR/UDP/2026/0005",
        "location_id": 5,
        "category": "Theft",
        "incident_date": "2026-06-25 03:00:00",
        "summary": "Complainant reported a house burglary at their locked apartment in Manipal. Suspect broke open the window grill and stole a laptop, camera, and gold ring worth Rs 1,10,000."
    }
]

SAMPLE_ACCUSED = [
    {"ROWID": 1, "case_id": 1, "name": "Kiran Kumar", "age": 24, "status": "Absconding"},
    {"ROWID": 2, "case_id": 2, "name": "Unknown Phisher", "age": 0, "status": "Under Investigation"},
    {"ROWID": 3, "case_id": 3, "name": "Girish M", "age": 34, "status": "Arrested"},
    {"ROWID": 4, "case_id": 4, "name": "Santosh Patil", "age": 41, "status": "Absconding"},
    {"ROWID": 5, "case_id": 5, "name": "Ravi Naik", "age": 28, "status": "Arrested"}
]

SAMPLE_VICTIMS = [
    {"ROWID": 1, "case_id": 1, "name": "Anil Deshpande", "age": 29, "gender": "Male"},
    {"ROWID": 2, "case_id": 2, "name": "Sunitha Gowda", "age": 52, "gender": "Female"},
    {"ROWID": 3, "case_id": 3, "name": "Nagaraj Rao", "age": 45, "gender": "Male"},
    {"ROWID": 4, "case_id": 4, "name": "Vijay K", "age": 27, "gender": "Male"},
    {"ROWID": 5, "case_id": 5, "name": "Preeti Shenoy", "age": 22, "gender": "Female"}
]

SAMPLE_INVESTIGATIONS = [
    {"ROWID": 1, "case_id": 1, "officer_name": "Inspector Raghav", "diary_entry": "FIR registered. CCTV footage of surrounding streets being analyzed.", "status": "Active", "last_updated": "2026-06-16 10:00:00"},
    {"ROWID": 2, "case_id": 2, "officer_name": "Inspector Shaila", "diary_entry": "Bank statement obtained. IP address of request traced to Jamtara.", "status": "Active", "last_updated": "2026-06-19 14:30:00"},
    {"ROWID": 3, "case_id": 3, "officer_name": "Inspector Manjunath", "diary_entry": "Accused apprehended at the scene. Statements recorded. Chargesheet drafted.", "status": "Closed", "last_updated": "2026-06-21 17:00:00"},
    {"ROWID": 4, "case_id": 4, "officer_name": "Inspector Praveen", "diary_entry": "Search warrant issued for Patil's primary residence. Accused missing.", "status": "Active", "last_updated": "2026-06-23 09:15:00"},
    {"ROWID": 5, "case_id": 5, "officer_name": "Inspector Raghav", "diary_entry": "Stolen laptop recovered from local pawn shop. Accused arrested.", "status": "Closed", "last_updated": "2026-06-26 12:00:00"}
]

def seed():
    datastore = catalyst_app.datastore()

    print("Starting database seeding...")

    # Helper function to insert items into a Catalyst table
    def insert_records(table_name, records):
        table = datastore.table(table_name)
        inserted_count = 0
        for record in records:
            # We remove ROWID to let Catalyst auto-generate it if necessary,
            # but keep custom column values.
            data_to_insert = {k: v for k, v in record.items() if k != "ROWID"}
            try:
                table.insert_row(data_to_insert)
                inserted_count += 1
            except Exception as e:
                print(f"Error inserting row into {table_name}: {e}")
        print(f"Successfully inserted {inserted_count}/{len(records)} rows into '{table_name}'.")

    # In Catalyst, tables must be pre-created in the Zoho console.
    # This script assumes the tables are created.
    try:
        insert_records("location", SAMPLE_LOCATIONS)
        insert_records("crime_cases", SAMPLE_CASES)
        insert_records("accused", SAMPLE_ACCUSED)
        insert_records("victim", SAMPLE_VICTIMS)
        insert_records("investigation_records", SAMPLE_INVESTIGATIONS)
        print("Database seeding completed successfully.")
    except Exception as e:
        print(f"Seeding failed: {e}")
        print("Please verify that all tables have been created in the Catalyst Console.")

if __name__ == "__main__":
    seed()
