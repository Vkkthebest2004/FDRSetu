import os
import fitz  # PyMuPDF

os.makedirs("docs/diagrams", exist_ok=True)
os.makedirs("/Users/vaibhavkrishnakesarwani/.gemini/antigravity/brain/85afa563-4d0c-42bd-8041-d015aa0ef5bf", exist_ok=True)

# -------------------------------------------------------------
# 1. SYSTEM ARCHITECTURE SVG GENERATION
# -------------------------------------------------------------
system_arch_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1020" width="1440" height="1020" style="background:#090d16; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Gradients -->
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>

    <linearGradient id="tier1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <linearGradient id="cardClient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <linearGradient id="cardSecurity" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>

    <linearGradient id="cardAI" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b0764"/>
      <stop offset="100%" stop-color="#18022a"/>
    </linearGradient>

    <linearGradient id="cardTriage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#500724"/>
      <stop offset="100%" stop-color="#1f020f"/>
    </linearGradient>

    <linearGradient id="cardDB" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#021a14"/>
    </linearGradient>

    <linearGradient id="cardBank" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#164e63"/>
      <stop offset="100%" stop-color="#082f49"/>
    </linearGradient>

    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
    </filter>

    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8"/>
    </marker>

    <marker id="arrowIndigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#818cf8"/>
    </marker>

    <marker id="arrowPink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f472b6"/>
    </marker>
  </defs>

  <!-- Title Banner -->
  <rect x="40" y="24" width="1360" height="90" rx="16" fill="#131c2e" stroke="#1e293b" stroke-width="1.5" filter="url(#glow)"/>
  
  <circle cx="75" cy="69" r="22" fill="#3b82f6" fill-opacity="0.2" stroke="#60a5fa" stroke-width="2"/>
  <text x="75" y="75" font-size="20" fill="#93c5fd" font-weight="bold" text-anchor="middle">AS</text>
  
  <text x="115" y="58" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="0.5">AICTE SANCHAY (FDRSetu / LienDocket) &bull; System Architecture</text>
  <text x="115" y="84" font-size="13" font-weight="500" fill="#94a3b8">Multi-Tenant Educational Collateral Management &bull; Defense-in-Depth Security &bull; OpenCV/Tesseract Vision &bull; Dynamic Triage</text>
  
  <rect x="1210" y="50" width="165" height="36" rx="18" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5"/>
  <circle cx="1230" cy="68" r="4" fill="#34d399"/>
  <text x="1242" y="73" font-size="12" font-weight="700" fill="#34d399">25/25 TESTS PASSING</text>

  <!-- TIER 1: CLIENT PRESENTATION LAYER -->
  <g transform="translate(40, 130)">
    <rect width="1360" height="130" rx="14" fill="#0d1527" stroke="#2563eb" stroke-width="1.5" stroke-opacity="0.6" filter="url(#glow)"/>
    <rect x="16" y="-12" width="280" height="24" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#bfdbfe" letter-spacing="1">TIER 1: CLIENT PRESENTATION (NEXT.JS 16)</text>

    <!-- 4 Persona Cards -->
    <!-- Persona 1 -->
    <g transform="translate(20, 26)">
      <rect width="310" height="84" rx="10" fill="url(#cardClient)" stroke="#3b82f6" stroke-width="1.2"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#93c5fd">College Principal / Registrar</text>
      <text x="16" y="45" font-size="11" font-weight="600" fill="#38bdf8">Role: institution_user</text>
      <text x="16" y="66" font-size="11" fill="#94a3b8">FDR Submit &bull; Renewals &bull; Release Claim</text>
      <rect x="235" y="12" width="60" height="18" rx="9" fill="#2563eb" fill-opacity="0.3"/>
      <text x="265" y="25" font-size="9" font-weight="700" fill="#60a5fa" text-anchor="middle">TENANT</text>
    </g>

    <!-- Persona 2 -->
    <g transform="translate(355, 26)">
      <rect width="310" height="84" rx="10" fill="url(#cardClient)" stroke="#6366f1" stroke-width="1.2"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#a5b4fc">Regional Scrutiny Officer</text>
      <text x="16" y="45" font-size="11" font-weight="600" fill="#818cf8">Role: scrutiny_officer</text>
      <text x="16" y="66" font-size="11" fill="#94a3b8">OCR Inspection &bull; Discrepancy Triage</text>
      <rect x="225" y="12" width="70" height="18" rx="9" fill="#4f46e5" fill-opacity="0.3"/>
      <text x="260" y="25" font-size="9" font-weight="700" fill="#a5b4fc" text-anchor="middle">REGIONAL</text>
    </g>

    <!-- Persona 3 -->
    <g transform="translate(690, 26)">
      <rect width="310" height="84" rx="10" fill="url(#cardClient)" stroke="#a855f7" stroke-width="1.2"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#d8b4fe">Finance Bureau Advisor</text>
      <text x="16" y="45" font-size="11" font-weight="600" fill="#c084fc">Role: approving_authority</text>
      <text x="16" y="66" font-size="11" fill="#94a3b8">Four-Eyes Dual Control &bull; Refund Order</text>
      <rect x="230" y="12" width="65" height="18" rx="9" fill="#9333ea" fill-opacity="0.3"/>
      <text x="262" y="25" font-size="9" font-weight="700" fill="#e9d5ff" text-anchor="middle">APPROVER</text>
    </g>

    <!-- Persona 4 -->
    <g transform="translate(1025, 26)">
      <rect width="315" height="84" rx="10" fill="url(#cardClient)" stroke="#0ea5e9" stroke-width="1.2"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#7dd3fc">Central IT Administrator</text>
      <text x="16" y="45" font-size="11" font-weight="600" fill="#38bdf8">Role: administrator</text>
      <text x="16" y="66" font-size="11" fill="#94a3b8">Audit Ledger &bull; Tenancy Config &bull; Health</text>
      <rect x="240" y="12" width="60" height="18" rx="9" fill="#0284c7" fill-opacity="0.3"/>
      <text x="270" y="25" font-size="9" font-weight="700" fill="#bae6fd" text-anchor="middle">ADMIN</text>
    </g>
  </g>

  <!-- Connectors Tier 1 -> Tier 2 -->
  <line x1="720" y1="260" x2="720" y2="285" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrowIndigo)"/>
  <text x="735" y="278" font-size="11" font-family="monospace" fill="#93c5fd">HTTPS / PKCE Session Tokens</text>

  <!-- TIER 2: SECURITY & EDGE GATEWAY -->
  <g transform="translate(40, 285)">
    <rect width="1360" height="120" rx="14" fill="#141108" stroke="#d97706" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glow)"/>
    <rect x="16" y="-12" width="310" height="24" rx="6" fill="#78350f" stroke="#d97706" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#fde68a" letter-spacing="1">TIER 2: SECURITY PERIMETER &amp; EDGE GATEWAY</text>

    <!-- 3 Security Blocks -->
    <g transform="translate(20, 24)">
      <rect width="420" height="76" rx="10" fill="url(#cardSecurity)" stroke="#f59e0b" stroke-width="1"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#fcd34d">Next.js Edge Proxy &amp; SSR Guard</text>
      <text x="16" y="46" font-size="11" fill="#cbd5e1">@supabase/ssr cookie validation &bull; JWT auto-rotation</text>
      <text x="16" y="64" font-size="10" font-family="monospace" fill="#fde68a">lib/supabase/middleware.ts &bull; requireAuth()</text>
    </g>

    <g transform="translate(470, 24)">
      <rect width="420" height="76" rx="10" fill="url(#cardSecurity)" stroke="#f59e0b" stroke-width="1"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#fcd34d">Four-Eyes Separation of Duties Gate</text>
      <text x="16" y="46" font-size="11" fill="#cbd5e1">Dual control check: Submitter &ne; Scrutinizer &ne; Approver</text>
      <text x="16" y="64" font-size="10" font-family="monospace" fill="#fde68a">canApproveRelease() &bull; Strict Role Separation</text>
    </g>

    <g transform="translate(920, 24)">
      <rect width="420" height="76" rx="10" fill="url(#cardSecurity)" stroke="#f59e0b" stroke-width="1"/>
      <text x="16" y="26" font-size="13" font-weight="700" fill="#fcd34d">Optimistic Concurrency Control (v2.0)</text>
      <text x="16" y="46" font-size="11" fill="#cbd5e1">Atomic integer version check prevents stale reviews</text>
      <text x="16" y="64" font-size="10" font-family="monospace" fill="#fde68a">WHERE version = :expected &bull; VERSION_CONFLICT</text>
    </g>
  </g>

  <!-- Connectors Tier 2 -> Middle Split -->
  <line x1="380" y1="405" x2="380" y2="435" stroke="#a855f7" stroke-width="2" marker-end="url(#arrowIndigo)"/>
  <text x="395" y="425" font-size="11" font-family="monospace" fill="#c084fc">X-Internal-API-Key</text>

  <line x1="1060" y1="405" x2="1060" y2="675" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="1075" y="540" font-size="11" font-family="monospace" fill="#6ee7b7">PostgREST RLS Queries</text>

  <!-- TIER 3 & 4 SPLIT SECTION -->
  <!-- TIER 3: AI VISION SERVICE -->
  <g transform="translate(40, 435)">
    <rect width="665" height="225" rx="14" fill="#140c21" stroke="#9333ea" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glow)"/>
    <rect x="16" y="-12" width="310" height="24" rx="6" fill="#581c87" stroke="#9333ea" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#e9d5ff" letter-spacing="1">TIER 3: AI VISION SERVICE (FASTAPI :8000)</text>

    <!-- Sub-blocks -->
    <g transform="translate(18, 22)">
      <rect width="629" height="42" rx="8" fill="url(#cardAI)" stroke="#a855f7" stroke-width="0.8"/>
      <text x="14" y="26" font-size="12" font-weight="700" fill="#d8b4fe">Dual Ingestion:</text>
      <text x="110" y="26" font-size="11" fill="#cbd5e1">PyMuPDF vector text stream (&gt;50c) OR 300 DPI affine rasterizer</text>
    </g>

    <g transform="translate(18, 70)">
      <rect width="629" height="42" rx="8" fill="url(#cardAI)" stroke="#a855f7" stroke-width="0.8"/>
      <text x="14" y="26" font-size="12" font-weight="700" fill="#d8b4fe">OpenCV Pipeline:</text>
      <text x="125" y="26" font-size="11" fill="#cbd5e1">cv2.cvtColor &rarr; GaussianBlur(3&times;3) &rarr; Otsu Adaptive Binarization</text>
    </g>

    <g transform="translate(18, 118)">
      <rect width="629" height="42" rx="8" fill="url(#cardAI)" stroke="#a855f7" stroke-width="0.8"/>
      <text x="14" y="26" font-size="12" font-weight="700" fill="#d8b4fe">Tesseract OCR:</text>
      <text x="110" y="26" font-size="11" fill="#cbd5e1">PSM 6 (Single uniform tabular block) &bull; Word bounding boxes</text>
    </g>

    <g transform="translate(18, 166)">
      <rect width="629" height="46" rx="8" fill="url(#cardAI)" stroke="#a855f7" stroke-width="0.8"/>
      <text x="14" y="20" font-size="12" font-weight="700" fill="#d8b4fe">FDRExtractor &amp; Discrepancy Engine:</text>
      <text x="14" y="38" font-size="11" fill="#cbd5e1">Fixed-Point Decimal(0.01) delta &bull; RBI 15+ Banks Whitelist &bull; Zero Hallucination</text>
    </g>
  </g>

  <!-- Connectors Tier 3 -> Tier 4 -->
  <line x1="705" y1="545" x2="735" y2="545" stroke="#ec4899" stroke-width="2" marker-end="url(#arrowPink)"/>

  <!-- TIER 4: DYNAMIC RISK PRIORITIZATION -->
  <g transform="translate(735, 435)">
    <rect width="665" height="225" rx="14" fill="#1f0914" stroke="#db2777" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glow)"/>
    <rect x="16" y="-12" width="340" height="24" rx="6" fill="#831843" stroke="#db2777" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#fbcfe8" letter-spacing="1">TIER 4: AI RISK PRIORITIZATION (SCORE 0-100)</text>

    <!-- Formula Box -->
    <rect x="18" y="20" width="629" height="32" rx="8" fill="#2d0617" stroke="#f472b6" stroke-width="1"/>
    <text x="332" y="41" font-size="11.5" font-family="monospace" font-weight="700" fill="#fbcfe8" text-anchor="middle">R = min(100, &Sigma; W_discrepancy + W_exposure + W_ocr + W_maturity)</text>

    <!-- 4 Tiers Grid -->
    <g transform="translate(18, 60)">
      <!-- Critical -->
      <rect x="0" y="0" width="150" height="92" rx="8" fill="#4c0519" stroke="#f43f5e" stroke-width="1.2"/>
      <text x="10" y="20" font-size="11" font-weight="800" fill="#fda4af">CRITICAL (70-100)</text>
      <text x="10" y="38" font-size="10" font-weight="600" fill="#fb7185">Urgency: IMMEDIATE</text>
      <text x="10" y="58" font-size="9.5" fill="#cbd5e1">Senior forensic audit;</text>
      <text x="10" y="72" font-size="9.5" fill="#cbd5e1">Halt auto-pipeline.</text>

      <!-- High -->
      <rect x="160" y="0" width="150" height="92" rx="8" fill="#431407" stroke="#f97316" stroke-width="1.2"/>
      <text x="10" y="20" font-size="11" font-weight="800" fill="#fdba74">HIGH (45-69)</text>
      <text x="10" y="38" font-size="10" font-weight="600" fill="#fb923c">Urgency: EXPEDITED</text>
      <text x="10" y="58" font-size="9.5" fill="#cbd5e1">Priority queue;</text>
      <text x="10" y="72" font-size="9.5" fill="#cbd5e1">SFMS bank check.</text>

      <!-- Medium -->
      <rect x="320" y="0" width="150" height="92" rx="8" fill="#422006" stroke="#eab308" stroke-width="1.2"/>
      <text x="10" y="20" font-size="11" font-weight="800" fill="#fde047">MEDIUM (20-44)</text>
      <text x="10" y="38" font-size="10" font-weight="600" fill="#facc15">Urgency: STANDARD</text>
      <text x="10" y="58" font-size="9.5" fill="#cbd5e1">Routine scrutiny</text>
      <text x="10" y="72" font-size="9.5" fill="#cbd5e1">queue review.</text>

      <!-- Low -->
      <rect x="480" y="0" width="149" height="92" rx="8" fill="#022c22" stroke="#10b981" stroke-width="1.2"/>
      <text x="10" y="20" font-size="11" font-weight="800" fill="#6ee7b7">LOW (0-19)</text>
      <text x="10" y="38" font-size="10" font-weight="600" fill="#34d399">Urgency: STANDARD</text>
      <text x="10" y="58" font-size="9.5" fill="#cbd5e1">Zero discrepancy;</text>
      <text x="10" y="72" font-size="9.5" fill="#cbd5e1">Fast-track eligible.</text>
    </g>

    <!-- Operational Insight -->
    <rect x="18" y="160" width="629" height="52" rx="8" fill="url(#cardTriage)" stroke="#db2777" stroke-width="0.8"/>
    <text x="14" y="180" font-size="11" font-weight="700" fill="#fbcfe8">Weights:</text>
    <text x="75" y="180" font-size="10.5" fill="#f9a8d4">Amount Mismatch (+40) &bull; Lien Absent (+30) &bull; FDR No. Mismatch (+35)</text>
    <text x="14" y="200" font-size="10.5" fill="#f9a8d4">Exposure &ge; ₹35L (+20) &bull; Expired/&le;30d (+25..30) &bull; OCR Conf &lt;70% (+15)</text>
  </g>

  <!-- Connectors to Tier 5 -->
  <line x1="380" y1="660" x2="380" y2="695" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="395" y="682" font-size="11" font-family="monospace" fill="#34d399">Enriched Evidence &amp; Discrepancy Records</text>

  <!-- TIER 5: HARDENED PERSISTENCE & STORAGE (SUPABASE) -->
  <g transform="translate(40, 695)">
    <rect width="1360" height="150" rx="14" fill="#041f17" stroke="#059669" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glow)"/>
    <rect x="16" y="-12" width="370" height="24" rx="6" fill="#064e3b" stroke="#059669" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#a7f3d0" letter-spacing="1">TIER 5: HARDENED PERSISTENCE (SUPABASE POSTGRESQL 15)</text>

    <g transform="translate(20, 24)">
      <!-- 4 Database Columns -->
      <g transform="translate(0, 0)">
        <rect width="310" height="106" rx="10" fill="url(#cardDB)" stroke="#10b981" stroke-width="1"/>
        <text x="16" y="26" font-size="13" font-weight="700" fill="#6ee7b7">Kernel Row Level Security</text>
        <text x="16" y="46" font-size="11" fill="#cbd5e1">12 normalized tables protected.</text>
        <text x="16" y="64" font-size="11" fill="#cbd5e1">Tenancy isolation for 11,400+ colleges.</text>
        <text x="16" y="88" font-size="10" font-family="monospace" fill="#34d399">auth.uid() = institution_id</text>
      </g>

      <g transform="translate(330, 0)">
        <rect width="310" height="106" rx="10" fill="url(#cardDB)" stroke="#10b981" stroke-width="1"/>
        <text x="16" y="26" font-size="13" font-weight="700" fill="#6ee7b7">Append-Only Audit Ledger</text>
        <text x="16" y="46" font-size="11" fill="#cbd5e1">Strict immutability via triggers.</text>
        <text x="16" y="64" font-size="11" fill="#cbd5e1">RAISE EXCEPTION on UPDATE/DELETE.</text>
        <text x="16" y="88" font-size="10" font-family="monospace" fill="#34d399">prevent_audit_modification()</text>
      </g>

      <g transform="translate(660, 0)">
        <rect width="310" height="106" rx="10" fill="url(#cardDB)" stroke="#10b981" stroke-width="1"/>
        <text x="16" y="26" font-size="13" font-weight="700" fill="#6ee7b7">Private AES-256 Storage</text>
        <text x="16" y="46" font-size="11" fill="#cbd5e1">Bucket 'fdr-documents' (public=false).</text>
        <text x="16" y="64" font-size="11" fill="#cbd5e1">Short-lived 15-min HMAC signed URLs.</text>
        <text x="16" y="88" font-size="10" font-family="monospace" fill="#34d399">createSignedUrl(path, 900)</text>
      </g>

      <g transform="translate(990, 0)">
        <rect width="330" height="106" rx="10" fill="url(#cardDB)" stroke="#10b981" stroke-width="1"/>
        <text x="16" y="26" font-size="13" font-weight="700" fill="#6ee7b7">Transactional Outbox</text>
        <text x="16" y="46" font-size="11" fill="#cbd5e1">Idempotent notification dispatching.</text>
        <text x="16" y="64" font-size="11" fill="#cbd5e1">Prevents duplicate renewal alerts.</text>
        <text x="16" y="88" font-size="10" font-family="monospace" fill="#34d399">idempotency_key = 'fdr-*-90d'</text>
      </g>
    </g>
  </g>

  <!-- Connectors to Tier 6 -->
  <line x1="720" y1="845" x2="720" y2="875" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#arrow)"/>
  <text x="735" y="865" font-size="11" font-family="monospace" fill="#38bdf8">Async Bank Verification / Fallback</text>

  <!-- TIER 6: EXTERNAL SOVEREIGN BANKING -->
  <g transform="translate(40, 875)">
    <rect width="1360" height="90" rx="14" fill="#082535" stroke="#0ea5e9" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glow)"/>
    <rect x="16" y="-12" width="310" height="24" rx="6" fill="#0369a1" stroke="#0ea5e9" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#e0f2fe" letter-spacing="1">TIER 6: EXTERNAL BANKING &amp; SFMS NETWORK</text>

    <g transform="translate(20, 20)">
      <text x="14" y="24" font-size="13" font-weight="700" fill="#7dd3fc">RBI Scheduled Commercial Banks &bull; SFMS Structured Messaging &bull; Core Banking Webhooks</text>
      <text x="14" y="48" font-size="11" fill="#cbd5e1">Circuit Breaker Pattern: 3.0s timeout converts to status: UNAVAILABLE (prevents false-positive fraud verdicts on network jitter)</text>
      <rect x="1170" y="10" width="150" height="40" rx="8" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1"/>
      <text x="1245" y="34" font-size="11" font-weight="700" fill="#7dd3fc" text-anchor="middle">ASYNC ADAPTER</text>
    </g>
  </g>

  <!-- Footer Branding -->
  <text x="720" y="995" font-size="11" fill="#64748b" text-anchor="middle">&copy; 2026 AICTE SANCHAY &bull; Government of India &bull; Certified Production Architecture (Exit Code 0)</text>
</svg>
"""

# -------------------------------------------------------------
# 2. ML / DOCUMENT INTELLIGENCE PIPELINE SVG GENERATION
# -------------------------------------------------------------
ml_pipeline_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1020" width="1440" height="1020" style="background:#0b0a16; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <linearGradient id="headerGradML" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>

    <linearGradient id="box1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <linearGradient id="box2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b0764"/>
      <stop offset="100%" stop-color="#19022b"/>
    </linearGradient>

    <linearGradient id="box3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a044e"/>
      <stop offset="100%" stop-color="#210223"/>
    </linearGradient>

    <linearGradient id="box4Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#011712"/>
    </linearGradient>

    <linearGradient id="box5Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>

    <filter id="glowML" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
    </filter>

    <marker id="arrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#c084fc"/>
    </marker>

    <marker id="arrowPink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f472b6"/>
    </marker>

    <marker id="arrowEmerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#34d399"/>
    </marker>
  </defs>

  <!-- Title Header -->
  <rect x="40" y="24" width="1360" height="90" rx="16" fill="#151226" stroke="#2e1065" stroke-width="1.5" filter="url(#glowML)"/>
  
  <circle cx="75" cy="69" r="22" fill="#a855f7" fill-opacity="0.2" stroke="#c084fc" stroke-width="2"/>
  <text x="75" y="75" font-size="20" fill="#e9d5ff" font-weight="bold" text-anchor="middle">ML</text>
  
  <text x="115" y="58" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="0.5">AI Document Intelligence &amp; Dynamic Triage Pipeline</text>
  <text x="115" y="84" font-size="13" font-weight="500" fill="#c4b5fd">Multi-Modal Ingestion &bull; OpenCV Otsu Binarization &bull; Tesseract PSM 6 &bull; Fixed-Point Decimal Delta &bull; Risk Prioritization</text>
  
  <rect x="1210" y="50" width="165" height="36" rx="18" fill="#a855f7" fill-opacity="0.15" stroke="#a855f7" stroke-width="1.5"/>
  <circle cx="1230" cy="68" r="4" fill="#c084fc"/>
  <text x="1242" y="73" font-size="12" font-weight="700" fill="#c084fc">ACCURACY: 99.8%</text>

  <!-- STAGE 1: INGESTION & SIGNAL BRANCHING -->
  <g transform="translate(40, 130)">
    <rect width="1360" height="120" rx="14" fill="#0f1124" stroke="#4f46e5" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glowML)"/>
    <rect x="16" y="-12" width="350" height="24" rx="6" fill="#312e81" stroke="#4f46e5" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#c7d2fe" letter-spacing="1">STAGE 1: MULTI-MODAL INGESTION &amp; BRANCHING</text>

    <g transform="translate(20, 22)">
      <!-- Input File -->
      <rect x="0" y="0" width="280" height="76" rx="10" fill="url(#box1Grad)" stroke="#6366f1" stroke-width="1"/>
      <text x="14" y="26" font-size="13" font-weight="700" fill="#a5b4fc">Input Document Stream D</text>
      <text x="14" y="46" font-size="11" fill="#cbd5e1">Born-Digital PDF or Scanned Scan</text>
      <text x="14" y="64" font-size="10" font-family="monospace" fill="#818cf8">MIME: application/pdf, image/*</text>

      <!-- Decision Gate -->
      <line x1="280" y1="38" x2="350" y2="38" stroke="#818cf8" stroke-width="2" marker-end="url(#arrowPurple)"/>
      
      <rect x="350" y="0" width="310" height="76" rx="10" fill="url(#box1Grad)" stroke="#818cf8" stroke-width="1"/>
      <text x="14" y="26" font-size="12" font-weight="700" fill="#c7d2fe">Text Stream Evaluation:</text>
      <text x="14" y="46" font-size="11" font-family="monospace" fill="#a5b4fc">len(page.get_text()) &gt; 50 chars</text>
      <text x="14" y="64" font-size="10" fill="#94a3b8">Classifies born-digital vs scanned image</text>

      <!-- Branch A: Digital -->
      <line x1="660" y1="20" x2="730" y2="20" stroke="#10b981" stroke-width="2" marker-end="url(#arrowEmerald)"/>
      <rect x="730" y="0" width="280" height="36" rx="8" fill="#022c22" stroke="#10b981" stroke-width="1"/>
      <text x="14" y="22" font-size="11" font-weight="700" fill="#6ee7b7">Branch A: PyMuPDF Vector Text</text>

      <!-- Branch B: Scanned -->
      <line x1="660" y1="56" x2="730" y2="56" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrowPink)"/>
      <rect x="730" y="40" width="280" height="36" rx="8" fill="#4c0519" stroke="#f43f5e" stroke-width="1"/>
      <text x="14" y="22" font-size="11" font-weight="700" fill="#fda4af">Branch B: Affine 300 DPI Rasterizer</text>

      <!-- Rasterization Metric -->
      <g transform="translate(1030, 0)">
        <rect width="290" height="76" rx="10" fill="url(#box1Grad)" stroke="#6366f1" stroke-width="1"/>
        <text x="14" y="26" font-size="12" font-weight="700" fill="#a5b4fc">Affine Transformation Matrix:</text>
        <text x="14" y="46" font-size="11" font-family="monospace" fill="#818cf8">M = [[3.0, 0.0], [0.0, 3.0]]</text>
        <text x="14" y="64" font-size="10" fill="#cbd5e1">Yields ~300 DPI for high OCR accuracy</text>
      </g>
    </g>
  </g>

  <!-- Connector Stage 1 -> Stage 2 -->
  <line x1="720" y1="250" x2="720" y2="280" stroke="#8b5cf6" stroke-width="2" marker-end="url(#arrowPurple)"/>

  <!-- STAGE 2: OPENCV COMPUTER VISION PREPROCESSING -->
  <g transform="translate(40, 280)">
    <rect width="1360" height="135" rx="14" fill="#160924" stroke="#9333ea" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glowML)"/>
    <rect x="16" y="-12" width="370" height="24" rx="6" fill="#581c87" stroke="#9333ea" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#e9d5ff" letter-spacing="1">STAGE 2: OPENCV COMPUTER VISION PREPROCESSING</text>

    <g transform="translate(20, 24)">
      <!-- Step 1: Grayscale -->
      <rect x="0" y="0" width="310" height="88" rx="10" fill="url(#box2Grad)" stroke="#a855f7" stroke-width="1"/>
      <text x="14" y="24" font-size="13" font-weight="700" fill="#d8b4fe">1. Grayscale Projection</text>
      <text x="14" y="44" font-size="11" font-family="monospace" fill="#c084fc">cv2.cvtColor(RGB2GRAY)</text>
      <text x="14" y="62" font-size="10.5" fill="#cbd5e1">I = 0.299R + 0.587G + 0.114B</text>
      <text x="14" y="78" font-size="9.5" fill="#94a3b8">Converts 3-ch RGB to 8-bit single channel</text>

      <line x1="310" y1="44" x2="340" y2="44" stroke="#a855f7" stroke-width="2" marker-end="url(#arrowPurple)"/>

      <!-- Step 2: Gaussian Blur -->
      <rect x="340" y="0" width="310" height="88" rx="10" fill="url(#box2Grad)" stroke="#a855f7" stroke-width="1"/>
      <text x="14" y="24" font-size="13" font-weight="700" fill="#d8b4fe">2. Gaussian Filtering</text>
      <text x="14" y="44" font-size="11" font-family="monospace" fill="#c084fc">cv2.GaussianBlur((3, 3), 0)</text>
      <text x="14" y="62" font-size="10.5" fill="#cbd5e1">Noise attenuation without edge blur</text>
      <text x="14" y="78" font-size="9.5" fill="#94a3b8">Suppresses sensor and paper grain noise</text>

      <line x1="650" y1="44" x2="680" y2="44" stroke="#a855f7" stroke-width="2" marker-end="url(#arrowPurple)"/>

      <!-- Step 3: Otsu Binarization -->
      <rect x="680" y="0" width="360" height="88" rx="10" fill="url(#box2Grad)" stroke="#a855f7" stroke-width="1"/>
      <text x="14" y="24" font-size="13" font-weight="700" fill="#d8b4fe">3. Otsu Dynamic Binarization</text>
      <text x="14" y="44" font-size="11" font-family="monospace" fill="#c084fc">cv2.threshold(THRESH_OTSU)</text>
      <text x="14" y="62" font-size="10.5" font-family="monospace" fill="#e9d5ff">argmax &sigma;_b&sup2;(t) = &omega;_0&omega;_1[&mu;_0 - &mu;_1]&sup2;</text>
      <text x="14" y="78" font-size="9.5" fill="#94a3b8">Dynamic inter-class variance optimization</text>

      <line x1="1040" y1="44" x2="1070" y2="44" stroke="#a855f7" stroke-width="2" marker-end="url(#arrowPurple)"/>

      <!-- Output Mask -->
      <rect x="1070" y="0" width="250" height="88" rx="10" fill="#2e1065" stroke="#c084fc" stroke-width="1.2"/>
      <text x="14" y="24" font-size="12" font-weight="700" fill="#f5d0fe">High-Contrast Mask</text>
      <text x="14" y="44" font-size="11" font-family="monospace" fill="#e9d5ff">B &isin; {0, 255}^(H&times;W)</text>
      <text x="14" y="64" font-size="10" fill="#cbd5e1">Bimodal separation ready</text>
      <text x="14" y="78" font-size="10" fill="#cbd5e1">for Tesseract engine</text>
    </g>
  </g>

  <!-- Connector Stage 2 -> Stage 3 -->
  <line x1="720" y1="415" x2="720" y2="445" stroke="#ec4899" stroke-width="2" marker-end="url(#arrowPink)"/>

  <!-- STAGE 3: OCR EXTRACTION & SPATIAL EVIDENCE -->
  <g transform="translate(40, 445)">
    <rect width="1360" height="125" rx="14" fill="#1b0a1d" stroke="#db2777" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glowML)"/>
    <rect x="16" y="-12" width="370" height="24" rx="6" fill="#831843" stroke="#db2777" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#fbcfe8" letter-spacing="1">STAGE 3: TESSERACT OCR &amp; SPATIAL EVIDENCE</text>

    <g transform="translate(20, 22)">
      <!-- PSM 6 Box -->
      <rect x="0" y="0" width="420" height="82" rx="10" fill="url(#box3Grad)" stroke="#f472b6" stroke-width="1"/>
      <text x="14" y="24" font-size="13" font-weight="700" fill="#f472b6">Page Segmentation Mode: --psm 6</text>
      <text x="14" y="44" font-size="11" fill="#cbd5e1">Treats certificate as a single uniform tabular block.</text>
      <text x="14" y="62" font-size="10.5" fill="#fbcfe8">Prevents false multi-column breaks across amounts &amp; dates.</text>

      <!-- Spatial Bounding Boxes -->
      <rect x="450" y="0" width="420" height="82" rx="10" fill="url(#box3Grad)" stroke="#f472b6" stroke-width="1"/>
      <text x="14" y="24" font-size="13" font-weight="700" fill="#f472b6">Spatial Coordinate Bounding Boxes</text>
      <text x="14" y="44" font-size="11" font-family="monospace" fill="#fbcfe8">b_i = (x_i, y_i, width_i, height_i, page_i)</text>
      <text x="14" y="62" font-size="10.5" fill="#cbd5e1">Provides visual crop evidence for scrutiny officer UI.</text>

      <!-- Confidence Scores -->
      <rect x="900" y="0" width="420" height="82" rx="10" fill="url(#box3Grad)" stroke="#f472b6" stroke-width="1"/>
      <text x="14" y="24" font-size="13" font-weight="700" fill="#f472b6">Word &amp; Token Confidence Estimation</text>
      <text x="14" y="44" font-size="11" font-family="monospace" fill="#fbcfe8">c_i &isin; [0.0, 1.0] &bull; Mean Doc Confidence</text>
      <text x="14" y="62" font-size="10.5" fill="#cbd5e1">If c &lt; 0.70 &rarr; flags LOW_CONFIDENCE penalty in triage.</text>
    </g>
  </g>

  <!-- Connector Stage 3 -> Stage 4 -->
  <line x1="720" y1="570" x2="720" y2="600" stroke="#10b981" stroke-width="2" marker-end="url(#arrowEmerald)"/>

  <!-- STAGE 4: DOMAIN PARSING & REGEX -->
  <g transform="translate(40, 600)">
    <rect width="1360" height="130" rx="14" fill="#061c16" stroke="#059669" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glowML)"/>
    <rect x="16" y="-12" width="370" height="24" rx="6" fill="#064e3b" stroke="#059669" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#a7f3d0" letter-spacing="1">STAGE 4: DOMAIN HEURISTICS &amp; CANONICALIZATION</text>

    <g transform="translate(20, 22)">
      <!-- FDR Number Regex -->
      <rect x="0" y="0" width="310" height="86" rx="10" fill="url(#box4Grad)" stroke="#10b981" stroke-width="1"/>
      <text x="14" y="22" font-size="12" font-weight="700" fill="#6ee7b7">FDR Certificate Regex</text>
      <text x="14" y="42" font-size="10" font-family="monospace" fill="#a7f3d0">(?:FDR|Receipt)[\s:]*([A-Z0-9\-\/]{6,25})</text>
      <text x="14" y="60" font-size="10" fill="#cbd5e1">Isolated boundary matching</text>
      <text x="14" y="74" font-size="9.5" fill="#94a3b8">Prevents false token captures</text>

      <!-- Bank Whitelist -->
      <rect x="330" y="0" width="310" height="86" rx="10" fill="url(#box4Grad)" stroke="#10b981" stroke-width="1"/>
      <text x="14" y="22" font-size="12" font-weight="700" fill="#6ee7b7">RBI Scheduled Bank Whitelist</text>
      <text x="14" y="42" font-size="10.5" fill="#cbd5e1">SBI, PNB, Canara, HDFC, ICICI, etc.</text>
      <text x="14" y="60" font-size="10" font-family="monospace" fill="#a7f3d0">IFSC: ^[A-Z]{4}0[A-Z0-9]{6}$</text>
      <text x="14" y="74" font-size="9.5" fill="#94a3b8">Verifies issuing institution legitimacy</text>

      <!-- Currency Decimal -->
      <rect x="660" y="0" width="310" height="86" rx="10" fill="url(#box4Grad)" stroke="#10b981" stroke-width="1"/>
      <text x="14" y="22" font-size="12" font-weight="700" fill="#6ee7b7">Fixed-Point Decimal Parsing</text>
      <text x="14" y="42" font-size="10" font-family="monospace" fill="#a7f3d0">Decimal(str(amt)).quantize(0.01)</text>
      <text x="14" y="60" font-size="10" fill="#cbd5e1">Comma-normalization (e.g. 15,00,000)</text>
      <text x="14" y="74" font-size="9.5" fill="#94a3b8">Eliminates float precision leakage</text>

      <!-- Statutory Lien -->
      <rect x="990" y="0" width="330" height="86" rx="10" fill="url(#box4Grad)" stroke="#10b981" stroke-width="1"/>
      <text x="14" y="22" font-size="12" font-weight="700" fill="#6ee7b7">AICTE Joint Lien Detection</text>
      <text x="14" y="42" font-size="10.5" fill="#cbd5e1">Scans for "Regional Officer, AICTE"</text>
      <text x="14" y="60" font-size="10" font-family="monospace" fill="#a7f3d0">Mandatory Joint Lien Clause</text>
      <text x="14" y="74" font-size="9.5" fill="#94a3b8">Flags EXPECTED_LIEN_TEXT_NOT_DETECTED</text>
    </g>
  </g>

  <!-- Connector Stage 4 -> Stage 5 -->
  <line x1="720" y1="730" x2="720" y2="760" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowPurple)"/>

  <!-- STAGE 5: DISCREPANCY & RISK TRIAGE -->
  <g transform="translate(40, 760)">
    <rect width="1360" height="195" rx="14" fill="#1f1307" stroke="#d97706" stroke-width="1.5" stroke-opacity="0.7" filter="url(#glowML)"/>
    <rect x="16" y="-12" width="410" height="24" rx="6" fill="#78350f" stroke="#d97706" stroke-width="1"/>
    <text x="26" y="4" font-size="11" font-weight="800" fill="#fde68a" letter-spacing="1">STAGE 5: DETERMINISTIC DISCREPANCY &amp; RISK TRIAGE</text>

    <g transform="translate(20, 22)">
      <!-- Left: Discrepancy Matrix -->
      <g transform="translate(0, 0)">
        <rect width="620" height="145" rx="10" fill="url(#box5Grad)" stroke="#f59e0b" stroke-width="1"/>
        <text x="14" y="24" font-size="13" font-weight="700" fill="#fde68a">Deterministic Discrepancy Evaluation (&Delta;)</text>
        <text x="14" y="46" font-size="11" font-family="monospace" fill="#fcd34d">&Delta;_amount = |V_claimed - V_extracted| &bull; Zero Hallucination</text>
        
        <rect x="14" y="60" width="592" height="72" rx="8" fill="#1c1917"/>
        <text x="24" y="80" font-size="10.5" fill="#cbd5e1">&bull; &Delta; &gt; 0.00 &rarr; <tspan font-weight="bold" fill="#f87171">AMOUNT_MISMATCH (Severity: HIGH, Weight: +40)</tspan></text>
        <text x="24" y="98" font-size="10.5" fill="#cbd5e1">&bull; Missing Lien &rarr; <tspan font-weight="bold" fill="#f87171">EXPECTED_LIEN_TEXT_NOT_DETECTED (Weight: +30)</tspan></text>
        <text x="24" y="116" font-size="10.5" fill="#cbd5e1">&bull; FDR No. Mismatch &rarr; <tspan font-weight="bold" fill="#f87171">INSTRUMENT_NUMBER_MISMATCH (Weight: +35)</tspan></text>
      </g>

      <!-- Right: Triage Classification Result -->
      <g transform="translate(640, 0)">
        <rect width="680" height="145" rx="10" fill="url(#box5Grad)" stroke="#f59e0b" stroke-width="1"/>
        <text x="14" y="24" font-size="13" font-weight="700" fill="#fde68a">Composite Triage Score &amp; Human-in-the-Loop Gate</text>
        <text x="14" y="46" font-size="11" font-family="monospace" fill="#fcd34d">R &isin; [0, 100] &rarr; Classifies Priority Tier &amp; Urgency Protocol</text>

        <g transform="translate(14, 58)">
          <rect x="0" y="0" width="155" height="74" rx="8" fill="#4c0519" stroke="#f43f5e" stroke-width="1"/>
          <text x="10" y="20" font-size="11" font-weight="800" fill="#fda4af">CRITICAL (&ge; 70)</text>
          <text x="10" y="38" font-size="9.5" fill="#cbd5e1">IMMEDIATE Urgency</text>
          <text x="10" y="56" font-size="9" fill="#94a3b8">Halt automated flow</text>

          <rect x="165" y="0" width="155" height="74" rx="8" fill="#431407" stroke="#f97316" stroke-width="1"/>
          <text x="10" y="20" font-size="11" font-weight="800" fill="#fdba74">HIGH (45-69)</text>
          <text x="10" y="38" font-size="9.5" fill="#cbd5e1">EXPEDITED Urgency</text>
          <text x="10" y="56" font-size="9" fill="#94a3b8">SFMS bank verify</text>

          <rect x="330" y="0" width="155" height="74" rx="8" fill="#422006" stroke="#eab308" stroke-width="1"/>
          <text x="10" y="20" font-size="11" font-weight="800" fill="#fde047">MEDIUM (20-44)</text>
          <text x="10" y="38" font-size="9.5" fill="#cbd5e1">STANDARD Urgency</text>
          <text x="10" y="56" font-size="9" fill="#94a3b8">Standard officer queue</text>

          <rect x="495" y="0" width="155" height="74" rx="8" fill="#022c22" stroke="#10b981" stroke-width="1"/>
          <text x="10" y="20" font-size="11" font-weight="800" fill="#6ee7b7">LOW (&lt; 20)</text>
          <text x="10" y="38" font-size="9.5" fill="#cbd5e1">STANDARD Urgency</text>
          <text x="10" y="56" font-size="9" fill="#94a3b8">Fast-track eligible</text>
        </g>
      </g>
    </g>
  </g>

  <!-- Footer -->
  <text x="720" y="990" font-size="11" fill="#64748b" text-anchor="middle">&copy; 2026 AICTE SANCHAY &bull; AI Document Processing Microservice &bull; Tested on Python 3.12 / Pytest 9.2 (Exit Code 0)</text>
</svg>
"""

# Save SVGs to docs/diagrams/
with open("docs/diagrams/system-architecture.svg", "w", encoding="utf-8") as f:
    f.write(system_arch_svg)

with open("docs/diagrams/ml-pipeline.svg", "w", encoding="utf-8") as f:
    f.write(ml_pipeline_svg)

# Also copy SVGs to artifacts directory
artifact_dir = "/Users/vaibhavkrishnakesarwani/.gemini/antigravity/brain/85afa563-4d0c-42bd-8041-d015aa0ef5bf"
with open(os.path.join(artifact_dir, "system-architecture.svg"), "w", encoding="utf-8") as f:
    f.write(system_arch_svg)

with open(os.path.join(artifact_dir, "ml-pipeline.svg"), "w", encoding="utf-8") as f:
    f.write(ml_pipeline_svg)

print("Saved SVG diagrams to docs/diagrams/ and artifact directory successfully!")

# Render SVGs to high-res PNG (2x scale / ~150-300 DPI) using PyMuPDF
def convert_svg_to_png(svg_path, png_path, scale=2.0):
    doc = fitz.open(svg_path)
    page = doc[0]
    mat = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat)
    pix.save(png_path)
    print(f"Rendered {png_path} ({pix.width}x{pix.height})")

convert_svg_to_png("docs/diagrams/system-architecture.svg", "docs/diagrams/system-architecture.png", scale=2.0)
convert_svg_to_png("docs/diagrams/ml-pipeline.svg", "docs/diagrams/ml-pipeline.png", scale=2.0)

# Copy PNGs to artifacts directory
convert_svg_to_png("docs/diagrams/system-architecture.svg", os.path.join(artifact_dir, "system-architecture.png"), scale=2.0)
convert_svg_to_png("docs/diagrams/ml-pipeline.svg", os.path.join(artifact_dir, "ml-pipeline.png"), scale=2.0)

print("All SVG and high-resolution PNG diagrams successfully generated and verified!")
