# UltimateSportsBettingApp

[![CI](https://github.com/<your-org-or-username>/UltimateSportsBettingApp/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-org-or-username>/UltimateSportsBettingApp/actions/workflows/ci.yml)

This is a production-ready, full-stack AI sports betting analytics application. The architecture, features, and directory structure are based on the comprehensive documentation in FINAL_WORKSPACE_SUMMARY.md and WORKSPACE_INVENTORY.md.

## Features

- React/TypeScript frontend (Vite)
- FastAPI/Python backend
- Unified services and custom hooks
- Type-safe models and interfaces
- Real-time analytics, ML predictions, and advanced betting strategies
- Comprehensive documentation in every folder

## Directory Structure

- `frontend/`: React + Vite frontend app
- `backend/`: FastAPI backend app
- `.github/`: Copilot and workflow instructions

See the documentation in each folder and the summary/inventory markdown files for full details.

## Build Prerequisites

- The frontend uses **Vite**. All environment variables must be set in a `.env` file in `frontend/` and must be prefixed with `VITE_` (see `frontend/README.md` for details).
- **Do not use `process.env` in frontend code.** Use `import.meta.env.VITE_...` instead.
- For local development and production builds, follow the instructions in `frontend/README.md` to configure environment variables and run the app.

## Integration Points

### BankrollPage

- **API:** `GET /api/transactions` — Fetches all user transactions for bankroll management.
- **Frontend:** `/frontend/src/components/BankrollPage.tsx` uses Axios to fetch and display transactions, with robust loading and error handling.
- **Test:** `/frontend/src/components/BankrollPage.test.tsx` covers integration with API and error handling.

### ArbitragePage

- **API:** `GET /api/arbitrage-opportunities` — Fetches all arbitrage opportunities for the user.
- **Frontend:** `/frontend/src/components/ArbitragePage.tsx` uses Axios to fetch and display opportunities, with robust loading and error handling.
- **Test:** `/frontend/src/components/ArbitragePage.test.tsx` covers integration with API and error handling.
