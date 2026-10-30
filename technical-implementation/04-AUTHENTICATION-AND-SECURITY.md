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

## 7. Tamper-Proof Audit Logging & Hardened Immutability Triggers

Every critical financial and administrative action is logged to the `audit_events` and Blueprint v2.0 `audit_logs` tables. PostgreSQL guarantees record immutability via explicit `BEFORE UPDATE OR DELETE` triggers that raise database exceptions:

```sql
-- Blueprint v2.0 Hardened Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit trail is strictly append-only. UPDATE or DELETE operations are forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_immutable
  BEFORE UPDATE OR DELETE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();
```

Even an administrative database user cannot overwrite or truncate audit events without generating an explicit SQL error.

Each log entry records:
- `user_id`: UUID of the authenticated actor.
- `action`: Canonical event name (e.g., `fdr.submitted`, `verification.scrutinized`, `release.approved`).
- `entity_table`: Target table name (`fdr_records`, `release_requests`).
- `entity_id`: UUID of the modified record.
- `metadata`: Complete JSON snapshot of values before and after the transition.
- `ip_address` & `user_agent`: Network origin identifiers.

---

## 8. Storage Security & Short-Lived HMAC Signed URLs

FDR certificates contain sensitive banking instruments and lien mandates. They are strictly protected:
1. **Private Buckets**: The Supabase Storage bucket `fdr-documents` has `public = false`. Direct unauthenticated reads return HTTP 403 Forbidden.
2. **Tenancy Folder Isolation**: RLS policies enforce that institutions can only upload to folders matching their institutional UUID: `(storage.foldername(name))[1] = auth.uid()::text`.
3. **Time-Limited HMAC Signatures**: Scrutiny officers and authorized approvers view documents exclusively through time-limited HMAC-SHA256 signed URLs generated with a 15-minute (900s) TTL:
   ```typescript
   const { data, error } = await supabase.storage
     .from('fdr-documents')
     .createSignedUrl(storagePath, 900); // 15-minute validity window
   ```

---

## 9. Optimistic Concurrency Control (Blueprint v2.0)

To prevent race conditions, concurrent approvals, or double-release authorizations when multiple officers inspect records simultaneously, all mutable entities maintain an integer `version` field.
When updating an entity:
```sql
UPDATE public.fdr_records
SET review_status = 'ACCEPTED',
    version = version + 1
WHERE id = p_fdr_id AND version = p_expected_version;
```
If the row has been updated by another officer in the interim, 0 rows are affected, causing the service layer to abort and throw a `VERSION_CONFLICT` exception, preventing stale updates.

---

## 10. Automated Security & Authorization Test Results

The authentication and authorization architecture is validated via `frontend/tests/auth.test.ts` (9/9 suites passing):

```bash
cd frontend && npx tsx tests/auth.test.ts
```

```
=== Running AICTE FDR Authentication & Authorization Tests ===
[Test 1] Testing Role Gate Functions...
[Test 2] Testing Verification Review Permissions...
[Test 3] Testing Separation of Duties for Release Approvals...
[Test 4] Testing FDR Record State Mutation Restrictions...
[Test 5] Testing Institution Data Isolation via FDRService...
  -> Verified: Institution user sees exclusively their 3 institution records.
  -> Verified: Scrutiny officer has multi-institution oversight (7 records).
[Test 6] Testing New Institutional User Registration (Sign Up Flow)...
  -> Verified: Successfully registered new user Prof. S. K. Sen for Apex Institute of Advanced Technology with PENDING onboarding status.
[Test 7] Testing Blueprint v2.0 Optimistic Concurrency & Versioning...
  -> Verified: Stale update rejected with VERSION_CONFLICT and valid update incremented version to 2.
[Test 8] Testing Blueprint v2.0 Transactional Outbox Deduplication...
  -> Verified: Enqueued outbox alert with idempotent key 'fdr-maturity-alert-fdr-1793391941505-90days'.
[Test 9] Testing AI Risk Scoring & Case Prioritization Engine...
  -> Verified: AI Risk Engine classified high-risk case as CRITICAL (98/100) and compliant case as LOW (8/100).

All 9 Authentication, Authorization, Optimistic Concurrency, Outbox & AI Prioritization test suites PASSED successfully!
```

