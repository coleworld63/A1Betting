# Dockerfile for UltimateSportsBettingApp (multi-stage build)

# --- Backend ---
FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/ ./backend/
RUN python -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install fastapi uvicorn sqlalchemy pydantic shap pytest

# --- Frontend ---
FROM node:20 AS frontend
WORKDIR /frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# --- Final image ---
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend /app/backend ./backend
COPY --from=frontend /frontend/frontend/dist ./frontend/dist
EXPOSE 8000
CMD ["python", "./backend/main.py"]
