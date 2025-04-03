# Use an official lightweight Python image
FROM python:3.9-slim AS builder

WORKDIR /app

COPY . .
# Install dependencies separately to leverage Docker layer caching

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Production image
FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . . 

# Use Gunicorn for production
EXPOSE 8001
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "app:app"]
