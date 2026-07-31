from pathlib import Path
import hashlib
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "crime_forecast_rf.joblib"
REPORT_PATH = MODEL_DIR / "training_report.json"

data = pd.read_csv("data/synthetic_crime_history.csv")
data = data.sort_values("incident_date")

feature_columns = [
    "district",
    "crime_category",
    "hour_of_day",
    "day_of_week",
    "recent_7day_count",
    "precinct_density_score",
]

target_column = "future_incident_count"

split_index = int(len(data) * 0.8)

train_data = data.iloc[:split_index]
test_data = data.iloc[split_index:]

categorical_features = ["district", "crime_category"]
numeric_features = [
    "hour_of_day",
    "day_of_week",
    "recent_7day_count",
    "precinct_density_score",
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        ),
        ("numeric", "passthrough", numeric_features),
    ]
)

model = RandomForestRegressor(
    n_estimators=100,
    max_depth=12,
    random_state=42,
)

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ]
)

pipeline.fit(
    train_data[feature_columns],
    train_data[target_column],
)

predictions = pipeline.predict(test_data[feature_columns])

joblib.dump(pipeline, MODEL_PATH)

checksum = hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()

report = {
    "model_name": "Random Forest Regressor",
    "model_version": "v1.2.0-prototype",
    "dataset_source": "Synthetic historical crime dataset (12,000 Records)",
    "training_records": len(train_data),
    "testing_records": len(test_data),
    "split_method": "Chronological 80/20 split",
    "feature_columns": feature_columns,
    "model_parameters": {
        "n_estimators": model.n_estimators,
        "max_depth": model.max_depth,
        "random_state": model.random_state
    },
    "evaluation_metrics": {
        "r2_score": round(float(r2_score(test_data[target_column], predictions)), 4),
        "mae": round(
            float(mean_absolute_error(test_data[target_column], predictions)),
            4,
        ),
        "rmse": round(
            float(mean_squared_error(
                test_data[target_column],
                predictions,
            ) ** 0.5),
            4,
        ),
    },
    "model_checksum_sha256": checksum,
}

REPORT_PATH.write_text(
    json.dumps(report, indent=2),
    encoding="utf-8",
)

print("Training finished successfully!")
print(json.dumps(report, indent=2))
