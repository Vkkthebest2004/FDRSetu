# 04 - Authentication, Authorization & Security Architecture

This document specifies the end-to-end security architecture of the AICTE FDR Portal, covering session lifecycle, token management with `@supabase/ssr`, role-based access control (RBAC), multi-layer authorization guards, the Four-Eyes principle, and tamper-proof audit trails.

---

## 1. Defense-in-Depth Security Model

The system employs a four-tier defense model ensuring that an exploit or bypass at one layer is halted by subsequent layers:

```
[ Tier 1: Next.js Edge Middleware ] ────────► Inspects cookies, redirects unauthenticated requests,
                                              blocks forbidden paths before page render.
        │
        ▼
[ Tier 2: Server-Side Route / Action Guards ] ─► requireAuth(), requireRole() inspect server session
                                              and throw/redirect before executing business logic.
        │
        ▼
[ Tier 3: Service Layer Isolation ] ────────► Institution ID tenancy filters applied to every SQL
                                              query and ORM fetch.
        │
        ▼
[ Tier 4: PostgreSQL Row Level Security ] ──► Database-level RLS policies enforced by PostgreSQL
                                              kernel; impossible to bypass from API client.
```

---

## 2. Supabase Auth & Session Management (`@supabase/ssr`)

Authentication uses Supabase Auth with PKCE flow and secure, HTTP-only, `SameSite=Lax` cookies.

### Next.js Middleware Session Handling (`frontend/lib/supabase/middleware.ts`)
```typescript
const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
    },
  },
});
```

### Cookie Lifecycle:
1. When a user submits valid credentials at `/login`, Supabase returns an `access_token` (JWT, 1-hour expiry) and a `refresh_token` (persistent).
2. The middleware automatically rotates expired JWT tokens transparently on incoming server requests.
3. The `aicte_session_role` cookie provides synchronized persona switching for evaluation and role verification during live demonstrations.

---

## 3. Four-Tier Role-Based Access Control (RBAC)

The AICTE security deposit domain strictly defines four roles:

| Role Identifier | Real-World Persona | System Privileges | Route Permissions |
| :--- | :--- | :--- | :--- |
| `institution_user` | College Principal / Registrar | Submit new FDRs, upload renewal receipts, raise release requests, view own institution records | `/dashboard`, `/fdrs`, `/renewals`, `/release-requests` |
| `scrutiny_officer` | AICTE Regional Scrutiny Officer | Review FDR claims, inspect OCR extraction & discrepancies, raise deficiency notices, submit recommendations | All above + `/verification`, `/verification/[id]` |
| `approving_authority` | AICTE Finance Bureau Advisor | Formally approve/reject FDR validity, authorize release/refund disbursements | All above + Financial release approval actions |
| `administrator` | AICTE Central IT Admin | Manage global system parameters, inspect immutable audit trail, monitor system health | All above + `/admin`, `/audit-logs`, `/settings` |

---

## 4. Role Authorization Matrix

The table below defines strict CRUD permissions per entity:

| Database Entity | Institution User | Scrutiny Officer | Approving Authority | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Institutions** | Read Own | Read All | Read All | Read / Write All |
| **FDR Records (Draft)** | Create / Read / Edit | Read All | Read All | Read All |
| **FDR Records (Submitted)** | Read Own | Read All | Read All | Read All |
| **Verification Cases** | None | Create / Update (Scrutinize) | Review & Concur | Read All |
| **Release Requests** | Create Own | Scrutinize & Recommend | **Approve / Reject** | Read All |
| **Audit Logs** | Read Own Events | Read Scrutiny Events | Read All | Read All (No Edit) |
| **System Settings** | None | None | None | Read / Write |

---

## 5. Server-Side Guard Functions (`frontend/lib/auth/roles.ts`)

Server Components, Route Handlers, and Server Actions enforce role checks through strongly-typed guard utilities:

```typescript
// 1. Mandatory Session Guard
export async function requireAuth(): Promise<Profile> {
  const user = await FDRService.getCurrentUser();
  if (!user || !user.is_active) {
    redirect('/login');
  }
  return user;
}

// 2. Role Restriction Guard
export async function requireRole(allowedRoles: SystemRole[]): Promise<Profile> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.system_role)) {
    redirect('/forbidden');
  }
  return user;
}

// 3. Multi-Tenancy Boundary Guard
export async function requireInstitutionMembership(targetInstitutionId: string): Promise<Profile> {
  const user = await requireAuth();
  if (isOfficerOrAdmin(user.system_role)) {
    return user; // Officers possess regulatory jurisdiction across all institutions
  }
  const institutions = await FDRService.getInstitutions();
  if (targetInstitutionId !== institutions[0].id) {
    redirect('/forbidden');
  }
  return user;
}
```

---

## 6. Separation of Duties & The Four-Eyes Principle

In educational regulatory compliance, no single individual should have end-to-end control over financial security deposits. The portal programmatically enforces:

1. **Dual Control on Release**:
   - An `institution_user` requests a refund.
   - A `scrutiny_officer` audits bank certificates, OCR, and AI discrepancy reports, recording a formal scrutiny report.
   - An `approving_authority` verifies the officer's recommendation and issues the final release order.
   - **Enforcement Code**:
     ```typescript
     export function canApproveRelease(user: Profile): boolean {
       return user.system_role === 'approving_authority';
     }
     ```

2. **Immutability of Submitted Records**:
   - Once an FDR is submitted (`SUBMITTED`, `UNDER_REVIEW`, `VERIFIED`), institutions can no longer edit values.
   - Editing is only re-enabled if an officer explicitly marks the record `NEEDS_CORRECTION`.
   - **Enforcement Code**:
     ```typescript
     export function canEditFDR(user: Profile, fdr: FDRRecord): boolean {
       if (user.system_role !== 'institution_user') return false;
       return fdr.review_status === 'DRAFT' || fdr.review_status === 'NEEDS_CORRECTION';
     }
     ```

---

## 7. Tamper-Proof Audit Logging

Every critical financial and administrative action is logged to the `audit_events` table. PostgreSQL guarantees record immutability via rules:

```sql
-- Block all manual or automated updates to audit events
CREATE OR REPLACE RULE no_update_audit AS
  ON UPDATE TO public.audit_events DO INSTEAD NOTHING;

-- Block all deletions from audit events
CREATE OR REPLACE RULE no_delete_audit AS
  ON DELETE TO public.audit_events DO INSTEAD NOTHING;
```

Each log entry records:
- `user_id`: UUID of the authenticated actor.
- `action`: Canonical event name (e.g., `fdr.submitted`, `verification.scrutinized`, `release.approved`).
- `entity_table`: Target table name (`fdr_records`, `release_requests`).
- `entity_id`: UUID of the modified record.
- `metadata`: Complete JSON snapshot of values before and after the transition.
- `ip_address` & `user_agent`: Network origin identifiers.

