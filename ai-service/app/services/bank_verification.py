"""
Independent Bank Verification Adapter Module
Blueprint v2.0 - Section 6 Specification

Provides a provider-neutral adapter interface for recording independent bank confirmations.
Distinct from OCR extraction: OCR extracts text; bank verification obtains authoritative
confirmation from the financial institution or official channels.
"""

from typing import Protocol, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class VerificationRequest(BaseModel):
    instrument_reference: str
    bank_code: Optional[str] = None
    bank_name: str
    amount: str
    issue_date: str
    maturity_date: str
    branch_ifsc: Optional[str] = None
    institution_id: Optional[str] = None

class VerificationResult(BaseModel):
    source_name: str
    method: str  # AUTHORIZED_API, OFFICIAL_EMAIL, BANK_LETTER, MANUAL_OTHER
    source_reference: Optional[str] = None
    result: str  # CONFIRMED, NOT_CONFIRMED, UNAVAILABLE, REQUIRES_REVIEW
    checked_at: datetime = Field(default_factory=datetime.utcnow)
    evidence_reference: Optional[str] = None
    notes: Optional[str] = None
    disclaimer: str = "Independent bank verification result records external response; it does not replace statutory AICTE scrutiny authority."

class BankVerificationAdapter(Protocol):
    """
    Protocol defining the interface for independent bank verification channels.
    """
    async def verify(self, request: VerificationRequest) -> VerificationResult:
        ...

class MockAuthorizedBankAPIAdapter:
    """
    Simulated implementation of an Authorized Bank Direct Verification Channel.
    Adheres to Blueprint v2.0 rule: Network timeout returns UNAVAILABLE, not NOT_CONFIRMED.
    """
    def __init__(self, should_timeout: bool = False, simulated_response: str = "CONFIRMED"):
        self.should_timeout = should_timeout
        self.simulated_response = simulated_response

    async def verify(self, request: VerificationRequest) -> VerificationResult:
        if self.should_timeout:
            return VerificationResult(
                source_name=request.bank_name,
                method="AUTHORIZED_API",
                source_reference=None,
                result="UNAVAILABLE",
                notes="Bank API gateway timed out after 30 seconds. System marked UNAVAILABLE per Blueprint v2.0 standard. Human follow-up required.",
                evidence_reference=None
            )

        if self.simulated_response == "CONFIRMED":
            return VerificationResult(
                source_name=request.bank_name,
                method="AUTHORIZED_API",
                source_reference=f"API-CONF-{request.instrument_reference}-2026",
                result="CONFIRMED",
                notes=f"Bank core banking system confirmed active lien in favor of AICTE for amount {request.amount}.",
                evidence_reference=f"DOC-API-{request.instrument_reference}.json"
            )

        return VerificationResult(
            source_name=request.bank_name,
            method="AUTHORIZED_API",
            source_reference=None,
            result="REQUIRES_REVIEW",
            notes="Bank records show instrument exists, but lien endorsement is under administrative review.",
            evidence_reference=None
        )

class OfficialEmailVerificationAdapter:
    """
    Adapter for recording bank confirmations received through official nodal email exchanges.
    """
    async def record_manual_evidence(
        self,
        request: VerificationRequest,
        officer_name: str,
        dispatch_ref: str,
        result: str,
        notes: str
    ) -> VerificationResult:
        return VerificationResult(
            source_name=f"Official Nodal Communication - {request.bank_name}",
            method="OFFICIAL_EMAIL",
            source_reference=dispatch_ref,
            result=result,
            notes=f"Recorded by scrutiny officer {officer_name}: {notes}",
            evidence_reference=dispatch_ref
        )
