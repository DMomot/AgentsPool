# Backend Dockerfile for AgentsPool (Railway deployment)
# Optimized for maximum layer caching

# === BASE STAGE ===
FROM python:3.11-slim as base

WORKDIR /app

# Install system dependencies (cached until OS changes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# === DEPENDENCIES STAGE ===
FROM base as dependencies

# Copy ONLY requirements.txt first (layer cached until requirements change)
COPY requirements.txt .

# Install Python dependencies with BuildKit cache mount
# This layer is REUSED if requirements.txt doesn't change
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# === RUNTIME STAGE ===
FROM base as runtime

# Copy installed packages from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Create cache directory for HuggingFace models (will be mounted as volume)
RUN mkdir -p /app/.cache/huggingface

# Copy application code (this layer changes frequently - but it's small and fast!)
COPY . .

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
