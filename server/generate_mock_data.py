import json
import random
from datetime import datetime, timedelta

# Coordinates and details of major districts in Karnataka for spatial maps
DISTRICTS = {
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946, "stations": ["Koramangala PS", "Indiranagar PS", "Jayanagar PS", "Whitefield PS"]},
    "Mysuru": {"lat": 12.2958, "lon": 76.6394, "stations": ["Lashkar PS", "Devaraja PS", "Krishnaraja PS"]},
    "Hubballi-Dharwad": {"lat": 15.3647, "lon": 75.1240, "stations": ["Suburban PS", "Town PS", "Vidyanagar PS"]},
    "Mangaluru": {"lat": 12.9141, "lon": 74.8560, "stations": ["Urwa PS", "Kadri PS", "Bunder PS"]},
    "Belagavi": {"lat": 15.8497, "lon": 74.4977, "stations": ["Khade Bazar PS", "Camp PS"]},
    "Kalaburagi": {"lat": 17.3297, "lon": 76.8343, "stations": ["Station Bazar PS", "Chowk PS"]},
    "Shivamogga": {"lat": 13.9299, "lon": 75.5681, "stations": ["Kote PS", "Tunga Nagar PS"]},
    "Udupi": {"lat": 13.3409, "lon": 74.7421, "stations": ["Udupi Town PS", "Manipal PS"]}
}

CRIME_TEMPLATES = {
    "Theft": [
        "A parked two-wheeler with registration number KA-{dist_code}-E-{num} was stolen from outside a residential house during night hours. The owner noticed the theft in the morning and filed a complaint.",
        "Complainant reported that someone broke into their locked house by breaking the lock of the main door and stole gold ornaments weighing 45 grams and Rs 20,000 cash.",
        "A mobile phone and wallet containing credit cards were snatched from a pedestrian walking near the park by two suspects riding a motorcycle without a license plate."
    ],
    "Cybercrime": [
        "Victim received a phone call from an unknown suspect pretending to be an SBI customer support officer. Under the pretext of updating KYC details, the suspect obtained an OTP and withdrew Rs {amount} from the victim's account.",
        "A fraudster hacked the Instagram account of the complainant and sent messages to their friends requesting urgent money transfer of Rs {amount} claiming a medical emergency.",
        "The complainant fell victim to a part-time job scam online. The suspect promised high daily returns for rating hotels on a portal, tricking the victim into transferring Rs {amount} in multiple tranches."
    ],
    "Assault": [
        "A physical altercation broke out between two shopkeepers over a parking spot dispute. One suspect attacked the complainant with a wooden stick causing minor injuries to the left arm.",
        "A dispute between neighbors regarding water drainage overflow escalated into a fight. The suspects verbally abused and assaulted the complainant and family members, causing bruises.",
        "An argument at a local restaurant regarding food delay turned violent. Two customers assaulted the server, causing minor facial injuries before fleeing the spot."
    ],
    "Fraud": [
        "The suspect collected an advance payment of Rs {amount} from the victim under the false promise of securing a junior assistant job in the state electricity department, and is now absconding.",
        "A real estate developer cheated the complainant by collecting Rs {amount} as booking amount for a residential plot, but later sold the same plot to another buyer using forged documents.",
        "The accused induced the victim to invest Rs {amount} in a bogus cryptocurrency platform promising double returns in 3 months. The portal has now shut down, and the accused is unreachable."
    ]
}

MOCK_NAMES = [
    "Ramesh Kumar", "Suresh Gowda", "Anil Patil", "Sunitha Rao", "Priyanka Naik",
    "Manjunath Hegde", "Vijay Shankar", "Sandeep K", "Kiran Kumar", "Naveen Raj",
    "Deepa M", "Harish Prasad", "Savitha Devadiga", "Raghavendra Acharya", "Ganesh Bhat"
]

def generate_cases(num_cases=200):
    cases = []
    locations = []
    accused_list = []
    victims = []
    investigations = []

    start_date = datetime(2025, 1, 1)

    for i in range(1, num_cases + 1):
        # Select random district and station
        dist_name = random.choice(list(DISTRICTS.keys()))
        dist_data = DISTRICTS[dist_name]
        station = random.choice(dist_data["stations"])

        # Offset coordinates slightly from centroid to make clusters
        lat_offset = random.uniform(-0.02, 0.02)
        lon_offset = random.uniform(-0.02, 0.02)
        lat = dist_data["lat"] + lat_offset
        lon = dist_data["lon"] + lon_offset

        location_id = i
        locations.append({
            "ROWID": location_id,
            "district": dist_name,
            "police_station": station,
            "latitude": round(lat, 6),
            "longitude": round(lon, 6)
        })

        # Base case details
        fir_number = f"FIR/{dist_name[:3].upper()}/{2026}/{i:04d}"
        category = random.choice(list(CRIME_TEMPLATES.keys()))
        
        # Populate template fields
        dist_code = f"{random.randint(1, 55):02d}"
        num = f"{random.randint(1000, 9999)}"
        amount = f"{random.randint(10, 200) * 1000}"
        
        template = random.choice(CRIME_TEMPLATES[category])
        summary = template.format(dist_code=dist_code, num=num, amount=amount)

        # Incident timestamp
        days_offset = random.randint(0, 500)
        incident_time = start_date + timedelta(days=days_offset, hours=random.randint(0, 23))
        
        case_id = i
        cases.append({
            "ROWID": case_id,
            "fir_number": fir_number,
            "location_id": location_id,
            "category": category,
            "incident_date": incident_time.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": summary
        })

        # Generate Accused details (sometimes multiple, sometimes none)
        num_accused = random.choices([0, 1, 2], weights=[0.2, 0.6, 0.2])[0]
        for a_idx in range(num_accused):
            accused_list.append({
                "ROWID": len(accused_list) + 1,
                "case_id": case_id,
                "name": random.choice(MOCK_NAMES) + " (Accused)",
                "age": random.randint(18, 60),
                "status": random.choice(["Arrested", "Absconding", "Under Interrogation"])
            })

        # Generate Victim details (at least one)
        victims.append({
            "ROWID": len(victims) + 1,
            "case_id": case_id,
            "name": random.choice(MOCK_NAMES),
            "age": random.randint(15, 75),
            "gender": random.choice(["Male", "Female"])
        })

        # Generate Investigation record
        investigations.append({
            "ROWID": i,
            "case_id": case_id,
            "officer_name": f"Inspector {random.choice(MOCK_NAMES).split()[0]}",
            "diary_entry": f"Case registered. Initial statements recorded. Site survey completed. Status set to {random.choice(['Active', 'Closed'])}.",
            "status": random.choice(["Active", "Closed"]),
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    # Save to consolidated JSON
    payload = {
        "locations": locations,
        "crime_cases": cases,
        "accused": accused_list,
        "victims": victims,
        "investigation_records": investigations
    }

    with open("mock_crime_data.json", "w") as f:
        json.dump(payload, f, indent=2)

    print(f"Generated {num_cases} mock records and saved to server/mock_crime_data.json successfully.")

if __name__ == "__main__":
    generate_cases(200)
