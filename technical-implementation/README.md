# AICTE Security Deposit & Fixed Deposit Receipt (FDR) Management Portal
## Complete Technical Implementation Handbook

This folder contains the complete, authoritative, and exhaustive technical implementation documentation for the **AICTE FDR Management Portal**. It covers every subsystem from database schemas and Row Level Security to the Python AI document intelligence microservice, Next.js App Router frontend, animations, testing, and student viva defense.

---

### Table of Contents

| File | Subsystem / Topic | Description |
| :--- | :--- | :--- |
| **[`PROJECT-DOSSIER-FEASIBILITY-IMPACT-RESEARCH.md`](./PROJECT-DOSSIER-FEASIBILITY-IMPACT-RESEARCH.md)** | **★ Comprehensive Master Dossier ★** | **Full project dossier covering Technical Implementation, Feasibility & Viability, Impacts & Benefits, and Research Foundations & Statutory References.** |
| **[`COMPLETE-TECHNICAL-EXPLANATION.md`](./COMPLETE-TECHNICAL-EXPLANATION.md)** | **Master Technical Report** | **Exhaustive end-to-end report documenting all subsystems, architecture decisions, code artifacts, and chronological development log.** |
| **[`01-SYSTEM-ARCHITECTURE.md`](./01-SYSTEM-ARCHITECTURE.md)** | System Architecture & Flow | Microservice topology, dual-layer backend, sequence diagrams, and regulatory mandate. |
| **[`02-DATABASE-AND-SUPABASE.md`](./02-DATABASE-AND-SUPABASE.md)** | PostgreSQL Schema & Supabase | 12 tables, indexes, constraints, updated_at triggers, RLS security policies, and seed fixtures. |
| **[`03-AI-DOCUMENT-EXTRACTION.md`](./03-AI-DOCUMENT-EXTRACTION.md)** | Python AI/OCR Microservice | OpenCV preprocessing, Tesseract OCR, PyMuPDF digital text extraction, and discrepancy scoring. |
| **[`04-AUTHENTICATION-AND-SECURITY.md`](./04-AUTHENTICATION-AND-SECURITY.md)** | Auth, RBAC & Audit Ledger | Supabase Auth, `@supabase/ssr`, Next.js middleware role gates, 4-tier RBAC, and append-only audit trail. |
| **[`05-FRONTEND-AND-ANIMATIONS.md`](./05-FRONTEND-AND-ANIMATIONS.md)** | Next.js Frontend & Animations | App Router architecture, 21 routes, Landing page, Login page, Register page, and streaming `loading.tsx`. |
| **[`06-API-AND-INTEGRATIONS.md`](./06-API-AND-INTEGRATIONS.md)** | API Contracts & Security | FastAPI internal endpoints, Next.js route handlers, Server Actions, and payload specifications. |
| **[`07-TESTING-AND-VERIFICATION.md`](./07-TESTING-AND-VERIFICATION.md)** | Testing & Quality Assurance | Automated Pytest suite, Frontend Auth suite, Detailed Supabase suite, and production build checks. |
| **[`08-VIVA-AND-EVALUATION-GUIDE.md`](./08-VIVA-AND-EVALUATION-GUIDE.md)** | B.Tech CS Viva Guide | Explanations of complex concepts in simple terms, architectural defense, and evaluator Q&A. |

---

### High-Level Tech Stack Summary

```
+-----------------------------------------------------------------------------------------+
|                                   USER AGENTS & BROWSERS                                |
|          Technical Institutions · Scrutiny Officers · Approving Authorities · Admins    |
+-----------------------------------------------------------------------------------------+
                                            │
                                            ▼
+-----------------------------------------------------------------------------------------+
|                               FRONTEND APPLICATION (Port 3000)                          |
|  - Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4                    |
|  - 21 Statically & Dynamically Optimized Routes (Turbopack)                            |
|  - Role-Based Route Proxy / Middleware (Session Token Verification)                     |
|  - Rich Micro-Animations: Orbital Rings, Shimmer Bars, Password Meter, Captcha Spin     |
+-----------------------------------------------------------------------------------------+
                      │                                             │
      Internal Proxy  │                                             │  Supabase Auth / SSR
      Token Guarded   │                                             │  Session Cookies
                      ▼                                             ▼
+-----------------------------------------+     +-----------------------------------------+
|     AI MICROSERVICE (Port 8000)         |     |        SUPABASE PLATFORM                |
|  - Python 3.12 + FastAPI + Pydantic v2  |     |  - PostgreSQL 16 (12 Relational Tables) |
|  - OpenCV Gaussian & Otsu Preprocessing |     |  - Row Level Security (RLS) on all tabs |
|  - Tesseract 5.5 OCR (--psm 6)          |     |  - Private Storage ('fdr-documents')    |
|  - PyMuPDF Vector Text Extraction       |     |  - Security Definer Helper Functions    |
|  - Deterministic Discrepancy Engine     |     |  - Append-Only Audit Trail (Immutable)  |
+-----------------------------------------+     +-----------------------------------------+
```

---

### Quick Start Verification

To run all automated test suites and compile the production build in a single step:

```bash
# From repository root
npm test
```

To run individual verification suites:
- **Python AI Pytest**: `npm run test:ai`
- **Frontend Auth & Roles**: `npm run test:frontend`
- **Detailed Supabase & Storage**: `npm run test:supabase`
- **Next.js Production Build**: `npm run build`

