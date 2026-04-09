FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    ffmpeg \
    python3-setuptools \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, and wheel
RUN pip install --upgrade pip setuptools wheel

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose port
EXPOSE 5000

# Run Flask app
CMD ["python", "app.py"]
