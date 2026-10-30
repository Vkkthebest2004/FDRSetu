# 07 - Automated Testing & Verification Suite

This document outlines the testing architecture, quality assurance protocols, and automated test runners verifying every layer of the AICTE FDR Portal: Python AI microservice, Supabase PostgreSQL schema/RLS, Next.js App Router authentication, and production compilation.

---

## 1. Test Architecture Overview

The system features three automated test suites comprising **19 end-to-end tests** plus a full Turbopack static prerender build check:

```
                          [ npm test ]
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
 [ Python AI Tests ]    [ Supabase DB Tests ]    [ Auth & RBAC Tests ]
 (pytest - 6 tests)     (tsx - 7 tests)          (tsx - 6 tests)
        │                       │                        │
        └───────────────────────┼────────────────────────┘
                                ▼
                   [ Next.js Turbopack Build ]
                   (21 App Router Routes Verified)
```

---

## 2. Test Suite 1: Python AI & OCR Microservice

- **Test Command**: `npm run test:ai` (or `cd ai-service && ./venv/bin/pytest -v`)
- **Location**: `ai-service/tests/test_ai_service.py`
- **Runner**: Pytest 9.2.0 on Python 3.12+

### Test Cases:
| # | Test Name | Target Under Test | Assertion Criteria |
| :-: | :--- | :--- | :--- |
| **1** | `test_health` | `GET /health` | Validates HTTP 200, service name, version string, and Tesseract binary detection on host. |
| **2** | `test_process_document_success` | `POST /internal/process-document` | Uploads multipart mock receipt, verifies HTTP 200, status `COMPLETED`, and confidence scores $> 0.80$. |
| **3** | `test_fdr_extractor_fields` | `FDRExtractor.extract_fields()` | Tests regex extraction of Bank Name, FDR Number, IFSC code, and principal amount from dirty text streams. |
| **4** | `test_discrepancy_amount_mismatch` | `DiscrepancyDetector.analyze()` | Asserts that claimed amount ₹ 15,00,000 vs document ₹ 10,00,000 flags `has_mismatch = True` with severity `HIGH`. |
| **5** | `test_discrepancy_dates_and_joint` | `DiscrepancyDetector` Joint/Date Rules | Asserts that omitting "AICTE" or submitting a tenure $< 5$ years flags deficiency warnings. |
| **6** | `test_auth_failure` | Service Authentication Middleware | Verifies that missing or invalid `X-Internal-API-Key` returns HTTP 401 Unauthorized. |

---

## 3. Test Suite 2: Supabase Schema, RLS & Storage

- **Test Command**: `npm run test:supabase`
- **Location**: `frontend/tests/supabase.test.ts`
- **Runner**: Node.js via `npx tsx`

### Test Cases:
| # | Test Name | Focus Area | Verification Logic |
| :-: | :--- | :--- | :--- |
| **1** | Schema Migrations | Relational Model | Validates SQL syntax for all 12 tables, `NUMERIC(14,2)` amounts, `CHECK (maturity > issue)` constraints, and updated_at triggers. |
| **2** | Row Level Security | RLS Policies | Asserts RLS is enabled on all 12 tables; verifies Security Definer helpers and append-only immutability (no `UPDATE` or `DELETE` on `audit_events`). |
| **3** | Storage Buckets | Object Storage | Validates `fdr-documents` bucket definition, private access policy (`public = false`), and 25 MB file size bounds. |
| **4** | Seed & System Settings | Fixtures | Confirms initial seed inserts, system settings (`min_lock_in_years = 5`, `alert_days = [90, 60, 30]`), and test institutions. |
| **5** | Hybrid Persistence | Resilient Fallback | Validates `checkSupabaseConnection()`, graceful fallback caching, and 400ms connection timeout abort controller. |
| **6** | Service CRUD & Workflows | Business Transactions | Executes live FDR creation, transitions status through `recordVerificationDecision()`, and verifies audit ledger entry. |
| **7** | Storage Signed URLs | Document Privacy | Uploads binary buffer and generates signed download URL valid for 3,600 seconds. |

---

## 4. Test Suite 3: Authentication, RBAC & Registration

- **Test Command**: `npm run test:frontend`
- **Location**: `frontend/tests/auth.test.ts`
- **Runner**: Node.js via `npx tsx`

### Test Cases:
| # | Test Name | Verification Focus | Expected Result |
| :-: | :--- | :--- | :--- |
| **1** | Role Gate Functions | `isOfficerOrAdmin`, `isApproverOrAdmin` | Correct boolean evaluations for all 4 roles. |
| **2** | Verification Scrutiny | `canReviewVerification` | Permitted for `scrutiny_officer` & `administrator`; blocked for `institution_user`. |
| **3** | Four-Eyes Separation of Duties | `canApproveRelease` | Permitted exclusively for `approving_authority`; blocked for scrutiny officers and institutions. |
| **4** | FDR State Mutation Guard | `canEditFDR` | Allowed only when status is `DRAFT` or `NEEDS_CORRECTION`; blocked once `SUBMITTED`. |
| **5** | Institutional Isolation | Tenancy Filter | Verifies `institution_user` sees exclusively their own institution records, while `scrutiny_officer` sees across all institutions. |
| **6** | User Registration Flow | `registerInstitutionUser` | Onboards a new college, binds AICTE Permanent ID, and isolates initial FDR records to zero. |

---

## 5. Next.js Production Build Verification

- **Command**: `npm run build` (or `cd frontend && pnpm build`)
- **Compiler**: Next.js 16 with Turbopack engine

### Prerender Output:
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /admin
├ ○ /admin/audit
├ ƒ /api/ai/process-document
├ ○ /dashboard
├ ○ /fdrs
├ ○ /fdrs/[id]
├ ○ /fdrs/submit
├ ○ /forbidden
├ ○ /login
├ ○ /notifications
├ ○ /register
├ ○ /release-requests
├ ○ /renewals
├ ○ /reports
├ ○ /unauthorized
└ ○ /verification

+ First Load JS shared by all: 87.2 kB
✓ 0 errors, 0 warnings
```
All dynamic and static routes compile cleanly with zero TypeScript errors or prerendering warnings.

---

## 6. How to Run All Tests

Run all verification suites simultaneously from the project root:

```bash
# 1. Run all 19 tests across AI, Supabase, and Frontend
npm test

# 2. Run Python AI tests individually
npm run test:ai

# 3. Run Supabase & Database tests individually
npm run test:supabase

# 4. Run Auth & RBAC tests individually
npm run test:frontend

# 5. Verify Next.js production build
npm run build
```

