# AICTE SANCHAY (FDRSetu / LienDocket) &bull; Master Mermaid Diagrams

This document contains the official Mermaid diagram definitions for both the **System Architecture** and the **AI Document Intelligence & Risk Triage Pipeline**. Both compact and detailed research-grade formats are provided.

---

## 1. Compact System Architecture Diagram (Recommended for Slides & Readmes)

```mermaid
flowchart LR
    %% COLOR DEFINITIONS
    classDef cClient fill:#EEF2FF,stroke:#4F46E5,stroke-width:1.5px,color:#1E1B4B;
    classDef cSecurity fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#78350F;
    classDef cAI fill:#F3E8FF,stroke:#9333EA,stroke-width:1.5px,color:#581C87;
    classDef cTriage fill:#FCE7F3,stroke:#DB2777,stroke-width:1.5px,color:#831843;
    classDef cDB fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#064E3B;
    classDef cBank fill:#F1F5F9,stroke:#475569,stroke-width:1.5px,color:#0F172A;

    subgraph CLIENT["1. Client (Next.js 16)"]
        direction TB
        P["4 Personas\n(College / Officer / Approver / Admin)"]
    end

    subgraph GATEWAY["2. Edge Gateway"]
        direction TB
        SEC["SSR Auth & JWT Guard\nFour-Eyes Separation Gate\nOptimistic Lock (v2.0)"]
    end

    subgraph AI["3. AI Vision Service (:8000)"]
        direction TB
        AIS["PyMuPDF / OpenCV / Tesseract\nRegex & Bank Whitelist\nDecimal(0.01) Discrepancy"]
    end

    subgraph TRIAGE["4. AI Risk Triage"]
        direction TB
        TRI["Multi-Factor Score (0-100)\nCRITICAL / HIGH / MED / LOW"]
    end

    subgraph PERSIST["5. Hardened DB (Supabase)"]
        direction TB
        DB["12 Tables + Kernel RLS\nImmutable Audit (RAISE EXCEPTION)\nAES-256 Storage (15m HMAC)"]
    end

    subgraph EXT["6. External"]
        direction TB
        BANK["RBI Banks / SFMS\n(3s Async Timeout)"]
    end

    P -->|HTTPS / PKCE| SEC
    SEC -->|Multipart + API Key| AIS
    AIS --> TRI
    TRI -->|Prioritized Queue| P
    SEC -->|PostgREST RLS| DB
    AIS -.->|Verify| BANK

    class P cClient;
    class SEC cSecurity;
    class AIS cAI;
    class TRI cTriage;
    class DB cDB;
    class BANK cBank;
```

---

## 2. Compact ML & Document Intelligence Pipeline Diagram

```mermaid
flowchart LR
    %% COLOR DEFINITIONS
    classDef cIn fill:#F8FAFC,stroke:#475569,stroke-width:1.5px,color:#0F172A;
    classDef cCV fill:#F5F3FF,stroke:#8B5CF6,stroke-width:1.5px,color:#4C1D95;
    classDef cOCR fill:#FDF2F8,stroke:#EC4899,stroke-width:1.5px,color:#831843;
    classDef cNLP fill:#ECFDF5,stroke:#10B981,stroke-width:1.5px,color:#064E3B;
    classDef cMath fill:#FFFBEB,stroke:#F59E0B,stroke-width:1.5px,color:#78350F;
    classDef cOut fill:#FFF1F2,stroke:#F43F5E,stroke-width:1.5px,color:#881337;

    IN["1. Ingestion\nPDF Vector / 300 DPI"] --> CV["2. OpenCV Vision\nGray -> Gaussian -> Otsu"]
    CV --> OCR["3. Tesseract 5.5\nPSM 6 + Bounding Boxes"]
    OCR --> NLP["4. Domain Parsing\nRegex + Bank List + Lien"]
    NLP --> MATH["5. Discrepancy & Triage\nDecimal Delta + Risk Score R"]
    MATH --> OUT["6. Action Tiers\nCRITICAL / HIGH / MED / LOW\n(Pydantic Payload)"]

    class IN cIn;
    class CV cCV;
    class OCR cOCR;
    class NLP cNLP;
    class MATH cMath;
    class OUT cOut;
```

---

## 3. Detailed Research-Grade System Architecture Diagram

```mermaid
flowchart TD
    %% COLOR CLASS DEFINITIONS
    classDef clientLayer fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px,color:#1E1B4B;
    classDef gatewayLayer fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;
    classDef aiMicroservice fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#581C87;
    classDef triageLayer fill:#FCE7F3,stroke:#DB2777,stroke-width:2px,color:#831843;
    classDef databaseLayer fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B;
    classDef externalLayer fill:#F1F5F9,stroke:#475569,stroke-width:2px,color:#0F172A;

    %% 1. MULTI-TENANT CLIENT TIERS
    subgraph S1["Tier 1: Multi-Tenant Client Actors (Next.js 16)"]
        U1["College Principal\nRole: institution_user"]
        U2["Regional Scrutiny Officer\nRole: scrutiny_officer"]
        U3["Finance Bureau Advisor\nRole: approving_authority"]
        U4["Central IT Administrator\nRole: administrator"]
    end

    %% 2. EDGE GATEWAY & SECURITY PERIMETER
    subgraph S2["Tier 2: Security Perimeter & Edge Gateway"]
        GW["Reverse Proxy & Edge Middleware\nSession Resolution & JWT Rotation"]
        AUTH_GUARD["Multi-Tier RBAC Guard\nrequireRole() & requireInstitutionMembership()"]
        FOUR_EYES["Four-Eyes Separation Gate\nInvariant: Submitter ≠ Scrutinizer ≠ Approver"]
        CONCURRENCY["Optimistic Concurrency Manager\nWHERE id = :id AND version = :expected"]

        GW --> AUTH_GUARD --> FOUR_EYES --> CONCURRENCY
    end

    %% 3. AI DOCUMENT INTELLIGENCE MICROSERVICE
    subgraph S3["Tier 3: AI Document Intelligence Service (FastAPI :8000)"]
        API_GATE["Internal API Key Guard\nHeader: X-Internal-API-Key"]
        INGEST["Multi-Modal Document Router\nfitz vector stream vs 300 DPI rasterizer"]
        CV_PIPE["OpenCV Vision Engine\nGrayscale -> Gaussian Blur -> Otsu Threshold"]
        OCR_CORE["Tesseract 5.5 OCR Engine\nMode: --psm 6 Single Uniform Tabular Block"]
        EXT_ENGINE["FDRExtractor Regex Heuristics\nRBI 15+ Scheduled Commercial Bank Whitelist"]
        DISC_ENGINE["Deterministic Discrepancy Engine\nFixed-Point Decimal 0.01 Arithmetic"]

        API_GATE --> INGEST --> CV_PIPE --> OCR_CORE --> EXT_ENGINE --> DISC_ENGINE
    end

    %% 4. DYNAMIC RISK PRIORITIZATION TRIAGE
    subgraph S4["Tier 4: Dynamic Risk Prioritization Triage Engine"]
        FORMULA["Multi-Factor Scoring Formula\nR = min(100, Σ W_disc + W_exp + W_ocr + W_mat)"]
        T_CRIT["CRITICAL (Score ≥ 70) -> IMMEDIATE\nSenior Forensic Audit Required"]
        T_HIGH["HIGH (Score 45-69) -> EXPEDITED\nBank SFMS Re-Verification Required"]
        T_MED["MEDIUM (Score 20-44) -> STANDARD\nRoutine Scrutiny Queue"]
        T_LOW["LOW (Score < 20) -> STANDARD\nFast-Track Verification Eligible"]

        FORMULA --> T_CRIT & T_HIGH & T_MED & T_LOW
    end

    %% 5. HARDENED PERSISTENCE & STORAGE TIER
    subgraph S5["Tier 5: Hardened Persistence (Supabase PostgreSQL 15)"]
        RLS_CORE["PostgreSQL Kernel RLS Engine\nauth.uid() = institution_id Scoping"]
        SCHEMA_STORE[("12 Normalized Relational Entities\nfdr_records, verification_cases, etc.")]
        AUDIT_LEDGER[("Append-Only Audit Ledger\nTrigger: RAISE EXCEPTION on UPDATE/DELETE")]
        OUTBOX["Transactional Notification Outbox\nUnique Idempotency Key Deduplication"]
        OBJECT_STORAGE["Private Object Storage Bucket (fdr-documents)\nAES-256 Encryption & 15-Min HMAC Signed URLs"]

        RLS_CORE --- SCHEMA_STORE
        RLS_CORE --- AUDIT_LEDGER
        RLS_CORE --- OUTBOX
    end

    %% 6. EXTERNAL BANKING NETWORK
    subgraph S6["Tier 6: External Sovereign Banking Gateway"]
        SFMS_GATEWAY["RBI Scheduled Commercial Banks / SFMS Gateway"]
        CIRCUIT_BREAKER["Circuit Breaker Adapter\nτ = 3.0s Timeout -> Status: UNAVAILABLE"]
        SFMS_GATEWAY --- CIRCUIT_BREAKER
    end

    %% INTER-TIER DATAFLOWS
    U1 & U2 & U3 & U4 -->|HTTPS / PKCE Session| GW
    CONCURRENCY -->|Proxy Ingestion + API Key| API_GATE
    CONCURRENCY -->|Scoped PostgREST Queries| RLS_CORE
    U2 & U3 -.->|Short-Lived 900s HMAC Token| OBJECT_STORAGE
    DISC_ENGINE -->|Discrepancy Vectors| FORMULA
    T_CRIT & T_HIGH & T_MED & T_LOW -->|Prioritized Queue Cards| U2
    DISC_ENGINE -.->|Non-Blocking Async Verification| CIRCUIT_BREAKER

    %% CLASS ASSIGNMENTS
    class U1,U2,U3,U4 clientLayer;
    class GW,AUTH_GUARD,FOUR_EYES,CONCURRENCY gatewayLayer;
    class API_GATE,INGEST,CV_PIPE,OCR_CORE,EXT_ENGINE,DISC_ENGINE aiMicroservice;
    class FORMULA,T_CRIT,T_HIGH,T_MED,T_LOW triageLayer;
    class RLS_CORE,SCHEMA_STORE,AUDIT_LEDGER,OUTBOX,OBJECT_STORAGE databaseLayer;
    class SFMS_GATEWAY,CIRCUIT_BREAKER externalLayer;
```

---

## 4. Detailed Research-Grade ML Pipeline Diagram

```mermaid
flowchart TD
    %% ML PIPELINE CLASS DEFINITIONS
    classDef inputNode fill:#F8FAFC,stroke:#475569,stroke-width:2px,color:#0F172A;
    classDef signalBranch fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A;
    classDef cvEngine fill:#F5F3FF,stroke:#8B5CF6,stroke-width:2px,color:#4C1D95;
    classDef ocrEngine fill:#FDF2F8,stroke:#EC4899,stroke-width:2px,color:#831843;
    classDef nlpEngine fill:#ECFDF5,stroke:#10B981,stroke-width:2px,color:#064E3B;
    classDef mathEngine fill:#FFFBEB,stroke:#F59E0B,stroke-width:2px,color:#78350F;
    classDef triageOutput fill:#FFF1F2,stroke:#F43F5E,stroke-width:2px,color:#881337;

    %% STAGE 1: INGESTION
    subgraph P1["Stage 1: Multi-Modal Ingestion & Signal Branching"]
        INP["Input Document Stream D\nMIME: application/pdf, image/*"]
        DECIDE{"Text Stream Evaluation:\n|Text(fitz)| > 50 chars?"}
        STREAM_PARSE["Native Vector Stream Parser\nDirect font glyph extraction"]
        RASTERIZE["Affine Render Engine (300 DPI)\nMatrix: M = [[3.0, 0], [0, 3.0]]"]

        INP --> DECIDE
        DECIDE -->|Born-Digital e-FDR| STREAM_PARSE
        DECIDE -->|Scanned Physical Receipt| RASTERIZE
    end

    %% STAGE 2: OPENCV PREPROCESSING
    subgraph P2["Stage 2: Computer Vision Image Signal Preprocessing"]
        RGB2GRAY["Grayscale Intensity Projection\nI_gray = 0.299R + 0.587G + 0.114B"]
        GAUSSIAN["Gaussian Blur Filtering (3x3 Kernel, σ = 0)\nNoise attenuation without edge softening"]
        OTSU["Otsu Dynamic Global Binarization\nOptimal: argmin σ_w²(t) = argmax σ_b²(t)"]
        BINARY_MASK["High-Contrast Binary Mask\nB ∈ {0, 255}^(H×W)"]

        RASTERIZE --> RGB2GRAY --> GAUSSIAN --> OTSU --> BINARY_MASK
    end

    %% STAGE 3: OCR EXTRACTION
    subgraph P3["Stage 3: Optical Character Recognition & Spatial Evidence"]
        TESS["Tesseract 5.5 LSTM Engine\nMode: --psm 6 Single Uniform Tabular Block"]
        SPATIAL["Spatial Evidence Bounding Boxes\nCoordinates: b_i = (x_i, y_i, w_i, h_i, p_i)"]
        CONF_GEN["Word Confidence Estimator\nc_i ∈ [0.0, 1.0] (Mean Doc Confidence)"]

        BINARY_MASK --> TESS
        TESS --> SPATIAL
        TESS --> CONF_GEN
    end

    %% STAGE 4: DOMAIN PARSING
    subgraph P4["Stage 4: Domain Heuristics & Canonicalization"]
        UNIFY["Unified Text Stream Synchronization"]
        REGEX_PARSER["Boundary Regex Parser\nFDR No: (?:FDR|Receipt)[\\s:]*([A-Z0-9\\-\\/]{6,25})"]
        BANK_MATCH["RBI Scheduled Bank Whitelist\nSBI, PNB, Canara, HDFC, ICICI, etc. + IFSC Regex"]
        DECIMAL_NORM["Fixed-Point Decimal Parser\nDecimal(str(amt)).quantize(0.01)"]
        LIEN_SCAN["AICTE Statutory Joint Lien Scanner\nMandate: 'Regional Officer, AICTE' Detection"]

        STREAM_PARSE --> UNIFY
        SPATIAL & CONF_GEN --> UNIFY
        UNIFY --> REGEX_PARSER & BANK_MATCH & DECIMAL_NORM & LIEN_SCAN
    end

    %% STAGE 5: DISCREPANCY & RISK SCORING
    subgraph P5["Stage 5: Deterministic Discrepancy & Multi-Factor Risk Scoring"]
        DISC_CHECK["Discrepancy Analyzer\nΔ_amount = |Claimed - Extracted| (Zero Hallucination)"]
        RISK_CALC["AI Composite Risk Scoring Formula\nR = min(100, Σ W_disc + W_exp + W_ocr + W_mat)"]
        TIER_ASSIGN{"Priority Tier & Urgency Router"}
        T_CRIT["CRITICAL (Score ≥ 70) -> IMMEDIATE\nSenior Forensic Audit Required"]
        T_HIGH["HIGH (Score 45-69) -> EXPEDITED\nBank SFMS Re-Verification Required"]
        T_MED["MEDIUM (Score 20-44) -> STANDARD\nRoutine Scrutiny Queue"]
        T_LOW["LOW (Score < 20) -> STANDARD\nEligible for Fast-Track Verification"]

        REGEX_PARSER & BANK_MATCH & DECIMAL_NORM & LIEN_SCAN --> DISC_CHECK
        DISC_CHECK --> RISK_CALC --> TIER_ASSIGN
        TIER_ASSIGN --> T_CRIT & T_HIGH & T_MED & T_LOW
    end

    %% STAGE 6: OUTPUT PAYLOAD
    subgraph P6["Stage 6: Structured Pydantic Payload Serialization"]
        PAYLOAD["ProcessDocumentResponse\nFields + Bounding Boxes + Discrepancies + Risk Assessment"]
        T_CRIT & T_HIGH & T_MED & T_LOW --> PAYLOAD
    end

    %% CLASS ASSIGNMENTS
    class INP,DECIDE inputNode;
    class STREAM_PARSE,RASTERIZE signalBranch;
    class RGB2GRAY,GAUSSIAN,OTSU,BINARY_MASK cvEngine;
    class TESS,SPATIAL,CONF_GEN ocrEngine;
    class UNIFY,REGEX_PARSER,BANK_MATCH,DECIMAL_NORM,LIEN_SCAN nlpEngine;
    class DISC_CHECK,RISK_CALC mathEngine;
    class TIER_ASSIGN,T_CRIT,T_HIGH,T_MED,T_LOW,PAYLOAD triageOutput;
```

---

## 5. Associated Export Files

All corresponding vector graphics and high-resolution raster images are saved alongside this file:
- **System Architecture SVG**: [`docs/diagrams/system-architecture.svg`](file:///Users/vaibhavkrishnakesarwani/Desktop/FDRPROJECT/docs/diagrams/system-architecture.svg)
- **System Architecture PNG (2880 × 2040)**: [`docs/diagrams/system-architecture.png`](file:///Users/vaibhavkrishnakesarwani/Desktop/FDRPROJECT/docs/diagrams/system-architecture.png)
- **ML Pipeline SVG**: [`docs/diagrams/ml-pipeline.svg`](file:///Users/vaibhavkrishnakesarwani/Desktop/FDRPROJECT/docs/diagrams/ml-pipeline.svg)
- **ML Pipeline PNG (2880 × 2040)**: [`docs/diagrams/ml-pipeline.png`](file:///Users/vaibhavkrishnakesarwani/Desktop/FDRPROJECT/docs/diagrams/ml-pipeline.png)
