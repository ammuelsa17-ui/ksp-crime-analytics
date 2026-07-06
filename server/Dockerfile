FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY . .

# Expose server port
EXPOSE 8000

# Start server command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
