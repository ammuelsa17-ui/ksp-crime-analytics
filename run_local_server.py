import sys
import os

site_pkg = "/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages"
server_dir = os.path.abspath("server")

# Remove server directory from sys.path so modules like fastapi/pydantic load from system site-packages
sys.path = [p for p in sys.path if p != server_dir]
sys.path.insert(0, site_pkg)

# Import dependencies from site-packages first
import fastapi
import pydantic
import uvicorn

# Now add server_dir for main.py imports
sys.path.insert(1, server_dir)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, app_dir=server_dir)
