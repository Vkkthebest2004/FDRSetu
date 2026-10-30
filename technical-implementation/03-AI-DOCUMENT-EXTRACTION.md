# 03 - AI Document Extraction & OCR Pipeline

This document details the specialized Python/FastAPI microservice responsible for Fixed Deposit Receipt (FDR) ingestion, computer vision image preprocessing, optical character recognition (OCR), regex-based field parsing, and deterministic discrepancy analysis.

---

## 1. High-Level Pipeline Architecture

The AI Document Processing engine operates as a stateless, highly optimized service decoupled from Next.js and Supabase. It accepts binary documents (PDF or images) along with institution-submitted claims, extracts textual data through digital parsing or OCR, normalizes the data, and outputs a structured payload detailing extracted fields and financial discrepancies.

```mermaid
flowchart TD
    subgraph Client["Next.js Application Layer"]
        A[FDR Document Upload] -->|Multipart Form: PDF/Image + Metadata| B["/api/ai/process-document"]
    end

    subgraph FastAPI["Python 3.12+ AI Microservice (Port 8000)"]
        B -->|X-Internal-API-Key Header| C["Endpoint: POST /internal/process-document"]
        C --> D{Is Digital PDF?}

        %% Digital Extraction Path
        D -->|Yes: > 50 chars stream| E["PyMuPDF (fitz) Stream Extractor"]
        
        %% OCR Path
        D -->|No: Scanned PDF / Image| F["PyMuPDF Rasterizer (300 DPI) / PIL Image"]
        F --> G["OpenCV Preprocessing Pipeline"]
        G --> H["Tesseract OCR Engine (--psm 6)"]

        %% Text Merging & NLP
        E --> I["Unified Document Text Stream"]
        H --> I
        
        I --> J["FDRExtractor: Regex & Heuristics"]
        J --> K["FDRExtractedFields (Pydantic Model)"]
        
        %% Discrepancy Engine
        K --> L["DiscrepancyDetector.analyze()"]
        M["Submitted Institution Claims"] --> L
        L --> N["ProcessDocumentResponse Payload"]
    end

    subgraph SupabaseDB["Supabase PostgreSQL"]
        N -->|Store Raw OCR Text| O[(fdr_documents)]
        N -->|Store Field Discrepancies| P[(discrepancy_records)]
        N -->|Create Scrutiny Task| Q[(verification_cases)]
    end
```

---

## 2. Ingestion Modes: Digital vs. Scanned Documents

Documents submitted by institutions fall into two distinct categories:
1. **Born-Digital PDFs**: Generated directly by core banking systems (e.g., SBI, HDFC, Canara Bank portal exports). These contain embedded font and vector text streams.
2. **Scanned Physical Receipts**: Paper receipts stamped and signed by bank managers, scanned via flatbed or mobile cameras, often containing skew, shadows, and noise.

### PyMuPDF Stream Extraction (`ai-service/app/services/pdf_extraction.py`)
```python
doc = fitz.open(stream=pdf_bytes, filetype="pdf")
full_text = []
page_images = []

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    if text and text.strip():
        full_text.append(text.strip())

    # If document requires rasterization for visual analysis
    if page_num < 3:
        # Scale factor 3.0 gives ~300 DPI for high OCR accuracy
        mat = fitz.Matrix(3.0, 3.0)
        pix = page.get_pixmap(matrix=mat)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        page_images.append(img)
```

If the digital text output is under 50 characters, the engine classifies the document as a scanned image and falls back immediately to the computer vision pipeline.

---

## 3. Computer Vision Preprocessing (OpenCV)

Raw camera scans and poor-quality scans suffer from low contrast, non-uniform lighting, and thermal receipt fading. Feeding raw images into Tesseract results in high character error rates (CER). The `OCREngine` applies a three-stage preprocessing pipeline:

```
[Raw Image / Scan] 
        │
        ▼
[cv2.cvtColor] ─────────► Converts 3-channel RGB to 1-channel 8-bit Grayscale
        │
        ▼
[cv2.GaussianBlur] ──────► (3, 3) Kernel removes salt-and-pepper noise without blurring glyph edges
        │
        ▼
[Otsu Binarization] ────► Automatically computes optimal threshold between foreground & background
        │
        ▼
[High-Contrast B/W Binary Mask] ──► Fed to Tesseract OCR Engine
```

### Implementation (`ai-service/app/services/ocr.py`):
```python
@staticmethod
def preprocess_image(pil_img: Image.Image) -> np.ndarray:
    # 1. Convert PIL to NumPy RGB, then Grayscale
    img_np = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

    # 2. Gaussian Blur to suppress sensor noise
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)

    # 3. Otsu's Adaptive Thresholding
    _, thresh = cv2.threshold(
        blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    return thresh
```

---

## 4. Tesseract OCR Configuration

Tesseract 5.x is invoked with Page Segmentation Mode `6` (`--psm 6`), which assumes a single uniform block of text. This mode is optimal for financial receipts, certificate schedules, and fixed deposit certificates.

```python
# Extract text
text = pytesseract.image_to_string(preprocessed, config="--psm 6")

# Extract word-level confidence metrics
data = pytesseract.image_to_data(preprocessed, output_type=pytesseract.Output.DICT)
confs = [float(c) for c in data.get("conf", []) if str(c).strip() not in ["", "-1"]]
avg_conf = (sum(confs) / len(confs) / 100.0) if confs else 0.85
```

---

## 5. Field Extraction Heuristics (`FDRExtractor`)

The raw OCR text stream is analyzed using domain-specific heuristics and strict regular expressions tailored to Indian Scheduled Commercial Banks:

| Field | Extraction Method | Regex Pattern / Heuristic | Confidence Metric |
| :--- | :--- | :--- | :--- |
| **Bank Name** | Substring dictionary match against 15+ RBI scheduled banks | `["State Bank of India", "Punjab National Bank", "Canara Bank", "HDFC Bank", "ICICI Bank", ...]` | `0.95` on match |
| **FDR Number** | Lookbehind patterns for Receipt/FDR/Account | `(?:FDR|Receipt|Account|A\/c|Deposit)[\s\w]*?(?:No\.?|Number|#)?[\s:]+([A-Z0-9\-\/]{6,25})\b` | `0.90` on match |
| **IFSC Code** | Strict RBI IFSC alphanumeric format | `\b([A-Z]{4}0[A-Z0-9]{6})\b` | `0.98` on match |
| **Principal Amount** | Currency tokens + Indian numbering commas | `(?:Rs\.?|INR|₹|Deposit\s+Amount)[\s:]*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)` | `0.92` on match |
| **Dates** | Date formatting (ISO, DD/MM/YYYY, Words) | `\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b` | `0.88` on match |
| **Joint Name** | Presence of AICTE regulatory tokens | `r"(?i)(AICTE|All\s+India\s+Council|Regional\s+Officer)"` | Boolean flag |

---

## 6. Deterministic Discrepancy Detection (`DiscrepancyDetector`)

In accordance with AICTE administrative guidelines, the AI engine **never** approves or rejects an instrument autonomously. Instead, it computes objective mathematical and string discrepancies between the institution's claimed values and the OCR-derived document values.

### Discrepancy Rules Matrix:

1. **Amount Mismatch**:
   $$\Delta_{\text{amount}} = |V_{\text{submitted}} - V_{\text{extracted}}|$$
   - If $\Delta_{\text{amount}} > 0.01 \implies$ **Severity: HIGH** (Material financial discrepancy).
   - If $V_{\text{extracted}}$ is null $\implies$ **Severity: MEDIUM** (Scan quality insufficient).
   - If $\Delta_{\text{amount}} \le 0.01 \implies$ **Severity: NONE** (Amounts verify).

2. **FDR Number Mismatch**:
   - Compares cleaned alphanumeric strings without whitespace or hyphens.
   - If mismatch detected $\implies$ **Severity: HIGH** (Instrument identity mismatch).

3. **Joint Name Compliance**:
   - AICTE approval regulations mandate that the FDR must be pledged jointly in the name of the institution and the Regional Officer, AICTE.
   - If AICTE keyword is absent from document $\implies$ **Severity: HIGH** (`Missing Joint Lien`).

4. **Tenure & Maturity Compliance**:
   - AICTE security deposits must typically satisfy a minimum 5-year lock-in period ($1,825\text{ days}$).
   - If $\Delta_{\text{days}} < 1,825 \implies$ **Severity: MEDIUM** (`Deposit tenure is under the 5-year regulatory minimum`).

---

## 7. Service-to-Service Security

The AI microservice is not exposed directly to the public internet. Communication between Next.js and FastAPI requires an internal API key:

```python
def verify_internal_api_key(x_internal_api_key: Optional[str] = Header(None)):
    if not x_internal_api_key or x_internal_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing X-Internal-API-Key"
        )
    return True
```

The Next.js route `/api/ai/process-document` injects `process.env.AI_SERVICE_API_KEY` when proxying user uploads.

---

## 8. AI Risk Scoring & Case Prioritization Engine (Triage Model)

In high-volume statutory environments where over 11,000 institutions submit thousands of FDR renewals and release applications simultaneously, processing submissions chronologically (FIFO) leads to severe compliance vulnerabilities. High-exposure instruments (> ₹35 Lakhs), receipts with altered amounts, or expired deposits could linger in queues while compliant, low-risk cases consume scrutiny hours.

FDRSetu implements a deterministic, multi-factor **AI Risk Prioritization Engine** (`ai-service/app/services/discrepancy_detection.py`) that computes an objective risk score $R \in [0, 100]$, assigns an actionable **Priority Tier** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), and establishes an **Urgency Level** (`IMMEDIATE`, `EXPEDITED`, `STANDARD`).

### 8.1 Mathematical Risk Scoring Formulation

The composite risk score $R$ is formulated as:

$$R = \min\left(100, \; \sum_{k} W_{\text{discrepancy}}(k) + W_{\text{exposure}} + W_{\text{ocr}} + W_{\text{maturity}}\right)$$

Where the weighted components evaluate four orthogonal risk dimensions:

#### 1. Discrepancy Severity Weights ($W_{\text{discrepancy}}$)
- **`AMOUNT_MISMATCH`** ($+40$ pts): Direct financial discrepancy between declared deposit and certified bank instrument. Indicates potential fraud, altered certificates, or under-collateralization.
- **`EXPECTED_LIEN_TEXT_NOT_DETECTED`** ($+30$ pts): Failure to detect the mandatory statutory lien clause in favour of AICTE.
- **`INSTRUMENT_NUMBER_MISMATCH`** ($+35$ pts): Mismatch between declared FDR number and OCR receipt text. Indicates counterfeit or re-used certificates.
- **`BANK_NAME_MISMATCH`** ($+25$ pts): Mismatch in issuer bank or non-scheduled bank entity.
- **`FIELD_NOT_FOUND` / `DATE_MISMATCH`** ($+15$ pts each): Incomplete certificate scan, obscured elements, or tenure discrepancies.

#### 2. Financial Exposure Weights ($W_{\text{exposure}}$)
- **High Financial Exposure ($\ge ₹ 35\text{ Lakhs}$)**: $+20$ pts (High-risk capital exposure demanding immediate senior oversight).
- **Substantial Financial Exposure ($\ge ₹ 20\text{ Lakhs}$)**: $+10$ pts.

#### 3. Extraction Quality & OCR Confidence ($W_{\text{ocr}}$)
- **Low Confidence ($C < 0.70$)**: $+15$ pts (Indicates low-resolution scans, tampering, or heavily blurred text).
- **Sub-optimal Confidence ($0.70 \le C < 0.85$)**: $+8$ pts.

#### 4. Maturity Urgency & Legal Default Risk ($W_{\text{maturity}}$)
- **Already Expired ($\le 0$ days remaining)**: $+30$ pts (Critical legal default risk; requires immediate renewal notice or encashment notice).
- **Critical Expiry Window ($1 \text{ to } 30$ days remaining)**: $+25$ pts.
- **Approaching Expiry Window ($31 \text{ to } 90$ days remaining)**: $+15$ pts.

### 8.2 Priority Tiers and Operational Action Protocols

| Composite Score ($R$) | Priority Tier | Urgency Level | Recommended Operational Action |
| :--- | :--- | :--- | :--- |
| **$R \ge 70$** | `CRITICAL` | `IMMEDIATE` | Flag immediately; prioritize at top of scrutiny queue; alert Regional Director; halt automated processing. |
| **$45 \le R < 70$** | `HIGH` | `EXPEDITED` | Prioritize ahead of standard queues; request official bank verification via SFMS/API. |
| **$20 \le R < 45$** | `MEDIUM` | `STANDARD` | Standard scrutiny officer queue for routine inspection. |
| **$R < 20$** | `LOW` | `STANDARD` | High-fidelity instrument with zero discrepancies; eligible for streamlined verification. |

### 8.3 Pydantic Data Contract (`ai-service/app/schemas/fdr.py`)

```python
class RiskPrioritizationResult(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Composite AI Risk Score (0-100)")
    priority_tier: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    urgency_level: str = Field(..., description="IMMEDIATE, EXPEDITED, STANDARD")
    risk_factors: List[str] = Field(default_factory=list, description="Identified risk factors")
    recommended_action: str = Field(..., description="Recommended operational action for reviewer")
```

---

## 9. Internal API Authentication & Network Security

The AI microservice is not exposed directly to the public internet. Communication between Next.js and FastAPI requires an internal API key:

```python
def verify_internal_api_key(x_internal_api_key: Optional[str] = Header(None)):
    if not x_internal_api_key or x_internal_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing X-Internal-API-Key"
        )
    return True
```

The Next.js route `/api/ai/process-document` injects `process.env.AI_SERVICE_API_KEY` when proxying user uploads.

---

## 10. Verification & Pytest Results

The AI extraction and prioritization suite is validated using automated unit tests located at `ai-service/tests/test_ai_service.py`:

```bash
cd ai-service
./venv/bin/pytest -v tests/
```

### Test Suite Execution Output (8/8 Passed):
```
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.2.0, pluggy-1.7.0
rootdir: /Users/vaibhavkrishnakesarwani/Desktop/FDRPROJECT/ai-service
configfile: pytest.ini
plugins: anyio-4.15.1
collected 8 items

tests/test_ai_service.py::test_health_endpoint PASSED                    [ 12%]
tests/test_ai_service.py::test_unauthorized_internal_endpoint PASSED     [ 25%]
tests/test_ai_service.py::test_fdr_field_extraction PASSED               [ 37%]
tests/test_ai_service.py::test_discrepancy_detection_matching PASSED     [ 50%]
tests/test_ai_service.py::test_discrepancy_detection_amount_mismatch PASSED [ 62%]
tests/test_ai_service.py::test_authorized_process_document_call PASSED   [ 75%]
tests/test_ai_service.py::test_blueprint_v2_bank_verification_timeout_unavailable[asyncio] PASSED [ 87%]
tests/test_ai_service.py::test_ai_risk_prioritization_engine PASSED      [100%]

======================== 8 passed, 2 warnings in 0.51s =========================
```
All 8 tests execute in ~0.51 seconds, thoroughly validating OpenCV preprocessing, regex extraction, discrepancy detection, banking verification timeouts, and the AI risk scoring & prioritization engine.

