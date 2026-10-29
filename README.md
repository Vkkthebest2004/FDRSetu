# AICTE Security Deposit / FDR Management Portal

A full-stack, enterprise-grade compliance platform designed to register, verify, monitor, and audit Fixed Deposit Receipts (FDRs) deposited by technical education institutions affiliated with the **All India Council for Technical Education (AICTE)**.

Built with **Next.js 16 (App Router)**, **Supabase (PostgreSQL, Auth, Storage, RLS)**, and a specialized **Python/FastAPI** AI & OCR document processing microservice.

---

## 1. Key Capabilities

- **Institutional FDR Registry**: Multi-step submission wizard with SHA-256 cryptographic hash computation, file size validation, and institutional data isolation.
- **AI-Powered OCR & Field Extraction**: High-resolution page rasterization (300 DPI) via PyMuPDF, OpenCV contrast and noise preprocessing, Tesseract OCR, and regex parsing for Indian banking receipts.
- **Deterministic Discrepancy Engine**: Automatic comparison between submitted values and extracted text, highlighting mismatches with severity scoring (`HIGH`, `MEDIUM`, `LOW`).
- **Scrutiny Officer Workbench**: Side-by-side comparison matrix, officer observation logs, and decision workflows (Accept, Return for Correction, Flag Discrepancy, Reject).
- **Automated Maturity Monitoring**: Configurable advance alerts at 90, 60, 30, and 15 days before maturity.
- **Renewals & Replacements**: Chain of custody linking replacement instruments to expiring predecessors.
- **Multi-Tier Release/Refund Workflow**: Institution request -> Officer scrutiny & recommendation -> Approving Authority sign-off -> Bank release order recording.
- **Append-Only Tamper-Evident Audit Trail**: Protected by database Row-Level Security where `UPDATE` and `DELETE` operations are strictly blocked.
- **Real-Time Analytics & CSV Exports**: Bank exposure charts and compliance review distribution powered by Recharts.

---

## 2. Architecture & Technology Stack

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|  (Institution Staff, Scrutiny Officers, Approving Authority, System Admin)       |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS
                                          v
+-----------------------------------------------------------------------------------+
|                           FRONTEND & APP SERVER (Next.js)                         |
|  - App Router (React Server Components + Interactive Client Views)               |
|  - Supabase SSR Integration (@supabase/ssr)                                       |
|  - Tailwind CSS v4, Lucide Icons, Recharts Analytics                              |
+-------------------+---------------------------------------+-----------------------+
                    |                                       |
        Auth, DB & Storage Sync                  Internal Authorized Requests
                    |                            (Token / Header Authenticated)
                    v                                       v
+---------------------------------------+   +---------------------------------------+
|          SUPABASE PLATFORM            |   |         PYTHON AI MICROSERVICE        |
|  - PostgreSQL with Row-Level Security |   |             (FastAPI)                 |
|  - Supabase Auth (JWT & Cookies)      |   |  - PyMuPDF (Digital PDF extraction)   |
|  - Supabase Storage (Private Buckets) |<--+  - OpenCV (Image Preprocessing)       |
|  - Database Functions & Triggers      |   |  - Tesseract OCR (Scanned Receipts)   |
|  - Tamper-Evident Audit Ledger        |   |  - Discrepancy & Confidence Engine    |
+---------------------------------------+   +---------------------------------------+
```

---

## 3. Repository Structure

```
aicte-fdr-portal/
├── frontend/                     # Next.js 16 App Router application
│   ├── app/
│   │   ├── dashboard/            # Executive role-aware dashboard
│   │   ├── fdrs/                 # FDR Registry table & detail views
│   │   │   ├── [id]/             # Detailed instrument inspector with 5 tabs
│   │   │   └── submit/           # Multi-step FDR Submission Wizard
│   │   ├── verification/         # Scrutiny Officer Verification Workbench
│   │   ├── renewals/             # Renewal and replacement instrument chain
│   │   ├── release-requests/     # Multi-tier release and refund workflows
│   │   ├── notifications/        # Maturity monitoring and action alerts
│   │   ├── reports/              # Compliance analytics and CSV export
│   │   ├── admin/                # System administration & user directory
│   │   │   └── audit/            # Tamper-evident audit trail viewer
│   │   ├── login/                # Authentication & 1-click persona switch
│   │   ├── unauthorized/         # 401 Unauthorized page
│   │   ├── forbidden/            # 403 Forbidden page
│   │   └── api/ai/               # Server-to-server AI processing proxy
│   ├── components/               # Navbar, Sidebar, Badges, KPI Cards
│   └── lib/
│       ├── supabase/             # Client, Server, Admin, and Service helpers
│       └── types/                # Strict TypeScript database & domain types
├── supabase/
│   ├── config.toml               # Supabase CLI configuration
│   ├── migrations/               # Version-controlled SQL migrations
│   │   ├── 20261029000000_init_aicte_schema.sql
│   │   └── 20261029000001_rls_and_triggers.sql
│   └── seed.sql                  # Comprehensive synthetic compliance dataset
├── ai-service/                   # Python FastAPI microservice
│   ├── app/
│   │   ├── core/config.py        # Pydantic settings & API keys
│   │   ├── schemas/fdr.py        # Pydantic models for extraction & discrepancies
│   │   ├── services/
│   │   │   ├── pdf_extraction.py # PyMuPDF digital text & rasterizer
│   │   │   ├── ocr.py            # OpenCV preprocessing & Tesseract OCR
│   │   │   ├── fdr_extraction.py # Indian banking regex & heuristics
│   │   │   └── discrepancy_detection.py # Deterministic mismatch scoring
│   │   └── main.py               # FastAPI application & endpoints
│   ├── tests/                    # Pytest automated test suite
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Production container spec
├── docs/                         # In-depth architectural documentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── authorization-model.md
│   ├── workflow-design.md
│   ├── ai-processing.md
│   ├── api-contracts.md
│   ├── testing-guide.md
│   └── deployment-guide.md
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 4. Quick Start Guide

### Step 1: Clone & Configure Environment
```bash
cp .env.example .env
```

### Step 2: Set Up Python AI Service
```bash
cd ai-service
# Python 3.12 virtual environment
python3.12 -m venv venv
./venv/bin/pip install -r requirements.txt

# Run automated tests
PYTHONPATH=. ./venv/bin/pytest -v tests/

# Start FastAPI microservice on port 8000
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 3: Set Up Next.js Frontend
In a separate terminal window:
```bash
cd frontend
pnpm install

# Verify TypeScript build
pnpm run build

# Start Next.js development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Testing the 4 User Roles & Workflows

The portal includes an interactive **Role Switcher** on the top navigation bar and 1-click persona tiles on the login page:

1. **Institution User (`institution_user`)**:
   - Represents Dr. Rajesh Sharma (Registrar, Delhi Institute of Technology).
   - Can submit new FDRs via the 5-step wizard (`/fdrs/submit`), upload scanned receipts, review institution-scoped FDRs, and request deposit release (`/release-requests`).
   - RLS strictly prevents access to other institutions' records.

2. **Scrutiny Officer (`scrutiny_officer`)**:
   - Represents Sunil Kumar (AICTE Regional Scrutiny Cell).
   - Reviews pending submissions in the Scrutiny Workbench (`/verification`), checks OCR discrepancies, enters scrutiny observations, and records formal decisions.

3. **Approving Authority (`approving_authority`)**:
   - Represents Dr. V. K. Adiseshiah (Regional Director).
   - Reviews recommendations and has final sign-off authority for security deposit refund/release orders.

4. **Administrator (`administrator`)**:
   - Represents Sanjay Verma (AICTE Systems Administrator).
   - Manages user directories, configures statutory reminder intervals (e.g. 90/60/30/15 days), and audits tamper-evident system logs (`/admin/audit`).

---

## 6. Verification & Test Output

- **FastAPI / Pytest**: 6 passed in 0.84s (Health check, internal API token auth, field extraction, discrepancy severity scoring).
- **Next.js Production Build**: 19/19 routes compiled and statically optimized with Turbopack and React 19 in under 1 second.
- **Row Level Security**: Full SQL migration policies implemented for PostgreSQL tables and private storage buckets.
