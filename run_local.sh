#!/bin/bash
# run_local.sh — starts the FastAPI server using local Python 3.12 venv
# Usage: bash run_local.sh  (run from project root)
SERVER_DIR="$(cd "$(dirname "$0")/server" && pwd)"
VENV_PYTHON="$SERVER_DIR/venv312/bin/python"

if [ ! -f "$VENV_PYTHON" ]; then
  echo "Creating venv312..."
  /usr/local/bin/python3.12 -m venv "$SERVER_DIR/venv312"
  "$SERVER_DIR/venv312/bin/pip" install fastapi uvicorn "zcatalyst-sdk>=1.4.0" pydantic -q
fi

echo "Starting API on http://localhost:9000 ..."
cd "$SERVER_DIR"
# Prepend venv site-packages so they take priority over bundled py3.9 packages
VENV_SITE="$SERVER_DIR/venv312/lib/python3.12/site-packages"
PYTHONPATH="$VENV_SITE" "$VENV_PYTHON" -c "
import sys, os
sys.path.insert(0, '$VENV_SITE')
# Remove paths that would load the bundled py3.9 packages first
sys.path = [p for p in sys.path if 'datathon 2026/server' not in p or p == '$VENV_SITE']
sys.path.insert(0, '$SERVER_DIR')
os.chdir('$SERVER_DIR')
exec(open('main.py').read())
"
