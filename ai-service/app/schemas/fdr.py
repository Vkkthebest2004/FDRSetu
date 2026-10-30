from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class FieldEvidence(BaseModel):
    page: int = 1
    bbox: Optional[List[int]] = None  # [ymin, xmin, ymax, xmax]

class ExtractedFieldCandidate(BaseModel):
    name: str
    raw_value: Optional[str] = None
    normalized_value: Any = None
    confidence: float = 0.0
    evidence: Optional[FieldEvidence] = None
    validation_status: str = "NOT_CHECKED" # NOT_CHECKED, MATCH, MISMATCH, LOW_CONFIDENCE, NOT_FOUND

class FDRSubmittedData(BaseModel):
    fdr_number: Optional[str] = None
    bank_name: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = "INR"
    issue_date: Optional[str] = None
    maturity_date: Optional[str] = None
    ifsc_code: Optional[str] = None
    branch_name: Optional[str] = None

class FDRExtractedFields(BaseModel):
    fdr_number: Optional[str] = None
    bank_name: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = "INR"
    issue_date: Optional[str] = None
    maturity_date: Optional[str] = None
    ifsc_code: Optional[str] = None
    joint_holder: Optional[str] = None

class DiscrepancyItem(BaseModel):
    field: str
    code: str = "MATCH" # AMOUNT_MISMATCH, DATE_MISMATCH, INSTRUMENT_NUMBER_MISMATCH, EXPECTED_LIEN_TEXT_NOT_DETECTED, LOW_FIELD_CONFIDENCE, FIELD_NOT_FOUND
    submitted_value: Optional[str] = None
    extracted_value: Optional[str] = None
    has_mismatch: bool = False
    severity: str = "NONE" # NONE, LOW, MEDIUM, HIGH, CRITICAL
    explanation: Optional[str] = None
    evidence: Optional[FieldEvidence] = None

class RiskPrioritizationResult(BaseModel):
    risk_score: int = Field(default=0, ge=0, le=100) # 0 to 100
    priority_tier: str = "LOW" # CRITICAL, HIGH, MEDIUM, LOW
    urgency_level: str = "STANDARD" # IMMEDIATE, EXPEDITED, STANDARD
    risk_factors: List[str] = []
    recommended_action: str = "Standard verification review"

class ProcessDocumentRequest(BaseModel):
    document_id: str
    fdr_id: Optional[str] = None
    expected_values: Optional[FDRSubmittedData] = None
    storage_path: Optional[str] = None

class ProcessDocumentResponse(BaseModel):
    document_id: str
    fdr_id: Optional[str] = None
    processing_status: str  # QUEUED, PROCESSING, COMPLETED, PARTIAL, FAILED
    extractor: str
    extracted_fields: FDRExtractedFields
    detailed_candidates: List[ExtractedFieldCandidate] = []
    confidence_scores: Dict[str, float]
    discrepancies: List[DiscrepancyItem]
    risk_assessment: Optional[RiskPrioritizationResult] = None
    errors_warnings: List[str]
    raw_text_snippet: Optional[str] = None
    disclaimer: str = "AI output provides assistive text extraction and heuristic flags only; it does not certify instrument authenticity, legal validity, or banking clearance."
