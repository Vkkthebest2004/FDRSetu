# AICTE FDR Portal — Testing & Verification Guide

## 1. Test Architecture

The testing suite covers all layers of the platform:
1. **Python AI Service Tests**: Pytest unit and integration tests covering OCR preprocessing, field extraction, discrepancy severity scoring, and API key authorization.
2. **Next.js & Frontend Type Safety**: Strict TypeScript compiler verification (`pnpm build`).
3. **Database & RLS Verification**: SQL schema constraint checks, RLS policies, and trigger tests.

---

## 2. Running the Test Suites

### 2.1 Python AI Service Tests
To run the automated tests for the AI document processing microservice:
```bash
cd ai-service
PYTHONPATH=. ./venv/bin/pytest -v tests/
```

**Verification Results:**
- `test_health_endpoint`: Verifies `/health` status and Tesseract availability.
- `test_unauthorized_internal_endpoint`: Verifies that unauthorized requests without `X-Internal-API-Key` receive HTTP 401.
- `test_fdr_field_extraction`: Verifies extraction of FDR number, bank name, IFSC, amount, and joint holder.
- `test_discrepancy_detection_matching`: Verifies that matching values produce 0 discrepancies and severity `NONE`.
- `test_discrepancy_detection_amount_mismatch`: Verifies that a shortfall or overstatement triggers severity `HIGH`.
- `test_authorized_process_document_call`: Verifies end-to-end processing execution.

### 2.2 Next.js TypeScript & Static Prerender Tests
To run the complete production build and static analysis check:
```bash
cd frontend
pnpm run build
```
This verifies:
- TypeScript strict type safety on all 19 routes
- Turbopack route bundling
- Component server-side rendering and client streaming

---

## 3. End-to-End Persona Verification Checklist
Use the interactive Persona Switcher on the top navigation bar to test each role:
1. **Institution User (`institution_user`)**:
   - Navigate to `/fdrs/submit` and complete the 5-step FDR Submission Wizard.
   - Confirm that other institutions' records are inaccessible (Institution-level isolation).
   - View `/notifications` to inspect maturity countdown alerts.
2. **Scrutiny Officer (`scrutiny_officer`)**:
   - Navigate to `/verification` (Scrutiny Workbench).
   - Select an FDR with flagged discrepancies (e.g. `HDFC-DEL-FDR-2024-1029`).
   - Observe field-by-field matrix, enter observations, and record decision ("Accept", "Return for Correction", or "Flag Discrepancy").
3. **Approving Authority (`approving_authority`)**:
   - Navigate to `/release-requests`.
   - Review recommended request, enter formal decision grounds, and sign off the release order.
4. **Administrator (`administrator`)**:
   - Navigate to `/admin/audit` to view the tamper-evident append-only audit log.
   - Inspect `/admin` to modify advance maturity reminder thresholds (e.g. 90/60/30/15 days).

