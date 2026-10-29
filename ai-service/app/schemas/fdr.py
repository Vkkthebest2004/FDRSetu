from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

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
    submitted_value: Optional[str] = None
    extracted_value: Optional[str] = None
    has_mismatch: bool = False
    severity: str = "NONE" # NONE, LOW, MEDIUM, HIGH
    explanation: Optional[str] = None

class ProcessDocumentRequest(BaseModel):
    document_id: str
    fdr_id: Optional[str] = None
    expected_values: Optional[FDRSubmittedData] = None
    storage_path: Optional[str] = None

class ProcessDocumentResponse(BaseModel):
    document_id: str
    fdr_id: Optional[str] = None
    processing_status: str
    extractor: str
    extracted_fields: FDRExtractedFields
    confidence_scores: Dict[str, float]
    discrepancies: List[DiscrepancyItem]
    errors_warnings: List[str]
    raw_text_snippet: Optional[str] = None
