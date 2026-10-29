# AICTE FDR Portal — API Contracts & Integration Guide

## 1. Python AI Service Internal API

All endpoints are secured via the `X-Internal-API-Key` header. Requests without this valid secret token are rejected with HTTP 401 Unauthorized.

### 1.1 `GET /health`
Returns microservice status, tesseract engine availability, and uptime.
- **Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "tesseract_available": true,
  "timestamp": "2026-10-29T23:15:00Z"
}
```

### 1.2 `POST /internal/process-document`
Submits an uploaded document for OCR and extraction.
- **Request (Multipart Form or JSON)**:
  - `document_id`: UUID
  - `fdr_id`: UUID (optional)
  - `file`: Document file bytes (PDF, PNG, JPG) OR `file_url` / `storage_path`
  - `expected_values`: JSON object containing institution submitted fields for comparison:
    ```json
    {
      "fdr_number": "SBI-FDR-2024-9988",
      "bank_name": "State Bank of India",
      "amount": 1500000.00,
      "issue_date": "2024-04-01",
      "maturity_date": "2029-04-01",
      "ifsc_code": "SBIN0001234"
    }
    ```
- **Response**:
```json
{
  "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "processing_status": "COMPLETED",
  "extractor": "tesseract_pymupdf_v1",
  "extracted_fields": {
    "fdr_number": "SBI-FDR-2024-9988",
    "bank_name": "State Bank of India",
    "amount": 1500000.00,
    "issue_date": "2024-04-01",
    "maturity_date": "2029-04-01",
    "ifsc_code": "SBIN0001234"
  },
  "confidence_scores": {
    "fdr_number": 0.98,
    "bank_name": 0.95,
    "amount": 0.99,
    "issue_date": 0.94,
    "maturity_date": 0.94,
    "overall": 0.96
  },
  "discrepancies": [
    {
      "field": "amount",
      "submitted_value": "1500000.00",
      "extracted_value": "1500000.00",
      "has_mismatch": false,
      "severity": "NONE"
    }
  ]
}
```

---

## 2. Next.js Internal Workflow Actions & Routes

- `POST /api/fdr/submit`: Multi-step submission creation.
- `POST /api/fdr/verify`: Officer scrutiny decision recording.
- `POST /api/fdr/renew`: Replacement instrument linkage.
- `POST /api/fdr/release`: Release/refund request initiation.
- `POST /api/fdr/release/decide`: Recommendation & approval.
- `GET /api/reports/export`: Authorized CSV export of filtered records.
