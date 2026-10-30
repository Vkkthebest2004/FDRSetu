from typing import List, Optional
from decimal import Decimal, InvalidOperation
from datetime import datetime
from app.schemas.fdr import (
    FDRSubmittedData, 
    FDRExtractedFields, 
    DiscrepancyItem,
    FieldEvidence,
    RiskPrioritizationResult
)

class DiscrepancyDetector:
    """
    Performs deterministic discrepancy analysis between institution-submitted values
    and AI/OCR extracted document fields according to Blueprint v2.0 standards.
    Uses exact Decimal arithmetic to eliminate floating-point rounding errors.
    """

    @classmethod
    def analyze(
        cls,
        submitted: Optional[FDRSubmittedData],
        extracted: FDRExtractedFields,
        confidence_scores: Optional[dict] = None
    ) -> List[DiscrepancyItem]:
        discrepancies: List[DiscrepancyItem] = []
        if not submitted:
            return discrepancies

        confs = confidence_scores or {}

        # 1. Exact Decimal Amount Comparison
        if submitted.amount is not None:
            try:
                sub_dec = Decimal(str(submitted.amount)).quantize(Decimal("0.01"))
            except (InvalidOperation, TypeError):
                sub_dec = None

            ext_dec = None
            if extracted.amount is not None:
                try:
                    ext_dec = Decimal(str(extracted.amount)).quantize(Decimal("0.01"))
                except (InvalidOperation, TypeError):
                    ext_dec = None

            if sub_dec is not None:
                if ext_dec is None:
                    discrepancies.append(DiscrepancyItem(
                        field="amount",
                        code="FIELD_NOT_FOUND",
                        submitted_value=f"₹ {sub_dec:,.2f}",
                        extracted_value="Not Found in Document",
                        has_mismatch=True,
                        severity="MEDIUM",
                        explanation="Deposit amount could not be confidently identified on the receipt scan.",
                        evidence=FieldEvidence(page=1, bbox=[100, 200, 140, 450])
                    ))
                elif sub_dec != ext_dec:
                    diff = abs(sub_dec - ext_dec)
                    discrepancies.append(DiscrepancyItem(
                        field="amount",
                        code="AMOUNT_MISMATCH",
                        submitted_value=f"₹ {sub_dec:,.2f}",
                        extracted_value=f"₹ {ext_dec:,.2f}",
                        has_mismatch=True,
                        severity="HIGH",
                        explanation=f"Material discrepancy of ₹ {diff:,.2f} detected between claimed amount and bank document.",
                        evidence=FieldEvidence(page=1, bbox=[100, 200, 140, 450])
                    ))
                else:
                    amt_conf = confs.get("amount", 0.95)
                    if amt_conf < 0.70:
                        discrepancies.append(DiscrepancyItem(
                            field="amount",
                            code="LOW_FIELD_CONFIDENCE",
                            submitted_value=f"₹ {sub_dec:,.2f}",
                            extracted_value=f"₹ {ext_dec:,.2f}",
                            has_mismatch=False,
                            severity="LOW",
                            explanation=f"Amount matches, but OCR confidence ({amt_conf:.0%}) is below high-assurance threshold. Manual scrutiny advised.",
                            evidence=FieldEvidence(page=1, bbox=[100, 200, 140, 450])
                        ))
                    else:
                        discrepancies.append(DiscrepancyItem(
                            field="amount",
                            code="MATCH",
                            submitted_value=f"₹ {sub_dec:,.2f}",
                            extracted_value=f"₹ {ext_dec:,.2f}",
                            has_mismatch=False,
                            severity="NONE",
                            explanation="Amounts match exactly.",
                            evidence=FieldEvidence(page=1, bbox=[100, 200, 140, 450])
                        ))

        # 2. FDR Number Comparison
        if submitted.fdr_number:
            sub_num = cls._clean_str(submitted.fdr_number)
            ext_num = cls._clean_str(extracted.fdr_number) if extracted.fdr_number else None

            if not ext_num:
                discrepancies.append(DiscrepancyItem(
                    field="fdr_number",
                    code="FIELD_NOT_FOUND",
                    submitted_value=submitted.fdr_number,
                    extracted_value="Not Identified",
                    has_mismatch=True,
                    severity="MEDIUM",
                    explanation="Receipt number not detected in scanned text.",
                    evidence=FieldEvidence(page=1, bbox=[150, 100, 190, 400])
                ))
            elif sub_num != ext_num and sub_num not in ext_num and ext_num not in sub_num:
                discrepancies.append(DiscrepancyItem(
                    field="fdr_number",
                    code="INSTRUMENT_NUMBER_MISMATCH",
                    submitted_value=submitted.fdr_number,
                    extracted_value=extracted.fdr_number,
                    has_mismatch=True,
                    severity="HIGH",
                    explanation="Submitted FDR/Receipt number does not match document.",
                    evidence=FieldEvidence(page=1, bbox=[150, 100, 190, 400])
                ))
            else:
                discrepancies.append(DiscrepancyItem(
                    field="fdr_number",
                    code="MATCH",
                    submitted_value=submitted.fdr_number,
                    extracted_value=extracted.fdr_number,
                    has_mismatch=False,
                    severity="NONE",
                    explanation="Instrument reference matches.",
                    evidence=FieldEvidence(page=1, bbox=[150, 100, 190, 400])
                ))

        # 3. Bank Name Comparison
        if submitted.bank_name:
            sub_bank = submitted.bank_name.lower().strip()
            ext_bank = (extracted.bank_name or "").lower().strip()

            if not ext_bank:
                discrepancies.append(DiscrepancyItem(
                    field="bank_name",
                    code="FIELD_NOT_FOUND",
                    submitted_value=submitted.bank_name,
                    extracted_value="Not Identified",
                    has_mismatch=True,
                    severity="LOW",
                    explanation="Bank header could not be verified.",
                    evidence=FieldEvidence(page=1, bbox=[20, 100, 60, 500])
                ))
            elif sub_bank not in ext_bank and ext_bank not in sub_bank:
                discrepancies.append(DiscrepancyItem(
                    field="bank_name",
                    code="BANK_NAME_MISMATCH",
                    submitted_value=submitted.bank_name,
                    extracted_value=extracted.bank_name,
                    has_mismatch=True,
                    severity="HIGH",
                    explanation=f"Submitted bank '{submitted.bank_name}' does not match '{extracted.bank_name}' on document.",
                    evidence=FieldEvidence(page=1, bbox=[20, 100, 60, 500])
                ))
            else:
                discrepancies.append(DiscrepancyItem(
                    field="bank_name",
                    code="MATCH",
                    submitted_value=submitted.bank_name,
                    extracted_value=extracted.bank_name,
                    has_mismatch=False,
                    severity="NONE",
                    explanation="Bank name matches.",
                    evidence=FieldEvidence(page=1, bbox=[20, 100, 60, 500])
                ))

        # 4. Joint Holder / AICTE Lien Wording Check (Blueprint v2.0 Standard: REVIEW_REQUIRED, not fraud)
        if extracted.joint_holder is not None:
            joint_str = extracted.joint_holder.lower()
            if any(term in joint_str for term in ["aicte", "council", "regional officer"]):
                discrepancies.append(DiscrepancyItem(
                    field="joint_holder",
                    code="MATCH",
                    submitted_value="Regional Officer, AICTE",
                    extracted_value=extracted.joint_holder,
                    has_mismatch=False,
                    severity="NONE",
                    explanation="AICTE regulatory joint holder phrase detected in text (Subject to officer verification).",
                    evidence=FieldEvidence(page=1, bbox=[220, 80, 260, 420])
                ))
            else:
                discrepancies.append(DiscrepancyItem(
                    field="joint_holder",
                    code="EXPECTED_LIEN_TEXT_NOT_DETECTED",
                    submitted_value="Regional Officer, AICTE",
                    extracted_value=extracted.joint_holder,
                    has_mismatch=True,
                    severity="HIGH",
                    explanation="AICTE regulatory lien wording ('Regional Officer, AICTE') not detected in scanned text. Official manual inspection required.",
                    evidence=FieldEvidence(page=1, bbox=[220, 80, 260, 420])
                ))

        return discrepancies

    @classmethod
    def calculate_risk_priority(
        cls,
        submitted: Optional[FDRSubmittedData],
        extracted: FDRExtractedFields,
        discrepancies: List[DiscrepancyItem],
        confidences: Optional[dict] = None
    ) -> RiskPrioritizationResult:
        """
        Computes composite AI risk score (0-100) and triage priority tier.
        Enables scrutiny officers and approving authorities to prioritize high-risk
        or high-exposure compliance cases immediately.
        """
        score = 0
        factors: List[str] = []
        confs = confidences or {}

        # 1. Discrepancy Severity Penalties
        for d in discrepancies:
            if d.has_mismatch:
                if d.code == "AMOUNT_MISMATCH":
                    score += 40
                    factors.append(f"Material Amount Discrepancy ({d.submitted_value} vs {d.extracted_value})")
                elif d.code == "EXPECTED_LIEN_TEXT_NOT_DETECTED":
                    score += 30
                    factors.append("Missing AICTE Statutory Joint Lien Endorsement")
                elif d.code == "INSTRUMENT_NUMBER_MISMATCH":
                    score += 35
                    factors.append("Instrument Certificate Number Mismatch")
                elif d.code == "BANK_NAME_MISMATCH":
                    score += 25
                    factors.append("Issuing Bank Name Mismatch")
                elif d.code == "FIELD_NOT_FOUND":
                    score += 15
                    factors.append(f"Required Field Unextracted: {d.field.upper()}")
                else:
                    score += 10
                    factors.append(f"Anomaly Detected: {d.field.upper()}")

        # 2. Financial Exposure Weights
        amount = None
        if submitted and submitted.amount:
            amount = float(submitted.amount)
        elif extracted.amount:
            amount = float(extracted.amount)

        if amount:
            if amount >= 3500000.0:  # >= 35 Lakhs
                score += 20
                factors.append(f"High Financial Exposure: ₹ {amount:,.2f}")
            elif amount >= 2000000.0:  # >= 20 Lakhs
                score += 10
                factors.append(f"Significant Exposure: ₹ {amount:,.2f}")

        # 3. Optical Extraction Quality & Confidence
        overall_conf = confs.get("overall", 0.95)
        if overall_conf < 0.70:
            score += 15
            factors.append(f"Low OCR Extraction Confidence ({overall_conf:.0%}) - Manual Inspection Required")
        elif overall_conf < 0.85:
            score += 8
            factors.append(f"Moderate OCR Confidence ({overall_conf:.0%})")

        # 4. Proximity to Maturity (Urgency)
        mat_date_str = (submitted.maturity_date if submitted else None) or extracted.maturity_date
        if mat_date_str:
            try:
                # Try parsing standard formats
                mat_dt = None
                for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                    try:
                        mat_dt = datetime.strptime(mat_date_str.strip(), fmt)
                        break
                    except ValueError:
                        continue
                if mat_dt:
                    days_remaining = (mat_dt - datetime.now()).days
                    if days_remaining <= 0:
                        score += 30
                        factors.append("Instrument Already Matured (Lien Liquidation Risk)")
                    elif days_remaining <= 30:
                        score += 25
                        factors.append(f"Imminent Expiry ({days_remaining} days remaining)")
                    elif days_remaining <= 90:
                        score += 15
                        factors.append(f"Approaching Expiry ({days_remaining} days remaining)")
            except Exception:
                pass

        # Clamp score between 0 and 100
        final_score = min(100, max(0, score))

        # Assign Tier & Urgency
        if final_score >= 70:
            tier = "CRITICAL"
            urgency = "IMMEDIATE"
            action = "Immediate priority officer scrutiny required: Potential material discrepancy or high financial exposure"
        elif final_score >= 45:
            tier = "HIGH"
            urgency = "EXPEDITED"
            action = "Expedited verification: Document exhibits notable anomalies or approaching maturity"
        elif final_score >= 20:
            tier = "MEDIUM"
            urgency = "STANDARD"
            action = "Standard verification: Minor review flags or moderate exposure"
        else:
            tier = "LOW"
            urgency = "STANDARD"
            action = "Routine verification: Clean extraction with matching fields"

        return RiskPrioritizationResult(
            risk_score=final_score,
            priority_tier=tier,
            urgency_level=urgency,
            risk_factors=factors,
            recommended_action=action
        )

    @staticmethod
    def _clean_str(val: Optional[str]) -> str:
        if not val:
            return ""
        return "".join(c for c in val.upper() if c.isalnum())
