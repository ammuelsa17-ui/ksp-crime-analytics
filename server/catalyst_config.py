# catalyst_config.py
import os

# Read GEMINI_API_KEY from environment variables (e.g., set via Catalyst AppSail Console or .env file)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_API_KEY_FALLBACK = os.environ.get("GEMINI_API_KEY", "")
