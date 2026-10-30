import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.services.fdr_extraction import FDRExtractor
from app.services.discrepancy_detection import DiscrepancyDetector
from app.services.bank_verification import (
    VerificationRequest, 
    MockAuthorizedBankAPIAdapter, 
    OfficialEmailVerificationAdapter
)
from app.schemas.fdr import FDRSubmittedData, FDRExtractedFields

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data.get("blueprint_version") == "2.0"
    assert "tesseract_available" in data

def test_unauthorized_internal_endpoint():
    # Calling internal processing without API key header should return 401
    response = client.post("/internal/process-document", data={"document_id": "test-doc-1"})
    assert response.status_code == 401

def test_fdr_field_extraction():
    sample_text = """
    STATE BANK OF INDIA
    Connaught Place Branch, New Delhi
    IFSC Code: SBIN0001234
    FIXED DEPOSIT RECEIPT
    Receipt No: SBI-FDR-2024-9988
    Joint Holder: Regional Officer, AICTE
    Deposit Amount: Rs. 15,00,000.00
    Rupees Fifteen Lakh Only
    Issue Date: 15/04/2024
    Maturity Date: 15/04/2029
    """
    extracted, conf = FDRExtractor.extract_fields(sample_text)

    assert extracted.bank_name == "State Bank of India"
    assert extracted.fdr_number == "SBI-FDR-2024-9988"
    assert extracted.ifsc_code == "SBIN0001234"
    assert extracted.amount == 1500000.00
    assert extracted.joint_holder == "Regional Officer, AICTE"
    assert conf["overall"] >= 0.90

def test_discrepancy_detection_matching():
    submitted = FDRSubmittedData(
        fdr_number="SBI-FDR-2024-9988",
        bank_name="State Bank of India",
        amount=1500000.00,
        ifsc_code="SBIN0001234"
    )
    extracted = FDRExtractedFields(
        fdr_number="SBI-FDR-2024-9988",
        bank_name="State Bank of India",
        amount=1500000.00,
        ifsc_code="SBIN0001234"
    )

    discrepancies = DiscrepancyDetector.analyze(submitted, extracted)
    for disc in discrepancies:
        assert disc.has_mismatch is False
        assert disc.severity == "NONE"

def test_discrepancy_detection_amount_mismatch():
    submitted = FDRSubmittedData(
        fdr_number="HDFC-2024-100",
        bank_name="HDFC Bank",
        amount=2500000.00 # Submitted 25 Lakhs
    )
    extracted = FDRExtractedFields(
        fdr_number="HDFC-2024-100",
        bank_name="HDFC Bank",
        amount=2000000.00 # Scanned receipt shows 20 Lakhs
    )

    discrepancies = DiscrepancyDetector.analyze(submitted, extracted)
    amount_disc = next(d for d in discrepancies if d.field == "amount")
    assert amount_disc.has_mismatch is True
    assert amount_disc.severity == "HIGH"
    assert amount_disc.code == "AMOUNT_MISMATCH"
    assert "₹ 500,000.00" in amount_disc.explanation

def test_authorized_process_document_call():
    headers = {"X-Internal-API-Key": settings.API_KEY}
    payload = {
        "document_id": "doc-uuid-12345",
        "fdr_id": "fdr-uuid-12345",
        "expected_values_json": '{"fdr_number":"SBI-DEL-FDR-2023-8891","bank_name":"State Bank of India","amount":1500000.00}'
    }
    response = client.post("/internal/process-document", data=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["document_id"] == "doc-uuid-12345"
    assert data["processing_status"] == "COMPLETED"
    assert data["extracted_fields"]["fdr_number"] == "SBI-DEL-FDR-2023-8891"
    assert data["extracted_fields"]["amount"] == 1500000.00
    assert "disclaimer" in data

@pytest.mark.anyio
async def test_blueprint_v2_bank_verification_timeout_unavailable():
    """
    Blueprint v2.0 Mandate (Section 6 & 18):
    A bank API timeout must result in UNAVAILABLE, not NOT_CONFIRMED or FRAUD.
    """
    adapter = MockAuthorizedBankAPIAdapter(should_timeout=True)
    req = VerificationRequest(
        instrument_reference="PNB-FDR-2026-001",
        bank_name="Punjab National Bank",
        amount="5000000.00",
        issue_date="2026-01-01",
        maturity_date="2031-01-01"
    )
    result = await adapter.verify(req)
    assert result.result == "UNAVAILABLE"
    assert "timed out" in result.notes
    assert result.method == "AUTHORIZED_API"

def test_ai_risk_prioritization_engine():
    """
    Tests AI-driven case prioritization:
    A high-exposure deposit with a material amount mismatch must be categorized
    into CRITICAL or HIGH priority tier with immediate urgency.
    """
    submitted = FDRSubmittedData(
        fdr_number="SBI-FDR-9988",
        bank_name="State Bank of India",
        amount=5000000.00, # ₹ 50 Lakhs (High exposure)
        maturity_date="2026-11-15" # Matures in < 30 days
    )
    extracted = FDRExtractedFields(
        fdr_number="SBI-FDR-9988",
        bank_name="State Bank of India",
        amount=4000000.00, # ₹ 10 Lakhs mismatch
        maturity_date="2026-11-15"
    )

    discrepancies = DiscrepancyDetector.analyze(submitted, extracted)
    risk_result = DiscrepancyDetector.calculate_risk_priority(submitted, extracted, discrepancies)

    assert risk_result.risk_score >= 70, f"Expected critical risk score >= 70, got {risk_result.risk_score}"
    assert risk_result.priority_tier == "CRITICAL"
    assert risk_result.urgency_level == "IMMEDIATE"
    assert len(risk_result.risk_factors) >= 2

