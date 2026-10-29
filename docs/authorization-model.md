# AICTE FDR Portal — Authorization Model

## 1. Role-Based Access Control (RBAC) & Row-Level Security (RLS)

In a high-stakes government compliance portal, authorization must be enforced in two complementary layers:
1. **Server Route/Action Layer (Next.js)**: Validates session JWT, retrieves user roles, and blocks unauthorized actions before calling the database.
2. **PostgreSQL Row Level Security (RLS Layer)**: The authoritative gatekeeper. Even if an attacker injects code or calls the Supabase REST/GraphQL endpoint directly with an anon key, PostgreSQL rejects any read or write violating the policy.

---

## 2. Defined Roles & Capabilities

| Role | Scope | Permitted Actions | Forbidden Actions |
|---|---|---|---|
| **Institution User** (`institution_user`) | Scoped to affiliated institution(s) | • View institution profile<br>• Submit FDRs & upload certificates<br>• View own FDR registry & status<br>• Submit renewals & replacements<br>• Request release/refund<br>• Read own notifications | • Read/modify other institutions' FDRs<br>• Approve own FDR verification<br>• Approve own release/refund<br>• Modify or delete audit logs<br>• Escalate privileges |
| **Scrutiny Officer** (`scrutiny_officer`) | System-wide / Assigned Region | • View verification workbench<br>• Review OCR extractions & discrepancies<br>• Record observations & scrutinize evidence<br>• Return submissions for correction<br>• Accept FDR or flag discrepancies<br>• Review release requests & make recommendations | • Directly approve financial releases<br>• Delete audit records<br>• Act as institution representative |
| **Approving Authority** (`approving_authority`) | System-wide / Executive | • Access approval queue<br>• Final sign-off on release/refund requests<br>• Review officer recommendations & justification<br>• Record rejection/approval with formal rationale | • Bypass scrutiny phase<br>• Modify raw FDR financial parameters directly |
| **Administrator** (`administrator`) | System-wide / Technical | • Manage institutions & user memberships<br>• Configure reminder thresholds & required docs<br>• Search and inspect tamper-evident audit logs<br>• Monitor system health and OCR pipeline | • Does *not* have financial release approval authority (Separation of Duties!) |

---

## 3. Row-Level Security (RLS) Implementation Strategy

### 3.1 Security Helper Functions
PostgreSQL helper functions defined with `SECURITY DEFINER` and fixed `search_path`:
- `current_user_role()`: Returns `system_role` of `auth.uid()`.
- `is_institution_member(target_inst_id UUID)`: Returns true if `auth.uid()` has an active membership in `target_inst_id`.
- `is_officer_or_admin()`: Returns true if the user is a `scrutiny_officer`, `approving_authority`, or `administrator`.

### 3.2 Audit Log Protection
- Standard application users have `SELECT` on audit events relevant to their scope.
- `UPDATE` and `DELETE` on `audit_events` are strictly denied to **all** roles (including administrators). Only trusted triggers or server-side functions insert audit events.
