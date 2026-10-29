#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "    AICTE SECURITY DEPOSIT / FDR MANAGEMENT PORTAL       "
echo "=========================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Kill any stale process on 3000 or 8000
echo "[1/4] Checking and freeing ports 3000 and 8000..."
lsof -ti:3000,8000 | xargs kill -9 2>/dev/null || true

# 2. Check Python virtual environment
echo "[2/4] Verifying Python AI Service..."
if [ ! -d "ai-service/venv" ]; then
    echo "Creating Python virtualenv..."
    python3.12 -m venv ai-service/venv || python3 -m venv ai-service/venv
    ./ai-service/venv/bin/pip install -r ai-service/requirements.txt
fi

# 3. Check frontend dependencies
echo "[3/4] Verifying Next.js dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    (cd frontend && pnpm install)
fi

# 4. Start both servers concurrently
echo "[4/4] Starting AICTE FDR Management Portal..."
echo ""
echo "  -> Next.js Frontend : http://localhost:3000"
echo "  -> Python FastAPI   : http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)"
echo ""

pnpm run dev
