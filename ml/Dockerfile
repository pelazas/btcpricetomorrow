# Builder stage
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies for compiling Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libgomp1 \  
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefer-binary -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies (e.g., libgomp1 for OpenMP)
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy only necessary files (avoid copying the entire directory twice)
COPY . .    

EXPOSE 8001
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "app:app"]