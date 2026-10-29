# AICTE FDR Portal — System Architecture

## 1. Executive Summary
The **AICTE Security Deposit / Fixed Deposit Receipt (FDR) Management Portal** is a centralized compliance platform designed to manage, verify, monitor, and audit financial security instruments deposited by technical institutions affiliated with the All India Council for Technical Education (AICTE).

The platform replaces manual verification with a secure, automated workflow combining **Next.js** for frontend compliance dashboards, **Supabase** (PostgreSQL, Auth, Storage, RLS) for secure data governance, and a specialized **Python/FastAPI** microservice for OCR and document discrepancy analysis.

---

## 2. Architectural Pillars

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|  (Institution Staff, Scrutiny Officers, Approving Authority, System Admin)       |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / SSL
                                          v
+-----------------------------------------------------------------------------------+
|                           FRONTEND & APP SERVER (Next.js)                         |
|  - App Router (React Server Components + Interactive Client Views)               |
|  - Server Actions & Route Handlers for privileged transitions                     |
|  - Supabase SSR Integration (@supabase/ssr)                                       |
|  - TanStack Table (Data Grids), Recharts (KPIs), React Hook Form + Zod           |
+-------------------+---------------------------------------+-----------------------+
                    |                                       |
        Client & Server Auth + DB Sync           Internal Authorized Requests
                    |                            (HMAC / Token Authenticated)
                    v                                       v
+---------------------------------------+   +---------------------------------------+
|          SUPABASE PLATFORM            |   |         PYTHON AI MICROSERVICE        |
|  - PostgreSQL with Row-Level Security |   |             (FastAPI)                 |
|  - Supabase Auth (JWT & Sessions)     |   |  - PyMuPDF (Digital PDF extraction)   |
|  - Supabase Storage (Private Buckets) |<--+  - OpenCV (Image Preprocessing)       |
|  - Database Functions & Triggers      |   |  - Tesseract OCR (Scanned Instruments)|
|  - Audit Log Append-Only Storage      |   |  - Discrepancy & Confidence Engine    |
+---------------------------------------+   +---------------------------------------+
```

---

## 3. Technology Stack Breakdown

| Layer | Technology | Primary Responsibilities |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Responsive UI, Server Components, SSR Cookie Authentication |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons | Official AICTE compliance theme, responsive layouts |
| **Data & State Management** | TanStack Table, TanStack Query | Complex searchable tables, data pagination, client state |
| **Form & Schema Validation**| React Hook Form, Zod | Multi-step FDR submission wizard, client/server validation |
| **Core Database & Backend** | Supabase PostgreSQL | Relational data, RLS security policies, triggers |
| **Authentication & AuthZ**  | Supabase Auth + `@supabase/ssr` | Secure session management, role verification |
| **Encrypted File Storage**  | Supabase Storage (Private) | FDR scans, sanction letters, verification proof |
| **AI Document Processing**  | Python 3.12, FastAPI, Pydantic | OCR, PDF extraction, discrepancy detection |
| **Document Vision**         | Tesseract OCR, PyMuPDF, OpenCV | Scanned document cleaning, text bounding box parsing |

---

## 4. Separation of Concerns & Security Principles

1. **AI is an Advisor, Not a Judge**:
   The AI service extracts text, scores confidence, and highlights discrepancies between institution submissions and document text. The AI *never* certifies authenticity or approves financial releases. Only an authorized human officer makes formal decisions.
2. **PostgreSQL Row Level Security (RLS)**:
   Access controls are enforced at the database row level. Even if a user crafts a direct API request, Postgres rejects queries accessing other institutions' records.
3. **Defense-in-Depth for Storage**:
   Document buckets are strictly private. Files are accessed exclusively via temporary signed URLs generated on the server with user identity checks.
4. **Service-to-Service Security**:
   FastAPI endpoints are protected with mutual API token verification and never exposed to the public browser.
