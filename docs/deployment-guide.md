# AICTE FDR Portal — Deployment & Operations Guide

## 1. Prerequisites
- **Node.js**: v20 or v22 LTS
- **Package Manager**: `pnpm`
- **Python**: 3.12+
- **OCR Engine**: Tesseract OCR (`brew install tesseract` on macOS, `apt-get install tesseract-ocr` on Linux)
- **Database**: Supabase PostgreSQL (Local or Managed Cloud)

---

## 2. Local Development Setup

### 2.1 Clone and Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the key parameters match your environment:
```ini
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_API_KEY=development_secure_internal_ai_token_key_32chars
```

### 2.2 Database Migrations (Supabase)
Apply version-controlled migrations:
```bash
npx supabase migration up
# Or execute migrations directly in Supabase SQL editor:
# 1. supabase/migrations/20261029000000_init_aicte_schema.sql
# 2. supabase/migrations/20261029000001_rls_and_triggers.sql
# 3. supabase/seed.sql
```

### 2.3 Start the Python AI Microservice
```bash
cd ai-service
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Health endpoint will be accessible at: `http://127.0.0.1:8000/health`.

### 2.4 Start the Next.js Frontend
In a separate terminal:
```bash
cd frontend
pnpm dev
```
Open your browser at: `http://localhost:3000`.

---

## 3. Production Deployment with Docker

### 3.1 Python AI Service Dockerfile
The service includes a production Dockerfile in `ai-service/Dockerfile`:
```bash
cd ai-service
docker build -t aicte-fdr-ai-service .
docker run -p 8000:8000 --env-file ../.env aicte-fdr-ai-service
```

### 3.2 Next.js Deployment
Deployable to Vercel, Railway, or AWS ECS with standard Next.js standalone build.

