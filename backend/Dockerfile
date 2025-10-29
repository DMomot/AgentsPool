# Backend Dockerfile for AgentsPool (Railway deployment)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST (layer cached until requirements.txt changes)
COPY requirements.txt .

# Install Python dependencies with BuildKit cache
# BuildKit будет кешировать /root/.cache/pip между билдами
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copy application code (fast layer, changes frequently)
COPY . .

# Create cache directory for HuggingFace models
RUN mkdir -p /app/.cache/huggingface

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "main.py"]
