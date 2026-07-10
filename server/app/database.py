import os
import json
import zcatalyst_sdk
from zcatalyst_sdk import credentials

# Initialize SDK once
catalyst_app = None
use_fallback = False
init_error = None

# Fetch credentials from environment if running locally
refresh_token = os.environ.get("CATALYST_REFRESH_TOKEN")
client_id = os.environ.get("CATALYST_CLIENT_ID")
client_secret = os.environ.get("CATALYST_CLIENT_SECRET")
project_id = os.environ.get("CATALYST_PROJECT_ID")
project_key = os.environ.get("CATALYST_PROJECT_KEY")  # Project Key is the ZAID
environment = os.environ.get("CATALYST_ENVIRONMENT", "Development")

try:
    if refresh_token and client_id and client_secret and project_id and project_key:
        print("Initializing Catalyst SDK locally using environment credentials...")
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
        print("Running in AppSail mode. Catalyst SDK will initialize dynamically per-request.")
except Exception as e:
    init_error = f"{type(e).__name__}: {str(e)}"
    print(f"Catalyst SDK initialization skipped: {e}")
    print("Defaulting database calls to local JSON fallback.")
    use_fallback = True

def get_local_fallback_data():
    """Reads local mock JSON file, using /tmp as a writeable cache in serverless production."""
    tmp_path = "/tmp/mock_crime_data.json"
    if os.path.exists(tmp_path):
        try:
            with open(tmp_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading fallback from /tmp: {e}")

    possible_paths = [
        "mock_crime_data.json",
        "../mock_crime_data.json",
        "server/mock_crime_data.json"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    data = json.load(f)
                with open(tmp_path, "w") as f:
                    json.dump(data, f, indent=2)
                return data
            except Exception as e:
                print(f"Error loading or caching fallback JSON: {e}")
                if 'data' in locals():
                    return data
    
    return {
        "locations": [
            {"ROWID": 1, "district": "Bengaluru", "police_station": "Koramangala PS", "latitude": 12.9352, "longitude": 77.6245}
        ],
        "crime_cases": [
            {"ROWID": 1, "fir_number": "FIR/BLR/2026/0001", "location_id": 1, "category": "Theft", "incident_date": "2026-06-15 22:30:00", "summary": "Royal Enfield motor vehicle theft."}
        ]
    }

def get_fallback_write_path() -> str:
    """Ensures fallback JSON exists in /tmp and returns its path."""
    tmp_path = "/tmp/mock_crime_data.json"
    if not os.path.exists(tmp_path):
        get_local_fallback_data()
    return tmp_path

def get_catalyst_app(request=None):
    global use_fallback, catalyst_app
    if use_fallback:
        return None
    if catalyst_app is not None:
        return catalyst_app
    if request is not None:
        try:
            catalyst_app = zcatalyst_sdk.initialize(req=request)
            return catalyst_app
        except Exception as e:
            print(f"Failed to initialize Catalyst SDK with request: {e}")
            use_fallback = True
            return None
    return None

def seed_database(app_instance):
    """Seeds the live Catalyst Data Store with the default cases from mock_crime_data.json."""
    try:
        data = get_local_fallback_data()
        datastore = app_instance.datastore()
        
        # 1. Seed locations
        location_mapping = {}  # maps old local location_id to new live location ROWID
        locations_table = datastore.table("location")
        for loc in data.get("locations", []):
            district = loc.get("district")
            police_station = loc.get("police_station")
            zcql = app_instance.zcql()
            query = f"SELECT ROWID FROM location WHERE district = '{district}' AND police_station = '{police_station}'"
            query_results = zcql.execute_query(query)
            if query_results:
                new_rowid = query_results[0].get("location", {}).get("ROWID")
            else:
                inserted_loc = locations_table.insert_row({
                    "district": district,
                    "police_station": police_station,
                    "latitude": loc.get("latitude"),
                    "longitude": loc.get("longitude")
                })
                new_rowid = inserted_loc.get("ROWID")
            location_mapping[loc.get("ROWID")] = new_rowid
            
        # 2. Seed cases
        cases_table = datastore.table("crime_cases")
        for case in data.get("crime_cases", []):
            fir_number = case.get("fir_number")
            zcql = app_instance.zcql()
            query = f"SELECT ROWID FROM crime_cases WHERE fir_number = '{fir_number}'"
            query_results = zcql.execute_query(query)
            if not query_results:
                new_loc_id = location_mapping.get(case.get("location_id"))
                cases_table.insert_row({
                    "fir_number": fir_number,
                    "location_id": new_loc_id,
                    "category": case.get("category"),
                    "incident_date": case.get("incident_date"),
                    "summary": case.get("summary")
                })
        print("Database seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")

def get_all_cases(request=None) -> list:
    """Retrieves all crime cases joined with their geographical location details."""
    global use_fallback
    
    app_instance = get_catalyst_app(request)

    if use_fallback or app_instance is None:
        data = get_local_fallback_data()
        cases = data.get("crime_cases", [])
        locations = {loc["ROWID"]: loc for loc in data.get("locations", [])}
        
        merged_cases = []
        for case in cases:
            loc = locations.get(case.get("location_id"), {})
            merged_cases.append({
                "id": case.get("ROWID"),
                "fir_number": case.get("fir_number"),
                "category": case.get("category"),
                "incident_date": case.get("incident_date"),
                "summary": case.get("summary"),
                "district": loc.get("district", "Unknown"),
                "police_station": loc.get("police_station", "Unknown"),
                "latitude": loc.get("latitude", 0.0),
                "longitude": loc.get("longitude", 0.0)
            })
        return merged_cases

    try:
        # Run ZCQL queries on Catalyst Data Store separately
        zcql = app_instance.zcql()
        cases_results = zcql.execute_query("SELECT ROWID, fir_number, category, incident_date, summary, location_id FROM crime_cases")
        locations_results = zcql.execute_query("SELECT ROWID, district, police_station, latitude, longitude FROM location")
        
        # Build locations dictionary for fast lookup
        locations = {}
        for row in locations_results:
            loc_data = row.get("location", {})
            row_id = loc_data.get("ROWID")
            if row_id:
                locations[row_id] = loc_data
                
        cases = []
        for row in cases_results:
            case_data = row.get("crime_cases", {})
            loc_id = case_data.get("location_id")
            try:
                loc_id = int(loc_id) if loc_id is not None else None
            except:
                pass
            loc = locations.get(loc_id, {})
            cases.append({
                "id": case_data.get("ROWID"),
                "fir_number": case_data.get("fir_number"),
                "category": case_data.get("category"),
                "incident_date": case_data.get("incident_date"),
                "summary": case_data.get("summary"),
                "district": loc.get("district", "Unknown"),
                "police_station": loc.get("police_station", "Unknown"),
                "latitude": float(loc.get("latitude", 0.0)) if loc.get("latitude") is not None else 0.0,
                "longitude": float(loc.get("longitude", 0.0)) if loc.get("longitude") is not None else 0.0
            })
            
        if not cases:
            # Seed the database if it is empty!
            print("Live Data Store is empty. Seeding database...")
            seed_database(app_instance)
            # Query again after seeding
            return get_all_cases(request)

        return cases
    except Exception as e:
        print(f"Error querying Catalyst Data Store: {e}. Falling back to local dataset.")
        use_fallback = True
        return get_all_cases(request)

def create_case(case_data: dict, request=None) -> dict:
    """Inserts a new crime case and merges location details, using live or fallback mode."""
    global use_fallback
    
    app_instance = get_catalyst_app(request)

    fir_number = case_data.get("fir_number")
    category = case_data.get("category")
    district = case_data.get("district")
    police_station = case_data.get("police_station")
    incident_date = case_data.get("incident_date")
    summary = case_data.get("summary")

    if use_fallback or app_instance is None:
        target_path = get_fallback_write_path()

        # 2. Read existing data
        if os.path.exists(target_path):
            with open(target_path, "r") as f:
                data = json.load(f)
        else:
            data = {"locations": [], "crime_cases": []}

        # 3. Find or create location entry
        locations = data.get("locations", [])
        location_id = None
        lat, lng = 12.9716, 77.5946  # Default coordinates for Bengaluru
        
        if district.lower() == "mysuru":
            lat, lng = 12.2958, 76.6394
        elif district.lower() == "udupi":
            lat, lng = 13.3409, 74.7421
        elif district.lower() == "hubballi-dharwad":
            lat, lng = 15.3647, 75.1240

        for loc in locations:
            if loc.get("district") == district and loc.get("police_station") == police_station:
                location_id = loc.get("ROWID")
                lat = loc.get("latitude", lat)
                lng = loc.get("longitude", lng)
                break
        
        if location_id is None:
            location_id = max([loc.get("ROWID", 0) for loc in locations] + [0]) + 1
            new_loc = {
                "ROWID": location_id,
                "district": district,
                "police_station": police_station,
                "latitude": lat,
                "longitude": lng
            }
            locations.append(new_loc)
            data["locations"] = locations

        # 4. Insert crime case
        cases = data.get("crime_cases", [])
        new_case_id = max([c.get("ROWID", 0) for c in cases] + [0]) + 1
        new_case = {
            "ROWID": new_case_id,
            "fir_number": fir_number,
            "location_id": location_id,
            "category": category,
            "incident_date": incident_date,
            "summary": summary
        }
        cases.append(new_case)
        data["crime_cases"] = cases

        # 5. Save back to json file
        with open(target_path, "w") as f:
            json.dump(data, f, indent=2)

        return {
            "id": new_case_id,
            "fir_number": fir_number,
            "category": category,
            "incident_date": incident_date,
            "summary": summary,
            "district": district,
            "police_station": police_station,
            "latitude": lat,
            "longitude": lng
        }

    try:
        datastore = app_instance.datastore()
        zcql = app_instance.zcql()

        # 1. Search for existing location
        query = f"SELECT ROWID, latitude, longitude FROM location WHERE district = '{district}' AND police_station = '{police_station}'"
        query_results = zcql.execute_query(query)

        location_id = None
        lat, lng = 12.9716, 77.5946  # Default coordinates for Bengaluru
        if district.lower() == "mysuru":
            lat, lng = 12.2958, 76.6394
        elif district.lower() == "udupi":
            lat, lng = 13.3409, 74.7421
        elif district.lower() == "hubballi-dharwad":
            lat, lng = 15.3647, 75.1240

        if query_results:
            loc_data = query_results[0].get("location", {})
            location_id = loc_data.get("ROWID")
            lat = float(loc_data.get("latitude", lat))
            lng = float(loc_data.get("longitude", lng))
        else:
            # Create new location row
            location_table = datastore.table("location")
            inserted_loc = location_table.insert_row({
                "district": district,
                "police_station": police_station,
                "latitude": lat,
                "longitude": lng
            })
            location_id = inserted_loc.get("ROWID")

        # 2. Insert the crime case
        case_table = datastore.table("crime_cases")
        inserted_case = case_table.insert_row({
            "fir_number": fir_number,
            "location_id": location_id,
            "category": category,
            "incident_date": incident_date,
            "summary": summary
        })

        return {
            "id": inserted_case.get("ROWID"),
            "fir_number": fir_number,
            "category": category,
            "incident_date": incident_date,
            "summary": summary,
            "district": district,
            "police_station": police_station,
            "latitude": lat,
            "longitude": lng
        }
    except Exception as e:
        print(f"Error writing to Catalyst Data Store: {e}. Falling back to local database write.")
        use_fallback = True
        return create_case(case_data, request)


def update_case(case_id: int, case_data: dict, request=None) -> dict:
    """Updates an existing crime case and handles location adjustments, using live or fallback mode."""
    global use_fallback
    
    app_instance = get_catalyst_app(request)

    fir_number = case_data.get("fir_number")
    category = case_data.get("category")
    district = case_data.get("district")
    police_station = case_data.get("police_station")
    incident_date = case_data.get("incident_date")
    summary = case_data.get("summary")

    if use_fallback or app_instance is None:
        target_path = get_fallback_write_path()

        if os.path.exists(target_path):
            with open(target_path, "r") as f:
                data = json.load(f)
        else:
            raise Exception("Local database file not found")

        # Find the case to update
        cases = data.get("crime_cases", [])
        case_to_update = None
        for case in cases:
            if case.get("ROWID") == case_id:
                case_to_update = case
                break
        
        if not case_to_update:
            raise Exception(f"Case with ID {case_id} not found")

        # Find or create location entry
        locations = data.get("locations", [])
        location_id = None
        lat, lng = 12.9716, 77.5946  # Default coordinates for Bengaluru
        
        if district.lower() == "mysuru":
            lat, lng = 12.2958, 76.6394
        elif district.lower() == "udupi":
            lat, lng = 13.3409, 74.7421
        elif district.lower() == "hubballi-dharwad":
            lat, lng = 15.3647, 75.1240

        for loc in locations:
            if loc.get("district") == district and loc.get("police_station") == police_station:
                location_id = loc.get("ROWID")
                lat = loc.get("latitude", lat)
                lng = loc.get("longitude", lng)
                break
        
        if location_id is None:
            location_id = max([loc.get("ROWID", 0) for loc in locations] + [0]) + 1
            new_loc = {
                "ROWID": location_id,
                "district": district,
                "police_station": police_station,
                "latitude": lat,
                "longitude": lng
            }
            locations.append(new_loc)
            data["locations"] = locations

        # Update case fields
        case_to_update["fir_number"] = fir_number
        case_to_update["category"] = category
        case_to_update["location_id"] = location_id
        case_to_update["incident_date"] = incident_date
        case_to_update["summary"] = summary

        with open(target_path, "w") as f:
            json.dump(data, f, indent=2)

        return {
            "id": case_id,
            "fir_number": fir_number,
            "category": category,
            "incident_date": incident_date,
            "summary": summary,
            "district": district,
            "police_station": police_station,
            "latitude": lat,
            "longitude": lng
        }

    try:
        datastore = app_instance.datastore()
        zcql = app_instance.zcql()

        # 1. Search for existing location
        query = f"SELECT ROWID, latitude, longitude FROM location WHERE district = '{district}' AND police_station = '{police_station}'"
        query_results = zcql.execute_query(query)

        location_id = None
        lat, lng = 12.9716, 77.5946
        if district.lower() == "mysuru":
            lat, lng = 12.2958, 76.6394
        elif district.lower() == "udupi":
            lat, lng = 13.3409, 74.7421
        elif district.lower() == "hubballi-dharwad":
            lat, lng = 15.3647, 75.1240

        if query_results:
            loc_data = query_results[0].get("location", {})
            location_id = loc_data.get("ROWID")
            lat = float(loc_data.get("latitude", lat))
            lng = float(loc_data.get("longitude", lng))
        else:
            # Create new location row
            location_table = datastore.table("location")
            inserted_loc = location_table.insert_row({
                "district": district,
                "police_station": police_station,
                "latitude": lat,
                "longitude": lng
            })
            location_id = inserted_loc.get("ROWID")

        # 2. Update the crime case
        case_table = datastore.table("crime_cases")
        case_table.update_row({
            "ROWID": case_id,
            "fir_number": fir_number,
            "location_id": location_id,
            "category": category,
            "incident_date": incident_date,
            "summary": summary
        })

        return {
            "id": case_id,
            "fir_number": fir_number,
            "category": category,
            "incident_date": incident_date,
            "summary": summary,
            "district": district,
            "police_station": police_station,
            "latitude": lat,
            "longitude": lng
        }
    except Exception as e:
        print(f"Error updating in Catalyst Data Store: {e}. Falling back to local database update.")
        use_fallback = True
        return update_case(case_id, case_data, request)


def delete_case(case_id: int, request=None) -> bool:
    """Deletes an existing crime case, using live or fallback mode."""
    global use_fallback
    
    app_instance = get_catalyst_app(request)

    if use_fallback or app_instance is None:
        target_path = get_fallback_write_path()

        if os.path.exists(target_path):
            with open(target_path, "r") as f:
                data = json.load(f)
        else:
            raise Exception("Local database file not found")

        cases = data.get("crime_cases", [])
        original_len = len(cases)
        updated_cases = [c for c in cases if c.get("ROWID") != case_id]
        
        if len(updated_cases) == original_len:
            return False
            
        data["crime_cases"] = updated_cases

        with open(target_path, "w") as f:
            json.dump(data, f, indent=2)

        return True

    try:
        datastore = app_instance.datastore()
        case_table = datastore.table("crime_cases")
        case_table.delete_row(case_id)
        return True
    except Exception as e:
        print(f"Error deleting in Catalyst Data Store: {e}. Falling back to local database delete.")
        use_fallback = True
        return delete_case(case_id, request)


