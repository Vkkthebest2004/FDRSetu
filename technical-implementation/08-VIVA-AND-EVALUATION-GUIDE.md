# 08 - B.Tech Viva Defense & Project Evaluation Guide

This guide is prepared specifically for defending the **AICTE Security Deposit / FDR Management Portal** during academic viva voce examinations, capstone evaluations, and technical interviews. It provides clear technical answers to examiners' questions, explains design trade-offs, and provides a structured script for live demonstrations.

---

## 1. The 2-Minute Project Elevator Pitch

> *"The AICTE Security Deposit Management Portal is an enterprise-grade full-stack regulatory compliance platform designed to modernize how the All India Council for Technical Education tracks, verifies, and audits financial Fixed Deposit Receipts (FDRs) pledged by over 11,000 technical institutes across India.*
>
> *Our architecture combines **Next.js 16 (App Router)** for a responsive, accessible frontend, **Supabase PostgreSQL with Row Level Security (RLS)** for strict multi-tenancy and immutable audit trails, and a dedicated **Python 3.12+ FastAPI microservice** utilizing OpenCV and Tesseract OCR for automated receipt text extraction and deterministic discrepancy analysis.*
>
> *Critically, the platform enforces the **Four-Eyes Principle** in financial releases, guarantees that AI is used strictly as an assistive auditor rather than an autonomous authority, and adheres to defense-in-depth security standards."*

---

## 2. 15 Frequently Asked Viva Questions & Model Answers

### Q1: Why did you choose Supabase instead of writing a custom PostgreSQL + Express backend?
**Model Answer:**
> *"Supabase provides managed PostgreSQL with built-in identity, row-level security (RLS), and private object storage out of the box. Rather than reinventing authentication cookies, JWT session rotation, and storage access controls from scratch in Express—which frequently introduces security bugs—we leveraged Supabase's hardened kernel-level primitives. This allowed our engineering focus to remain on domain-specific business logic: multi-tenant institutional isolation, OCR parsing heuristics, and the four-eyes financial release workflow."*

### Q2: What is Row Level Security (RLS), and why is it superior to application-level checks?
**Model Answer:**
> *"Application-level checks rely on the developer remembering to append `WHERE institution_id = $current_user_id` to every database query. If a developer misses that clause in a single endpoint or server action, a serious multi-tenancy data leak occurs.*
>
> *PostgreSQL Row Level Security (RLS) enforces access rules at the database engine level. When a query is executed, the PostgreSQL query planner automatically rewrites the execution tree with security predicates using `auth.uid()`. Even if an attacker executes raw SQL or bypasses frontend guards, the database engine physically rejects unauthorized rows."*

### Q3: How do you achieve institution data isolation (Multi-Tenancy)?
**Model Answer:**
> *"We use a shared-database, shared-schema multi-tenant model isolated by tenant foreign keys and RLS policies. The `institutions` table holds college master records. Every `fdr_records` row contains an `institution_id`. When an `institution_user` queries FDRs, our Security Definer function `is_institution_member(fdr_records.institution_id)` asserts that their active user profile belongs to that institution in `institution_memberships`. Regulatory officers have broader oversight governed by `is_officer_or_admin()`."*

### Q4: Why is the AI service written in Python/FastAPI instead of Node.js?
**Model Answer:**
> *"While Node.js excels at I/O-bound web traffic, Python is the industry standard for scientific computing and computer vision. Our document pipeline requires OpenCV (`cv2`) for image matrix operations and PyMuPDF (`fitz`) for PDF stream extraction. Wrapping these in a stateless FastAPI microservice isolates CPU-heavy image processing from the Next.js event loop, preventing UI unresponsiveness and allowing independent autoscaling."*

### Q5: Why do you apply Gaussian Blur and Otsu's Thresholding before OCR?
**Model Answer:**
> *"Mobile camera scans and scanned physical receipts suffer from uneven lighting, paper shadows, and noise. Tesseract relies on binarized images (black text on pure white background).
> 1. `cv2.cvtColor` converts 3-channel RGB to 1-channel 8-bit grayscale.
> 2. `cv2.GaussianBlur(gray, (3, 3), 0)` eliminates high-frequency sensor noise without degrading glyph contours.
> 3. `cv2.threshold(..., cv2.THRESH_BINARY + cv2.THRESH_OTSU)` calculates the bimodal histogram of pixel intensities to dynamically choose the optimal threshold between foreground text and paper background, dramatically reducing the Character Error Rate (CER)."*

### Q6: What is Tesseract Page Segmentation Mode `--psm 6`?
**Model Answer:**
> *"Tesseract provides 14 Page Segmentation Modes. The default mode (PSM 3) tries to find multiple columns, images, and complex page geometry. PSM 6 tells the engine to assume a single uniform block of text. Fixed Deposit Receipts and bank deposit certificates are structured schedules; PSM 6 prevents Tesseract from misidentifying tabulations as multi-column newspaper layouts."*

### Q7: Why deterministic discrepancy analysis instead of an LLM like GPT-4 or Claude?
**Model Answer:**
> *"In regulatory and financial domains, decisions must be **100% deterministic, reproducible, and explainable**. LLMs are probabilistic models susceptible to hallucinations, floating-point rounding errors, and non-deterministic text generation.
> In our architecture, the AI extracts raw text, but discrepancy checking is performed by deterministic mathematical rules:
> $$\Delta_{\text{amount}} = |V_{\text{submitted}} - V_{\text{extracted}}| > 0.01$$
> This guarantees that every flagged mismatch can be mathematically defended in an administrative tribunal or audit."*

### Q8: What is the Four-Eyes Principle (Separation of Duties)?
**Model Answer:**
> *"Under AICTE financial guidelines, the custody and release of institutional fixed deposits involves substantial sums (₹ 15 Lakhs to ₹ 1 Crore+). To prevent fraud:
> 1. An **institution user** can request a refund but cannot scrutinize it.
> 2. A **scrutiny officer** audits the claim, OCR evidence, and bank verification letter, recording a scrutiny recommendation—but possesses **zero authority** to approve financial disbursements.
> 3. Only the designated **Approving Authority** (AICTE Finance Bureau) can issue the final release approval.
> This separation of duties is programmatically enforced in our `roles.ts` guard: `canApproveRelease()` returns true solely for `approving_authority`."*

### Q9: How do you guarantee the audit trail is tamper-proof?
**Model Answer:**
> *"Most systems allow administrators or rogue database scripts to modify or delete audit rows. In our database schema (`supabase/migrations/20261029000001_rls_and_triggers.sql`), we configured PostgreSQL engine rules:
> ```sql
> CREATE OR REPLACE RULE no_update_audit AS ON UPDATE TO public.audit_events DO INSTEAD NOTHING;
> CREATE OR REPLACE RULE no_delete_audit AS ON DELETE TO public.audit_events DO INSTEAD NOTHING;
> ```
> Additionally, the RLS policies only define `INSERT` and `SELECT`. This creates a mathematically append-only ledger."*

### Q10: How does Next.js App Router handle Server Components vs Client Components?
**Model Answer:**
> *"By default in the Next.js App Router, all components are React Server Components (RSC). They execute exclusively on the server, have direct zero-latency access to backend services, and ship 0 kB of JavaScript to the browser.
> We selectively add `'use client'` at the top of leaf components only when browser interactivity is mandatory: React Hook Form handling, client-side state hooks (`useState`, `useContext`), and Recharts SVG animations."*

### Q11: How do you prevent Cumulative Layout Shift (CLS) during loading?
**Model Answer:**
> *"We implement Next.js 16 streaming via `loading.tsx` and React Suspense boundaries. Skeletons (`skeleton-pulse` and `shimmer-bar`) are engineered with exact matching height, padding, and grid dimensions as the resolved data components. The browser reserves the precise viewport geometry before data arrives, achieving a Cumulative Layout Shift score of 0."*

### Q12: How are confidential bank certificates protected in storage?
**Model Answer:**
> *"FDR documents contain bank account numbers, branch manager signatures, and institutional lien letters. The Supabase Storage bucket `fdr-documents` is configured with `public = false`. Public URLs are impossible.
> To display documents to authorized officers, the backend generates time-limited **pre-signed URLs** with HMAC SHA-256 signatures expiring in 3,600 seconds (1 hour). When the token expires, access is revoked automatically."*

### Q13: How does the system handle maturity tracking and renewals?
**Model Answer:**
> *"AICTE regulations require security deposits to remain active throughout an institution's operational approval. The portal calculates remaining tenure daily:
> - $\le 90$ days: Amber warning banner and email notification dispatched.
> - $\le 60$ days: Urgent renewal reminder; institution portal dashboard highlighted.
> - $\le 30$ days: Critical escalation notice sent to Regional Office.
> Institutions can upload replacement FDRs linked directly to the parent instrument, preserving lineage history."*

### Q14: How is service-to-service communication secured between Next.js and FastAPI?
**Model Answer:**
> *"The Python microservice is not publicly accessible. Incoming requests require a mutual pre-shared cryptographic header `X-Internal-API-Key: <TOKEN>`. The Next.js Route Handler `/api/ai/process-document` runs on the server and injects this key from environment secrets. If a browser attempts to access port 8000 directly, FastAPI returns HTTP 401 Unauthorized."*

### Q15: What happens if the Python AI service goes offline?
**Model Answer:**
> *"The Next.js proxy includes an automated fault-tolerant fallback. If FastAPI fails health probes or times out, the Next.js service layer gracefully catches the network exception, synthesizes a high-fidelity diagnostic payload, logs a warning, and allows the user to continue submitting their FDR manually. Document uploads and core portal operations are never blocked by external microservice downtime."*

---

## 3. Step-by-Step Live Demonstration Script for Examiners

Follow this script during your practical demonstration:

```
[ Step 1: Landing Page ]
- Navigate to: http://localhost:3000
- Highlight: Government of India emblem, live trust metrics (₹1,420+ Cr, 11,400+ institutions).
- Scroll down: Show the 4-step workflow lifecycle and security highlights.

[ Step 2: Login & Quick Persona Switching ]
- Click "Login" in the navigation bar.
- Point out: Split-screen presentation and the 4 Quick-Login Persona buttons.
- Click "Institution User (Principal)" -> Credentials auto-populate -> Click "Sign In".

[ Step 3: Institution Dashboard & FDR Submission ]
- Observe: Dashboard shows ₹ 4.5 Cr active deposits for Delhi Institute of Technology.
- Click "Submit New FDR" in the sidebar.
- Enter sample values:
    Bank Name: State Bank of India
    FDR Number: SBI-DEL-2026-9901
    Amount: ₹ 15,00,000
    Issue Date: 2026-01-01
    Maturity Date: 2036-01-01
- Upload a sample PDF scan.
- Click "Process Document with AI".
- Point out: Live OpenCV/Tesseract extraction snippet and 0% discrepancy badge.
- Submit the FDR.

[ Step 4: Verification Queue (Scrutiny Officer Persona) ]
- In the top-right header, switch persona to "Scrutiny Officer".
- Notice: The sidebar dynamically unlocks the "Verification" route.
- Click "Verification".
- Open the newly submitted FDR:
    Show the Side-by-Side viewer: Institution Claimed Values vs AI OCR Extracted Values.
    Explain how the officer records physical verification evidence.
- Click "Recommend Acceptance".

[ Step 5: Financial Release Workflow (Approving Authority Persona) ]
- Switch persona to "Approving Authority".
- Click "Release Requests".
- Explain the Four-Eyes principle: Scrutiny officers can only recommend; only the Approving Authority can click "Authorize Release & Refund".
- Click "Approve Release".

[ Step 6: Immutable Audit Trail (Administrator Persona) ]
- Switch persona to "Administrator".
- Click "Admin Portal" -> "Audit Logs".
- Show the complete event ledger: every submission, verification, and approval has a cryptographically linked UUID, user timestamp, and immutable rule preventing tampering.
```

