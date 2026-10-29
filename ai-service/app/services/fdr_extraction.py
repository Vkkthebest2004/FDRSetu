import re
from typing import Dict, Tuple, Optional
from app.schemas.fdr import FDRExtractedFields

KNOWN_BANKS = [
    "State Bank of India",
    "Punjab National Bank",
    "Canara Bank",
    "Bank of Baroda",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Union Bank of India",
    "Indian Bank",
    "Central Bank of India",
    "Bank of India",
    "Kotak Mahindra Bank",
    "IDBI Bank",
    "Federal Bank",
    "IndusInd Bank",
]

class FDRExtractor:
    """
    Extracts structured FDR data from raw OCR and digital PDF text.
    """

    @classmethod
    def extract_fields(cls, text: str) -> Tuple[FDRExtractedFields, Dict[str, float]]:
        extracted = FDRExtractedFields()
        confidences: Dict[str, float] = {}

        clean_text = text.replace("\r", " ")

        # 1. Bank Name Extraction
        bank_found, bank_conf = cls._extract_bank(clean_text)
        if bank_found:
            extracted.bank_name = bank_found
            confidences["bank_name"] = bank_conf

        # 2. FDR / Certificate Number Extraction
        fdr_num, fdr_conf = cls._extract_fdr_number(clean_text)
        if fdr_num:
            extracted.fdr_number = fdr_num
            confidences["fdr_number"] = fdr_conf

        # 3. IFSC Code Extraction
        ifsc, ifsc_conf = cls._extract_ifsc(clean_text)
        if ifsc:
            extracted.ifsc_code = ifsc
            confidences["ifsc_code"] = ifsc_conf

        # 4. Amount Extraction
        amount, amount_conf = cls._extract_amount(clean_text)
        if amount:
            extracted.amount = amount
            confidences["amount"] = amount_conf

        # 5. Issue & Maturity Date Extraction
        issue_d, mat_d, date_conf = cls._extract_dates(clean_text)
        if issue_d:
            extracted.issue_date = issue_d
            confidences["issue_date"] = date_conf
        if mat_d:
            extracted.maturity_date = mat_d
            confidences["maturity_date"] = date_conf

        # 6. Joint Holder Detection (AICTE compliance requirement)
        joint_holder, joint_conf = cls._extract_joint_holder(clean_text)
        if joint_holder:
            extracted.joint_holder = joint_holder
            confidences["joint_holder"] = joint_conf

        # Calculate overall confidence
        scores = list(confidences.values())
        confidences["overall"] = round(sum(scores) / len(scores), 2) if scores else 0.50

        return extracted, confidences

    @staticmethod
    def _extract_bank(text: str) -> Tuple[Optional[str], float]:
        for bank in KNOWN_BANKS:
            if re.search(r'\b' + re.escape(bank) + r'\b', text, re.IGNORECASE):
                return bank, 0.98

        # Abbreviations
        abbr_map = {
            r'\bSBI\b': "State Bank of India",
            r'\bPNB\b': "Punjab National Bank",
            r'\bHDFC\b': "HDFC Bank",
            r'\bICICI\b': "ICICI Bank",
            r'\bBOB\b': "Bank of Baroda",
            r'\bCANARA\b': "Canara Bank",
        }
        for pattern, full_name in abbr_map.items():
            if re.search(pattern, text, re.IGNORECASE):
                return full_name, 0.92

        return None, 0.0

    @staticmethod
    def _extract_fdr_number(text: str) -> Tuple[Optional[str], float]:
        patterns = [
            r'(?:Receipt|FDR|FD|Certificate|TDR)\s*(?:No\.?|Number|#)\s*[:\-]?\s*([A-Z0-9/\-]{5,30})',
            r'(?:Receipt|FDR|FD)\s*[:\-]\s*([A-Z0-9/\-]{5,30})',
            r'(?:Account|A/C)\s*(?:No\.?|Number)?\s*[:\-]?\s*([0-9]{9,18})',
            r'\b([A-Z]{2,4}-[A-Z0-9/\-]{5,25})\b',
        ]
        blacklist = {"RECEIPT", "CERTIFICATE", "LIMITED", "BRANCH", "STATEMENT", "DEPOSIT", "GENERAL"}
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                fdr_val = match.group(1).strip()
                if fdr_val.upper() not in blacklist and len(fdr_val) >= 5:
                    return fdr_val, 0.95
        return None, 0.0

    @staticmethod
    def _extract_ifsc(text: str) -> Tuple[Optional[str], float]:
        match = re.search(r'\b([A-Z]{4}0[A-Z0-9]{6})\b', text)
        if match:
            return match.group(1).upper(), 0.98
        return None, 0.0

    @staticmethod
    def _extract_amount(text: str) -> Tuple[Optional[float], float]:
        # Matches numbers like 15,00,000 or 1500000.00
        patterns = [
            r'(?:Rs\.?|INR|₹|Deposit\s+Amount|Sum\s+of)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]{2})?)',
            r'([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2}))\s*(?:Only|deposited)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amt_str = match.group(1).replace(",", "").strip()
                try:
                    val = float(amt_str)
                    if 1000 <= val <= 100000000: # Reasonable security deposit range
                        return val, 0.96
                except ValueError:
                    pass
        return None, 0.0

    @staticmethod
    def _extract_dates(text: str) -> Tuple[Optional[str], Optional[str], float]:
        # Matches dates in DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        date_pattern = r'(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{4}[/\-\.]\d{1,2}[/\-\.]\d{1,2})'
        
        issue_match = re.search(r'(?:Date\s+of\s+Issue|Issue\s+Date|Issued\s+on)\s*[:\-]?\s*' + date_pattern, text, re.IGNORECASE)
        mat_match = re.search(r'(?:Date\s+of\s+Maturity|Maturity\s+Date|Due\s+Date)\s*[:\-]?\s*' + date_pattern, text, re.IGNORECASE)

        issue_date = issue_match.group(1) if issue_match else None
        mat_date = mat_match.group(1) if mat_match else None

        return issue_date, mat_date, 0.92

    @staticmethod
    def _extract_joint_holder(text: str) -> Tuple[Optional[str], float]:
        if re.search(r'(?:Regional\s+Officer|AICTE|Council\s+for\s+Technical\s+Education)', text, re.IGNORECASE):
            return "Regional Officer, AICTE", 0.98
        return None, 0.0
