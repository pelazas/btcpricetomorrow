# Use an official lightweight Python image
FROM python:3.9-slim AS builder

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
COPY requirements.txt . 
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Production image
FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY app.py .

# Use Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "app:app"]
