# 01 - System Architecture & Statutory Mandate

## 1. Statutory Regulatory Mandate

Under the **AICTE Approval Process Handbook (APH)**, any educational Society or Trust seeking AICTE approval for establishing a new technical institution, introducing new programs, or expanding intake capacity must lodge a mandatory security deposit in the form of a **Fixed Deposit Receipt (FDR)**.

### Key Regulatory Constraints
1. **Mandatory Joint Lien**: The FDR must be established jointly in the name of the *"Regional Officer, All India Council for Technical Education, New Delhi"* and the applicant *"Society / Trust"*. Neither party can unilaterally encash or liquidate the instrument.
2. **Mandatory Tenor**: Minimum deposit period of **8 to 10 years** depending on the discipline (e.g. 10 years for Degree Engineering, Management, Pharmacy; 8 years for Polytechnic / Diploma).
3. **Approved Financial Institutions**: Only Reserve Bank of India (RBI) Scheduled Commercial Banks (Public Sector Banks or designated Private Sector Banks) are eligible.
4. **Permissible Release Conditions**: The deposit may be refunded or released only upon:
   - Completion of the mandated lock-in period without regulatory breach.
   - Closure of the technical institution following student relocation, No-Objection Certificate (NOC) issuance, and AICTE Council approval.

---

## 2. Target Architecture & Topology

The portal follows a clean, decoupled two-service architecture integrated with the Supabase platform:

```
                                  ┌────────────────────────┐
                                  │   Authorized Users     │
                                  │ (Colleges, Scrutiny,   │
                                  │  Approvers, Admins)    │
                                  └───────────┬────────────┘
                                              │ HTTPS (Port 3000)
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ NEXT.JS 16 APPSERVER (App Router, Server Actions, Route Handlers)                      │
│                                                                                        │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │ UI & Interactive Page │  │ Next.js Proxy/Middleware│  │  FDRService Hybrid Layer │ │
│  │ 21 App Router Routes  │  │ Route-Level Auth Gates  │  │ Fast-Probe Resilience    │ │
│  │ Custom CSS Keyframes  │  │ Session Cookie Sync     │  │ In-Memory + Supabase     │ │
│  └───────────────────────┘  └─────────────────────────┘  └──────────────┬───────────┘ │
└──────────────────────────────────────────┬──────────────────────────────┼──────────────┘
                                           │                              │
                     Internal Route Proxy  │                              │ Supabase Client
                     X-Internal-API-Key    │                              │ (Auth, RLS, Storage)
                                           ▼                              ▼
┌─────────────────────────────────────────────────────────┐  ┌───────────────────────────┐
│ PYTHON 3.12 FASTAPI AI SERVICE (Port 8000)              │  │ SUPABASE PLATFORM         │
│                                                         │  │                           │
│  - PyMuPDF Vector Text Extractor                        │  │  - PostgreSQL 16 DB       │
│  - OpenCV Computer Vision Preprocessing                 │  │    (12 Relational Tables) │
│    (Gaussian Blur, Grayscale, Otsu Auto-Thresholding)   │  │  - Row Level Security     │
│  - Tesseract 5.5 OCR Engine (--psm 6)                   │  │    (Security Definers)    │
│  - Regex & Heuristic Indian Banking Parser              │  │  - Private Storage Bucket │
│  - Deterministic Discrepancy & Severity Scorer          │  │    ('fdr-documents')      │
│    (Checks: Amount, IFSC, FDR Number, Joint-Lien Clause)│  │  - Append-Only Audit Log  │
└─────────────────────────────────────────────────────────┘  └───────────────────────────┘
```

---

## 3. End-to-End Operational Lifecycle Workflow

The system enforces a strict 4-stage lifecycle ensuring compliance, accountability, and traceability:

```
[ Stage 01: Lodgment ]
  Institutional Registrar fills FDR metadata (FDR No, IFSC, Principal, Dates)
  Uploads scanned certificate and bank confirmation letter (SHA-256 computed)
  Document saved to private Supabase Storage bucket ('fdr-documents')
          │
          ▼
[ Stage 02: AI OCR & Discrepancy Extraction ]
  Next.js proxy calls Python FastAPI internal processing endpoint
  OpenCV prepares 300 DPI page scans; PyMuPDF pulls raw text
  Tesseract extracts key fields; discrepancy engine calculates matching confidence
  FDR transitions to 'AUTO_CHECKED'; mismatches flagged as 'DISCREPANCY_FLAGGED'
          │
          ▼
[ Stage 03: Regional Scrutiny Cell Audit ]
  Scrutiny Officer reviews submitted values side-by-side with OCR extractions
  Verifies physical confirmation letter received from issuing bank branch
  Records scrutiny decision: ACCEPT (Verified), RETURN_FOR_CORRECTION, or REJECT
  Audit event logged immutably in 'audit_events'
          │
          ▼
[ Stage 04: Maturity Alarms & Authorized Release ]
  Automated monitoring alarms fire at 90, 60, and 30 days prior to FDR maturity
  Renewal: College submits successor FDR, linked to predecessor instrument
  Release: College submits refund application under program closure or tenor expiry
  Regional Director / Approving Authority exercises financial sign-off (2-Person Rule)
```

---

## 4. Fundamental Engineering Principles

1. **Single Source of Truth**: PostgreSQL database schema versioned through Supabase SQL migrations. No duplicate ORM migrations (such as Alembic) are used.
2. **Separation of Concerns**:
   - Next.js handles user-facing web experiences, sessions, and database calls.
   - FastAPI focuses exclusively on compute-heavy optical character recognition and discrepancy analysis.
   - Supabase handles identity, transactions, row-level access control, and document storage.
3. **Ethical AI Guardrails**: The Python AI service assists human officers by highlighting discrepancies and calculating confidence scores. The AI engine is strictly barred from certifying genuineness or authorizing financial release.
4. **Separation of Duties (SoD)**: The institution user who submits an FDR cannot audit or verify it. The scrutiny officer who verifies the FDR cannot approve a financial release or deposit refund.
5. **Append-Only Immutability**: All sensitive events are recorded in `audit_events`. PostgreSQL RLS policies explicitly forbid `UPDATE` and `DELETE` queries on the audit table.
