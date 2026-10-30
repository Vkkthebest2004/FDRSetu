# 02 - Database Schema, Row Level Security & Supabase

## 1. Relational Database Schema Overview

The database is built on PostgreSQL 16 hosted via Supabase. It consists of **12 relational tables** governed by foreign keys, check constraints, indexes, and automated update triggers.

```
┌──────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│   auth.users     │◄──────┤    public.profiles     │◄──────┤institution_membership│
└──────────────────┘       └───────────┬────────────┘       └──────────┬───────────┘
                                       │                               │
                                       │ submitted_by                  │ user_id / inst_id
                                       ▼                               ▼
┌──────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│  fdr-documents   │       │   public.fdr_records   │──────►│ public.institutions  │
│ (Private Storage)│       └───────────┬────────────┘       └──────────────────────┘
└─────────┬────────┘                   │
          │ storage_path               │ fdr_id
          ▼                            ▼
┌──────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│ public.documents │◄──────┤  document_extractions  │       │  verification_cases  │
└──────────────────┘       └────────────────────────┘       └──────────────────────┘
          │                                                            │
          └────────────────────────────┬───────────────────────────────┘
                                       ▼
┌──────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│ public.renewals  │       │public.release_requests │       │ public.audit_events  │
└──────────────────┘       └────────────────────────┘       │    (Append-Only)     │
                                                            └──────────────────────┘
```

---

## 2. Table-by-Table Technical Specifications

### Table 1: `public.profiles`
Links directly to Supabase Auth (`auth.users.id`).
- `id` (UUID, PRIMARY KEY, REFERENCES `auth.users(id)` ON DELETE CASCADE)
- `email` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(255), NOT NULL)
- `phone` (VARCHAR(32), NULLABLE)
- `system_role` (VARCHAR(50), NOT NULL, CHECK in `'institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'`)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Table 2: `public.institutions`
Central registry of technical colleges, institutes, and polytechnics.
- `id` (UUID, PRIMARY KEY, gen_random_uuid())
- `aicte_id` (VARCHAR(64), UNIQUE, NOT NULL, e.g. `1-4567890123`)
- `name` (VARCHAR(255), NOT NULL)
- `institution_type` (VARCHAR(100), CHECK in `'Engineering & Technology', 'Management', 'Pharmacy', 'Architecture', 'Polytechnic', 'Applied Arts'`)
- `state`, `city`, `address` (VARCHAR/TEXT)
- `contact_email`, `contact_phone` (VARCHAR)
- `status` (VARCHAR(50), DEFAULT `'active'`, CHECK in `'active', 'suspended', 'derecognized'`)

### Table 3: `public.institution_memberships`
Maps authorized users to their affiliated technical institutions.
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, REFERENCES `public.profiles(id)` ON DELETE CASCADE)
- `institution_id` (UUID, REFERENCES `public.institutions(id)` ON DELETE CASCADE)
- `membership_role` (VARCHAR(50), CHECK in `'institution_admin', 'institution_staff'`)
- Constraint: `UNIQUE(user_id, institution_id)`

### Table 4: `public.fdr_records`
The central financial instrument ledger.
- `id` (UUID, PRIMARY KEY)
- `institution_id` (UUID, REFERENCES `public.institutions(id)` ON DELETE RESTRICT)
- `fdr_number` (VARCHAR(100), NOT NULL)
- `bank_name`, `branch_name` (VARCHAR(255), NOT NULL)
- `ifsc_code` (VARCHAR(16), NOT NULL)
- `amount` (NUMERIC(14, 2), NOT NULL, **CHECK `amount > 0`**)
- `currency` (VARCHAR(3), DEFAULT `'INR'`)
- `issue_date` (DATE, NOT NULL)
- `maturity_date` (DATE, NOT NULL, **CHECK `maturity_date > issue_date`**)
- `joint_holder_name` (VARCHAR(255), DEFAULT `'Regional Officer, AICTE'`)
- `lifecycle_status` (VARCHAR(50), CHECK in `'ACTIVE', 'MATURED', 'REPLACED', 'RELEASED'`)
- `review_status` (VARCHAR(50), CHECK in `'DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'NEEDS_CORRECTION', 'ACCEPTED', 'REJECTED'`)
- `verification_status` (VARCHAR(50), CHECK in `'PENDING', 'AUTO_CHECKED', 'INDEPENDENT_PENDING', 'VERIFIED', 'DISCREPANCY_FLAGGED', 'UNABLE_TO_VERIFY'`)
- `predecessor_fdr_id` (UUID, REFERENCES `public.fdr_records(id)`)
- `submitted_by` (UUID, REFERENCES `public.profiles(id)`)

### Table 5: `public.documents`
Metadata for uploaded scanned FDR receipts and bank confirmation letters.
- `id` (UUID, PRIMARY KEY)
- `institution_id` (UUID, REFERENCES `public.institutions(id)`)
- `fdr_id` (UUID, REFERENCES `public.fdr_records(id)`)
- `document_type` (VARCHAR(50), CHECK in `'FDR_RECEIPT', 'JOINT_CONFIRMATION_LETTER', 'BANK_STATEMENT', 'RELEASE_ORDER', 'REPLACEMENT_LETTER'`)
- `storage_path` (TEXT, NOT NULL)
- `file_name` (VARCHAR(255), NOT NULL)
- `file_size` (BIGINT, NOT NULL)
- `sha256_hash` (VARCHAR(64), NOT NULL)
- `processing_status` (VARCHAR(50), CHECK in `'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'`)
- `uploaded_by` (UUID, REFERENCES `public.profiles(id)`)

### Table 6: `public.document_extractions`
AI-extracted structured fields from the Python microservice.
- `id` (UUID, PRIMARY KEY)
- `document_id` (UUID, REFERENCES `public.documents(id)` ON DELETE CASCADE)
- `fdr_id` (UUID, REFERENCES `public.fdr_records(id)`)
- `extractor_name` (VARCHAR(100), DEFAULT `'tesseract_pymupdf_v1'`)
- `extracted_fields` (JSONB, NOT NULL, DEFAULT `'{}'::jsonb`)
- `confidence_scores` (JSONB, NOT NULL, DEFAULT `'{}'::jsonb`)
- `errors_warnings` (TEXT[], DEFAULT `ARRAY[]::TEXT[]`)
- `processing_status` (VARCHAR(50), DEFAULT `'COMPLETED'`)

### Table 7: `public.verification_cases`
Formal scrutiny sessions conducted by Regional Scrutiny Cells.
- `id` (UUID, PRIMARY KEY)
- `fdr_id` (UUID, REFERENCES `public.fdr_records(id)` ON DELETE CASCADE)
- `review_status` (VARCHAR(50), DEFAULT `'UNDER_SCRUTINY'`)
- `assigned_officer_id` (UUID, REFERENCES `public.profiles(id)`)
- `submitted_snapshot` (JSONB, NOT NULL)
- `extracted_snapshot` (JSONB)
- `discrepancy_summary` (JSONB)
- `independent_evidence_notes` (TEXT)
- `decision` (VARCHAR(50), CHECK in `'ACCEPT', 'REJECT', 'RETURN_FOR_CORRECTION', 'FLAG_DISCREPANCY'`)
- `decision_reason` (TEXT)
- `decision_at` (TIMESTAMPTZ)
- `officer_id` (UUID, REFERENCES `public.profiles(id)`)

### Table 8: `public.renewals`
Tracks replacement instruments linked to maturing predecessor FDRs.
- `id` (UUID, PRIMARY KEY)
- `original_fdr_id` (UUID, REFERENCES `public.fdr_records(id)` ON DELETE RESTRICT)
- `replacement_fdr_id` (UUID, REFERENCES `public.fdr_records(id)` ON DELETE RESTRICT)
- `reason` (TEXT, NOT NULL)
- `submission_date` (DATE, NOT NULL DEFAULT CURRENT_DATE)
- `status` (VARCHAR(50), DEFAULT `'ACTIVE'`, CHECK in `'ACTIVE', 'SUPERSEDED'`)
- Constraint: `UNIQUE(original_fdr_id, replacement_fdr_id)`

### Table 9: `public.release_requests`
Security deposit refund workflow upon institutional closure or tenor completion.
- `id` (UUID, PRIMARY KEY)
- `institution_id` (UUID, REFERENCES `public.institutions(id)`)
- `fdr_id` (UUID, REFERENCES `public.fdr_records(id)`)
- `request_type` (VARCHAR(50), CHECK in `'PROGRAM_CLOSURE', 'COURSE_DISCONTINUATION', 'DEPOSIT_PERIOD_EXPIRED', 'OTHER'`)
- `justification` (TEXT, NOT NULL)
- `workflow_status` (VARCHAR(50), CHECK in `'SUBMITTED', 'UNDER_REVIEW', 'AWAITING_CLARIFICATION', 'RECOMMENDED', 'APPROVED', 'REJECTED', 'RELEASE_RECORDED'`)
- `assigned_reviewer_id` (UUID, REFERENCES `public.profiles(id)`)
- `recommendation` (TEXT)
- `approval_decision` (VARCHAR(50), CHECK in `'APPROVED', 'REJECTED'`)
- `decision_reason` (TEXT)
- `approved_by` (UUID, REFERENCES `public.profiles(id)`)
- `approved_at` (TIMESTAMPTZ)
- `bank_release_ref` (VARCHAR(100))

### Table 10: `public.notifications`
Targeted alerts and 90/60/30-day maturity warning escalation items.
- `id` (UUID, PRIMARY KEY)
- `recipient_id` (UUID, REFERENCES `public.profiles(id)`)
- `institution_id` (UUID, REFERENCES `public.institutions(id)`)
- `fdr_id` (UUID, REFERENCES `public.fdr_records(id)`)
- `notification_type` (VARCHAR(50), CHECK in `'MATURITY_APPROACHING', 'CORRECTION_NEEDED', 'VERIFICATION_APPROVED', 'RELEASE_PROCESSED', 'RENEWAL_DUE'`)
- `title`, `message` (VARCHAR/TEXT)
- `read_status` (BOOLEAN, DEFAULT false)
- `delivery_status` (VARCHAR(50), DEFAULT `'DELIVERED'`)

### Table 11: `public.audit_events`
Cryptographic, append-only immutable audit trail.
- `id` (UUID, PRIMARY KEY)
- `actor_id` (UUID, REFERENCES `public.profiles(id)`)
- `actor_role` (VARCHAR(50), NOT NULL)
- `action` (VARCHAR(100), NOT NULL)
- `entity_type` (VARCHAR(50), NOT NULL)
- `entity_id` (UUID, NOT NULL)
- `correlation_id` (VARCHAR(100))
- `before_state`, `after_state` (JSONB)
- `outcome` (VARCHAR(20), CHECK in `'SUCCESS', 'FAILURE'`)
- `reason` (TEXT)
- `ip_address` (VARCHAR(64))
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### Table 12: `public.system_settings`
Global regulatory parameters.
- `key` (VARCHAR(100), PRIMARY KEY)
- `value` (JSONB, NOT NULL)
- `description` (TEXT)

---

## 3. Row Level Security (RLS) Implementation

All 12 tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` enabled.

### Security Definer Helper Functions
To avoid policy recursion and preserve execution performance:
```sql
-- Returns current user's role without recursive policy triggering
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT system_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Verifies if auth.uid() belongs to the target institution
CREATE OR REPLACE FUNCTION public.is_institution_member(target_inst_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.institution_memberships
        WHERE user_id = auth.uid() AND institution_id = target_inst_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Verifies if auth.uid() is an officer or administrator
CREATE OR REPLACE FUNCTION public.is_officer_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND system_role IN ('scrutiny_officer', 'approving_authority', 'administrator')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

### Append-Only Immutability on `audit_events`
```sql
-- Authorized actors can insert audit events
CREATE POLICY "Authorized actors insert audit events"
    ON public.audit_events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

-- Officers and Admins can view audit events; users view events for their entity
CREATE POLICY "Officers and Admins view audit events; Users view events for their entity"
    ON public.audit_events FOR SELECT
    USING (public.is_officer_or_admin() OR actor_id = auth.uid());

-- NO UPDATE OR DELETE POLICIES EXIST ON audit_events!
```

---

## 4. Private Storage Bucket (`fdr-documents`)

The storage bucket is strictly private and enforces institutional folder isolation:
- **Bucket ID**: `'fdr-documents'` (`public = false`, limit: 15MB, MIME: `application/pdf`, `image/png`, `image/jpeg`).
- **Path Structure**: `{institution_id}/{timestamp}_{filename}`
- **Storage Read Policy**:
  ```sql
  CREATE POLICY "Allow authenticated read for authorized institutions"
      ON storage.objects FOR SELECT TO authenticated
      USING (
          bucket_id = 'fdr-documents' AND (
              public.is_officer_or_admin() OR
              public.is_institution_member((storage.foldername(name))[1]::uuid)
          )
      );
  ```
- **Storage Upload Policy**:
  ```sql
  CREATE POLICY "Allow authenticated upload to institution folder"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
          bucket_id = 'fdr-documents' AND (
              public.is_institution_member((storage.foldername(name))[1]::uuid) OR
              public.is_officer_or_admin()
          )
      );
  ```
