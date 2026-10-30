# 05 - Frontend Architecture, UI/UX & CSS Animations

This document details the frontend implementation built on Next.js 16 App Router, React 19, Tailwind CSS v4, and Lucide React. It explains the user experience, layout hierarchy, interactive components, streaming loading states, and custom keyframe animations.

---

## 1. Technical Stack & Layout Architecture

The user interface follows modern Next.js App Router conventions, leveraging React Server Components (RSC) for zero-bundle-overhead page rendering and selective Client Components (`'use client'`) for stateful interactions (e.g., forms, charts, interactive filters, persona switching).

```
frontend/app/
├── layout.tsx                # Root layout with Inter font & AuthProvider
├── globals.css               # Tailwind v4 configuration + custom keyframe animations
├── loading.tsx               # Root streaming loading skeleton
├── page.tsx                  # Public Government Landing Page
├── login/
│   ├── page.tsx              # Split-screen login with 4 one-click personas
│   └── loading.tsx           # Dedicated login loading skeleton
├── register/
│   ├── page.tsx              # New institution onboarding & profile creation
│   └── loading.tsx           # Registration loading skeleton
├── dashboard/                # Central KPI overview & analytics
├── fdrs/
│   ├── page.tsx              # FDR deposit inventory table with filters
│   ├── submit/page.tsx       # Multi-step FDR upload & AI processing form
│   └── [id]/page.tsx         # Detailed FDR view with OCR side-by-side comparison
├── verification/             # Scrutiny officer queue & discrepancy triage
├── renewals/                 # Maturity tracking, 90/60/30-day renewal alerts
├── release-requests/         # Four-eyes refund authorization workflow
├── reports/                  # Recharts financial analytics & CSV export
├── admin/
│   ├── page.tsx              # System configurations & tenant oversight
│   └── audit/page.tsx        # Immutable audit trail inspection
├── notifications/            # Realtime system alerts & regulatory reminders
├── forbidden/page.tsx        # 403 Forbidden handler
└── unauthorized/page.tsx     # 401 Unauthorized handler
```

---

## 2. Public Landing Page (`frontend/app/page.tsx`)

The landing page provides a modern, institutional presentation suitable for an official Government of India portal:

1. **Official Header**:
   - Government of India emblem & AICTE branding.
   - Live navigation with quick links to Portal Login, Institutional Registration, and AICTE Public Portal.
2. **Hero Section**:
   - Compelling value proposition: *"AICTE Fixed Deposit & Security Deposit Management System"*.
   - Call-to-action buttons: *Institution Portal Login* and *Register New College / Polytechnic*.
   - Live Trust Stats: ₹1,420+ Cr Deposits Monitored, 11,400+ Institutions, 99.8% AI Discrepancy Detection Accuracy.
3. **Four-Step Regulatory Lifecycle**:
   - Visual workflow cards explaining Deposit Submission, AI & OCR Extraction, Official Scrutiny, and Final Release.
4. **Institutional Security Highlights**:
   - AES-256 encrypted private Supabase Storage buckets.
   - Dual-control Four-Eyes release disbursement protocols.
   - Automated 90-day bank renewal alerts preventing lapsed collateral.

---

## 3. Split-Screen Login & Evaluation Personas (`frontend/app/login/page.tsx`)

The login experience is designed for fast academic and official demonstration:

1. **Left Hero Panel**:
   - Deep AICTE Navy gradient (`from-blue-950 via-slate-900 to-indigo-950`).
   - Glowing concentric badges with smooth opposite-direction rotation (`animate-spin-slow` and `animate-spin-reverse`).
   - Bulleted compliance badges: RBI-Approved Bank Verification, Tesseract & OpenCV Extraction, Tamper-Proof Audit Logging.
2. **Right Authentication Form**:
   - Email & Password input fields with floating focus rings.
   - Form submission with interactive button loading state.
3. **One-Click Quick-Demo Personas**:
   - For rapid assessment and viva demonstration, four instant persona buttons pre-fill valid credentials and set active session cookies:
     - **Institution User**: `principal@delhi-tech.edu.in` (College Principal)
     - **Scrutiny Officer**: `officer.north@aicte-india.org` (Regional Scrutiny)
     - **Approving Authority**: `advisor.finance@aicte-india.org` (AICTE Bureau Head)
     - **Administrator**: `sysadmin@aicte-india.org` (Central IT Admin)

---

## 4. Institutional Registration Portal (`frontend/app/register/page.tsx`)

Allows new engineering colleges, polytechnics, and management institutes to onboard:

- **AICTE Permanent Institute ID Validation**: Validates mandatory format (e.g., `1-9876543210`).
- **Institutional Profile**: Institute Name, Regional Office selection (Northern, Western, Southern, Central, etc.), State, and AICTE Approval Reference.
- **Account Credentials**: Authorizing Officer Email, Mobile Number, and secure password confirmation.
- **Instant Tenant Binding**: Automatically creates the `institutions` record, provisions the `profiles` row, and binds the user with `institution_user` privileges.

---

## 5. Custom Keyframe Animations (`frontend/app/globals.css`)

Smooth micro-interactions give the portal a polished enterprise feel without external bloated JavaScript animation libraries:

```css
/* Ambient badge floating */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Radar pulse glow on security badges */
@keyframes pulseGlow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.05); }
}

/* Modal and card entrance */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Concentric tech-ring rotation */
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinReverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

/* Indeterminate progress bar for AI processing */
@keyframes progressIndeterminate {
  0% { transform: translateX(-100%); width: 20%; }
  50% { transform: translateX(50%); width: 60%; }
  100% { transform: translateX(200%); width: 20%; }
}

/* Shimmer wave effect for loading skeletons */
@keyframes skeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Utility Classes:
- `.animate-float`: 4-second continuous vertical float.
- `.animate-spin-slow`: 14-second continuous linear rotation.
- `.animate-spin-reverse`: 9-second reverse rotation for dual-ring visual depth.
- `.animate-fade-in-up`: Smooth 350ms entrance for newly rendered cards.
- `.skeleton-pulse`: High-contrast gradient shimmer for pending data fetches.
- `.shimmer-bar`: Shimmer highlight line over active submission forms.

---

## 6. Streaming Loading States (`loading.tsx`)

Next.js 16 React Suspense boundaries provide instant visual feedback during page transitions:

1. **Root Skeleton (`app/loading.tsx`)**:
   - Renders a 4-card metric grid skeleton followed by an animated table placeholder.
   - Eliminates layout shift when querying Supabase across slow network connections.
2. **Auth Skeletons (`app/login/loading.tsx`, `app/register/loading.tsx`)**:
   - Preserves identical layout dimensions, rendering pulse placeholders for input fields and action buttons to ensure zero cumulative layout shift (CLS = 0).
3. **AppLayout Suspense Boundaries**:
   - In `components/layout/AppLayout.tsx`, header navigation and user avatars are wrapped in `<Suspense>` so the page content begins streaming immediately while session validation completes.

