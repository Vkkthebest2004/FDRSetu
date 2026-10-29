from typing import List, Optional
from datetime import datetime
from app.schemas.fdr import FDRSubmittedData, FDRExtractedFields, DiscrepancyItem

class DiscrepancyDetector:
    """
    Performs deterministic discrepancy analysis between institution submitted values
    and AI/OCR extracted document fields.
    """

    @classmethod
    def analyze(
        cls,
        submitted: Optional[FDRSubmittedData],
        extracted: FDRExtractedFields
    ) -> List[DiscrepancyItem]:
        discrepancies: List[DiscrepancyItem] = []
        if not submitted:
            return discrepancies

        # 1. Amount Comparison
        if submitted.amount is not None:
            sub_val = float(submitted.amount)
            ext_val = float(extracted.amount) if extracted.amount is not None else None
            
            if ext_val is None:
                discrepancies.append(DiscrepancyItem(
                    field="amount",
                    submitted_value=f"₹ {sub_val:,.2f}",
                    extracted_value="Not Found in Document",
                    has_mismatch=True,
                    severity="MEDIUM",
                    explanation="Deposit amount could not be confidently identified on the receipt scan."
                ))
            elif abs(sub_val - ext_val) > 0.01:
                diff = sub_val - ext_val
                discrepancies.append(DiscrepancyItem(
                    field="amount",
                    submitted_value=f"₹ {sub_val:,.2f}",
                    extracted_value=f"₹ {ext_val:,.2f}",
                    has_mismatch=True,
                    severity="HIGH",
                    explanation=f"Material discrepancy of ₹ {abs(diff):,.2f} detected between claimed amount and bank document."
                ))
            else:
                discrepancies.append(DiscrepancyItem(
                    field="amount",
                    submitted_value=f"₹ {sub_val:,.2f}",
                    extracted_value=f"₹ {ext_val:,.2f}",
                    has_mismatch=False,
                    severity="NONE",
                    explanation="Amounts match exactly."
                ))

        # 2. FDR Number Comparison
        if submitted.fdr_number:
            sub_num = cls._clean_str(submitted.fdr_number)
            ext_num = cls._clean_str(extracted.fdr_number) if extracted.fdr_number else None

            if not ext_num:
                discrepancies.append(DiscrepancyItem(
                    field="fdr_number",
                    submitted_value=submitted.fdr_number,
                    extracted_value="Not Identified",
                    has_mismatch=True,
                    severity="MEDIUM",
                    explanation="Receipt number not detected in scanned text."
                ))
            elif sub_num != ext_num and sub_num not in ext_num and ext_num not in sub_num:
                discrepancies.append(DiscrepancyItem(
                    field="fdr_number",
                    submitted_value=submitted.fdr_number,
                    extracted_value=extracted.fdr_number,
                    has_mismatch=True,
                    severity="HIGH",
                    explanation="Submitted FDR/Receipt number does not match document."
                ))
            else:
                discrepancies.append(DiscrepancyItem(
                    field="fdr_number",
                    submitted_value=submitted.fdr_number,
                    extracted_value=extracted.fdr_number,
                    has_mismatch=False,
                    severity="NONE",
                    explanation="Instrument reference matches."
                ))

        # 3. Bank Name Comparison
        if submitted.bank_name:
            sub_bank = submitted.bank_name.lower().strip()
            ext_bank = (extracted.bank_name or "").lower().strip()

            if not ext_bank:
                discrepancies.append(DiscrepancyItem(
                    field="bank_name",
                    submitted_value=submitted.bank_name,
                    extracted_value="Not Identified",
                    has_mismatch=True,
                    severity="LOW",
                    explanation="Bank header could not be verified."
                ))
            elif sub_bank not in ext_bank and ext_bank not in sub_bank:
                discrepancies.append(DiscrepancyItem(
                    field="bank_name",
                    submitted_value=submitted.bank_name,
                    extracted_value=extracted.bank_name,
                    has_mismatch=True,
                    severity="HIGH",
                    explanation=f"Submitted bank '{submitted.bank_name}' does not match '{extracted.bank_name}' on document."
                ))
            else:
                discrepancies.append(DiscrepancyItem(
                    field="bank_name",
                    submitted_value=submitted.bank_name,
                    extracted_value=extracted.bank_name,
                    has_mismatch=False,
                    severity="NONE",
                    explanation="Bank name matches."
                ))

        # 4. IFSC Code Comparison
        if submitted.ifsc_code:
            sub_ifsc = cls._clean_str(submitted.ifsc_code)
            ext_ifsc = cls._clean_str(extracted.ifsc_code) if extracted.ifsc_code else None

            if ext_ifsc and sub_ifsc != ext_ifsc:
                discrepancies.append(DiscrepancyItem(
                    field="ifsc_code",
                    submitted_value=submitted.ifsc_code,
                    extracted_value=extracted.ifsc_code,
                    has_mismatch=True,
                    severity="MEDIUM",
                    explanation="Branch IFSC code does not match document text."
                ))

        return discrepancies

    @staticmethod
    def _clean_str(val: Optional[str]) -> str:
        if not val:
            return ""
        return "".join(c for c in val.upper() if c.isalnum())
