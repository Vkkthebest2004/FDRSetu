-- ============================================================================
-- FDRSetu Modern Engineering Blueprint (Version 2.0)
-- Migration: 20261030000000_fdrsetu_v2_modernization.sql
-- Upgrades schema to modular standards, scoped role assignments,
-- optimistic concurrency, explicit audit rejection triggers,
-- evidence-first extraction, independent bank verification,
-- and transactional outbox event processing.
-- ============================================================================

-- Ensure required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. REGIONAL OFFICES JURISDICTION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial AICTE regional jurisdictions
INSERT INTO public.regional_offices (code, name) VALUES
    ('RO-NORTH', 'Northern Regional Office (Kanpur)'),
    ('RO-NW', 'North Western Regional Office (Chandigarh)'),
    ('RO-WEST', 'Western Regional Office (Mumbai)'),
    ('RO-SW', 'South Western Regional Office (Bengaluru)'),
    ('RO-SOUTH', 'Southern Regional Office (Chennai)'),
    ('RO-EAST', 'Eastern Regional Office (Kolkata)'),
    ('RO-CENTRAL', 'Central Regional Office (Bhopal)')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. ENHANCE INSTITUTIONS TABLE WITH ONBOARDING & REGIONAL SCOPE
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'institutions' AND column_name = 'regional_office_id') THEN
        ALTER TABLE public.institutions ADD COLUMN regional_office_id UUID REFERENCES public.regional_offices(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'institutions' AND column_name = 'onboarding_status') THEN
        ALTER TABLE public.institutions ADD COLUMN onboarding_status TEXT NOT NULL DEFAULT 'VERIFIED'
            CHECK (onboarding_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'));
    END IF;
END $$;

-- Link existing demo institutions to Northern Regional Office
UPDATE public.institutions 
SET regional_office_id = (SELECT id FROM public.regional_offices WHERE code = 'RO-NORTH' LIMIT 1)
WHERE regional_office_id IS NULL;

-- ----------------------------------------------------------------------------
-- 3. SCOPED ROLE ASSIGNMENTS TABLE (Replacing global system_role flags)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    role_code TEXT NOT NULL CHECK (role_code IN (
        'INSTITUTION_USER', 'SCRUTINY_OFFICER', 'APPROVING_AUTHORITY', 'SYSTEM_ADMIN', 'AUDITOR'
    )),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    regional_office_id UUID REFERENCES public.regional_offices(id) ON DELETE CASCADE,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    granted_by UUID REFERENCES public.profiles(id),
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (valid_until IS NULL OR valid_until > valid_from),
    CHECK (revoked_at IS NULL OR revoked_at >= valid_from)
);

CREATE INDEX IF NOT EXISTS idx_role_assignments_lookup 
    ON public.role_assignments(profile_id, role_code, valid_from, valid_until)
    WHERE revoked_at IS NULL;

-- ----------------------------------------------------------------------------
-- 4. ENHANCE FDR RECORDS WITH OPTIMISTIC CONCURRENCY VERSION & DETAILS
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'fdr_records' AND column_name = 'version') THEN
        ALTER TABLE public.fdr_records ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'fdr_records' AND column_name = 'holder_text') THEN
        ALTER TABLE public.fdr_records ADD COLUMN holder_text TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'fdr_records' AND column_name = 'lien_text') THEN
        ALTER TABLE public.fdr_records ADD COLUMN lien_text TEXT;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. ENHANCE DOCUMENTS TABLE WITH SCAN & CHECKSUM ATTRIBUTES
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'version') THEN
        ALTER TABLE public.documents ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'sha256_hex') THEN
        ALTER TABLE public.documents ADD COLUMN sha256_hex TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'detected_mime_type') THEN
        ALTER TABLE public.documents ADD COLUMN detected_mime_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'byte_size') THEN
        ALTER TABLE public.documents ADD COLUMN byte_size BIGINT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'malware_scan_status') THEN
        ALTER TABLE public.documents ADD COLUMN malware_scan_status TEXT NOT NULL DEFAULT 'CLEAN'
            CHECK (malware_scan_status IN ('PENDING', 'CLEAN', 'SUSPICIOUS', 'FAILED', 'NOT_AVAILABLE'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'supersedes_document_id') THEN
        ALTER TABLE public.documents ADD COLUMN supersedes_document_id UUID REFERENCES public.documents(id);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. EXTRACTED FIELDS TABLE (Field-level Evidence & Bounding Boxes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extraction_id UUID NOT NULL REFERENCES public.document_extractions(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    raw_value TEXT,
    normalized_value JSONB,
    confidence NUMERIC(5,2) CHECK (confidence BETWEEN 0 AND 100),
    page_number INTEGER,
    bbox JSONB, -- [ymin, xmin, ymax, xmax] normalized bounding coordinates
    validation_status TEXT NOT NULL DEFAULT 'NOT_CHECKED'
        CHECK (validation_status IN ('NOT_CHECKED', 'MATCH', 'MISMATCH', 'LOW_CONFIDENCE', 'NOT_FOUND')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (extraction_id, field_name)
);

CREATE INDEX IF NOT EXISTS idx_extracted_fields_extraction ON public.extracted_fields(extraction_id);

-- ----------------------------------------------------------------------------
-- 7. INDEPENDENT BANK VERIFICATION ATTEMPTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fdr_id UUID NOT NULL REFERENCES public.fdr_records(id) ON DELETE CASCADE,
    verification_case_id UUID REFERENCES public.verification_cases(id) ON DELETE SET NULL,
    method TEXT NOT NULL CHECK (method IN ('AUTHORIZED_API', 'OFFICIAL_EMAIL', 'BANK_LETTER', 'MANUAL_OTHER')),
    source_name TEXT NOT NULL,
    source_reference TEXT,
    result TEXT NOT NULL CHECK (result IN ('PENDING', 'CONFIRMED', 'NOT_CONFIRMED', 'UNAVAILABLE', 'REQUIRES_REVIEW')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ,
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    evidence_document_id UUID REFERENCES public.documents(id),
    notes TEXT,
    CHECK (responded_at IS NULL OR responded_at >= requested_at)
);

CREATE INDEX IF NOT EXISTS idx_verification_attempts_fdr ON public.verification_attempts(fdr_id);

-- ----------------------------------------------------------------------------
-- 8. TRANSACTIONAL WORKFLOW EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    from_state TEXT,
    to_state TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id),
    actor_role TEXT,
    reason TEXT,
    document_version INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_events_entity ON public.workflow_events(entity_type, entity_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. VERSIONED POLICY RULES REGISTRY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    applies_to JSONB NOT NULL DEFAULT '{}'::jsonb,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_title TEXT NOT NULL,
    source_url TEXT,
    source_clause TEXT,
    source_document_version TEXT,
    effective_from DATE NOT NULL,
    effective_until DATE,
    approval_reference TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (rule_code, version),
    CHECK (effective_until IS NULL OR effective_until >= effective_from)
);

-- Seed versioned AICTE policy rule for Security Deposit tenure
INSERT INTO public.policy_rules (
    rule_code, version, title, description,
    source_title, source_clause, effective_from, is_enabled,
    parameters
) VALUES (
    'AICTE-FDR-TENURE-STD', 1,
    'AICTE Security Deposit Standard Tenure Policy',
    'Mandatory minimum lock-in period for security deposits pledged to AICTE.',
    'AICTE Approval Process Handbook (APH)', 'Chapter I, Clause 1.4',
    '2024-01-01', true,
    '{"minimum_lock_in_years": 5, "min_days": 1825, "tolerance_days": 0}'::jsonb
)
ON CONFLICT (rule_code, version) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATION OUTBOX TABLE (Transactional & Idempotent)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS')),
    dedupe_key TEXT NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'RETRY', 'DEAD')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    last_error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_pending 
    ON public.notification_outbox(next_attempt_at) 
    WHERE status IN ('PENDING', 'RETRY');

-- ----------------------------------------------------------------------------
-- 11. HARDEN AUDIT IMMUTABILITY: EXPLICIT REJECTION TRIGGERS (Section 16.1)
-- ----------------------------------------------------------------------------

-- Function that explicitly rejects updates or deletes on audit_events
CREATE OR REPLACE FUNCTION public.reject_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    RAISE EXCEPTION 'audit_events is append-only: UPDATE and DELETE operations are strictly forbidden'
        USING ERRCODE = '55000';
END;
$$;

-- Drop prior rules if present to replace with explicit RAISE EXCEPTION triggers
DROP RULE IF EXISTS no_update_audit ON public.audit_events;
DROP RULE IF EXISTS no_delete_audit ON public.audit_events;

DROP TRIGGER IF EXISTS trg_audit_events_no_update ON public.audit_events;
CREATE TRIGGER trg_audit_events_no_update
    BEFORE UPDATE ON public.audit_events
    FOR EACH ROW EXECUTE FUNCTION public.reject_audit_mutation();

DROP TRIGGER IF EXISTS trg_audit_events_no_delete ON public.audit_events;
CREATE TRIGGER trg_audit_events_no_delete
    BEFORE DELETE ON public.audit_events
    FOR EACH ROW EXECUTE FUNCTION public.reject_audit_mutation();

-- Automated database trigger to capture FDR changes transactionally
CREATE OR REPLACE FUNCTION public.audit_fdr_record_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor UUID;
    v_institution_id UUID;
    v_entity_id UUID;
    v_before JSONB;
    v_after JSONB;
    v_action TEXT;
BEGIN
    v_actor := auth.uid();

    IF TG_OP = 'INSERT' THEN
        v_entity_id := NEW.id;
        v_institution_id := NEW.institution_id;
        v_before := null;
        v_after := to_jsonb(NEW);
        v_action := 'FDR_CREATED';
    ELSIF TG_OP = 'UPDATE' THEN
        v_entity_id := NEW.id;
        v_institution_id := NEW.institution_id;
        v_before := to_jsonb(OLD);
        v_after := to_jsonb(NEW);
        v_action := 'FDR_UPDATED';
    ELSE
        RAISE EXCEPTION 'Unexpected trigger operation: %', TG_OP;
    END IF;

    INSERT INTO public.audit_events (
        actor_id, action, entity_type, entity_id, institution_id,
        before_data, after_data
    ) VALUES (
        v_actor, v_action, 'fdr_records', v_entity_id, v_institution_id,
        v_before, v_after
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fdr_records_audit_change ON public.fdr_records;
CREATE TRIGGER trg_fdr_records_audit_change
    AFTER INSERT OR UPDATE ON public.fdr_records
    FOR EACH ROW EXECUTE FUNCTION public.audit_fdr_record_change();

-- ----------------------------------------------------------------------------
-- 12. SCOPED AUTHORIZATION & STORAGE HELPERS (Section 16.2 - 16.5)
-- ----------------------------------------------------------------------------

-- Scoped regional role validator
CREATE OR REPLACE FUNCTION public.has_active_region_role(
    p_role_code TEXT,
    p_region_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.role_assignments ra
        JOIN public.profiles p ON p.id = ra.profile_id
        WHERE ra.profile_id = auth.uid()
          AND ra.role_code = p_role_code
          AND ra.regional_office_id = p_region_id
          AND ra.revoked_at IS NULL
          AND ra.valid_from <= now()
          AND (ra.valid_until IS NULL OR ra.valid_until > now())
          AND p.is_active = true
    );
$$;

-- Record-scoped FDR access evaluation
CREATE OR REPLACE FUNCTION public.can_read_fdr(p_fdr_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_institution_id UUID;
    v_region_id UUID;
BEGIN
    SELECT f.institution_id, i.regional_office_id
      INTO v_institution_id, v_region_id
    FROM public.fdr_records f
    JOIN public.institutions i ON i.id = f.institution_id
    WHERE f.id = p_fdr_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Institution member access
    IF public.is_institution_member(v_institution_id) THEN
        RETURN true;
    END IF;

    -- Official access (Scoped by regional office or central admin)
    IF public.is_officer_or_admin() THEN
        RETURN true;
    END IF;

    IF v_region_id IS NOT NULL AND (
        public.has_active_region_role('SCRUTINY_OFFICER', v_region_id) OR
        public.has_active_region_role('APPROVING_AUTHORITY', v_region_id) OR
        public.has_active_region_role('AUDITOR', v_region_id)
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

-- Storage path authorization helper
CREATE OR REPLACE FUNCTION public.can_access_fdr_storage_path(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_parts TEXT[];
    v_institution_id UUID;
    v_fdr_id UUID;
BEGIN
    v_parts := storage.foldername(p_name);

    IF array_length(v_parts, 1) < 2 THEN
        RETURN false;
    END IF;

    -- Validate UUID format
    IF v_parts[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       OR v_parts[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN false;
    END IF;

    v_institution_id := v_parts[1]::uuid;
    v_fdr_id := v_parts[2]::uuid;

    RETURN EXISTS (
        SELECT 1
        FROM public.fdr_records f
        WHERE f.id = v_fdr_id
          AND f.institution_id = v_institution_id
          AND public.can_read_fdr(f.id)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- ----------------------------------------------------------------------------
-- 13. TRANSACTIONAL WORKFLOW RPCS WITH OPTIMISTIC CONCURRENCY (Section 16.6 - 16.7)
-- ----------------------------------------------------------------------------

-- Transactional FDR submission function with version check & clean scan requirement
CREATE OR REPLACE FUNCTION public.submit_fdr(
    p_fdr_id UUID,
    p_expected_version INTEGER
)
RETURNS public.fdr_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_fdr public.fdr_records;
    v_actor UUID := auth.uid();
    v_from_state TEXT;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING errcode = '28000';
    END IF;

    SELECT * INTO v_fdr
    FROM public.fdr_records
    WHERE id = p_fdr_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'FDR record not found' USING errcode = 'P0002';
    END IF;

    IF NOT public.is_institution_member(v_fdr.institution_id) THEN
        RAISE EXCEPTION 'Not authorized for this institution' USING errcode = '42501';
    END IF;

    -- Optimistic concurrency conflict check
    IF v_fdr.version <> p_expected_version THEN
        RAISE EXCEPTION 'Record changed concurrently (expected %, found %); refresh and retry', 
            p_expected_version, v_fdr.version 
            USING errcode = '40001';
    END IF;

    IF v_fdr.review_status NOT IN ('DRAFT', 'NEEDS_CORRECTION') THEN
        RAISE EXCEPTION 'Invalid state transition from %', v_fdr.review_status USING errcode = '22023';
    END IF;
    v_from_state := v_fdr.review_status;

    -- Document validation check
    IF NOT EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.fdr_id = p_fdr_id
          AND d.malware_scan_status = 'CLEAN'
    ) THEN
        RAISE EXCEPTION 'A verified clean FDR receipt document is required before submission' USING errcode = '23514';
    END IF;

    -- Atomic transition
    UPDATE public.fdr_records
    SET review_status = 'SUBMITTED',
        submitted_at = now(),
        version = version + 1,
        updated_at = now()
    WHERE id = p_fdr_id
    RETURNING * INTO v_fdr;

    -- Transactional workflow event
    INSERT INTO public.workflow_events (
        entity_type, entity_id, from_state, to_state,
        actor_id, actor_role, reason, document_version
    ) VALUES (
        'fdr_records', p_fdr_id, v_from_state, 'SUBMITTED',
        v_actor, 'INSTITUTION_USER', 'Institution submission', v_fdr.version
    );

    RETURN v_fdr;
END;
$$;

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY ON NEW V2 TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.regional_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view regional offices"
    ON public.regional_offices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users read own role assignments or admins read all"
    ON public.role_assignments FOR SELECT TO authenticated
    USING (profile_id = auth.uid() OR public.is_officer_or_admin());

CREATE POLICY "Read extracted fields for authorized FDRs"
    ON public.extracted_fields FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.document_extractions de
        JOIN public.documents d ON d.id = de.document_id
        WHERE de.id = extracted_fields.extraction_id
          AND public.can_read_fdr(d.fdr_id)
    ));

CREATE POLICY "Read verification attempts for authorized FDRs"
    ON public.verification_attempts FOR SELECT TO authenticated
    USING (public.can_read_fdr(fdr_id));

CREATE POLICY "Read workflow events for authorized entities"
    ON public.workflow_events FOR SELECT TO authenticated
    USING (public.is_officer_or_admin() OR actor_id = auth.uid());

CREATE POLICY "All authenticated users read policy rules"
    ON public.policy_rules FOR SELECT TO authenticated USING (is_enabled = true);

CREATE POLICY "Users read own outbox notifications"
    ON public.notification_outbox FOR SELECT TO authenticated
    USING (recipient_id = auth.uid());
