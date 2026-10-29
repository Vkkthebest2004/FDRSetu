-- ============================================================================
-- AICTE FDR Portal: Initial Schema Migration
-- Migration: 20261029000000_init_aicte_schema.sql
-- ============================================================================

-- Ensure uuid-ossp or pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    system_role VARCHAR(50) NOT NULL DEFAULT 'institution_user' CHECK (
        system_role IN ('institution_user', 'scrutiny_officer', 'approving_authority', 'administrator')
    ),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_system_role ON public.profiles(system_role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. INSTITUTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aicte_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(100) NOT NULL CHECK (
        institution_type IN ('Engineering & Technology', 'Management', 'Pharmacy', 'Architecture', 'Polytechnic', 'Applied Arts')
    ),
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'derecognized')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_aicte_id ON public.institutions(aicte_id);
CREATE INDEX IF NOT EXISTS idx_institutions_state ON public.institutions(state);

-- ----------------------------------------------------------------------------
-- 3. INSTITUTION MEMBERSHIPS TABLE (RBAC User-to-Institution mapping)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    membership_role VARCHAR(50) NOT NULL DEFAULT 'institution_admin' CHECK (
        membership_role IN ('institution_admin', 'institution_staff')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, institution_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.institution_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_inst ON public.institution_memberships(institution_id);

-- ----------------------------------------------------------------------------
-- 4. FDR RECORDS (Financial security deposit instruments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fdr_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
    fdr_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(16) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    issue_date DATE NOT NULL,
    maturity_date DATE NOT NULL CHECK (maturity_date > issue_date),
    joint_holder_name VARCHAR(255) NOT NULL DEFAULT 'Regional Officer, AICTE',
    
    -- Separate status dimensions as required by regulatory compliance
    lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (
        lifecycle_status IN ('ACTIVE', 'MATURED', 'REPLACED', 'RELEASED')
    ),
    review_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (
        review_status IN ('DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'NEEDS_CORRECTION', 'ACCEPTED', 'REJECTED')
    ),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (
        verification_status IN ('PENDING', 'AUTO_CHECKED', 'INDEPENDENT_PENDING', 'VERIFIED', 'DISCREPANCY_FLAGGED', 'UNABLE_TO_VERIFY')
    ),
    
    predecessor_fdr_id UUID REFERENCES public.fdr_records(id) ON DELETE SET NULL,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fdr_institution ON public.fdr_records(institution_id);
CREATE INDEX IF NOT EXISTS idx_fdr_number ON public.fdr_records(fdr_number);
CREATE INDEX IF NOT EXISTS idx_fdr_maturity_date ON public.fdr_records(maturity_date);
CREATE INDEX IF NOT EXISTS idx_fdr_lifecycle_status ON public.fdr_records(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_fdr_review_status ON public.fdr_records(review_status);

-- ----------------------------------------------------------------------------
-- 5. DOCUMENTS (Uploaded scanned certificates & instruments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    fdr_id UUID REFERENCES public.fdr_records(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL CHECK (
        document_type IN ('FDR_RECEIPT', 'JOINT_CONFIRMATION_LETTER', 'BANK_STATEMENT', 'RELEASE_ORDER', 'REPLACEMENT_LETTER')
    ),
    storage_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    document_version INT NOT NULL DEFAULT 1,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (
        processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
    ),
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_inst ON public.documents(institution_id);
CREATE INDEX IF NOT EXISTS idx_documents_fdr ON public.documents(fdr_id);

-- ----------------------------------------------------------------------------
-- 6. DOCUMENT EXTRACTIONS (Python OCR & AI Results)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    fdr_id UUID REFERENCES public.fdr_records(id) ON DELETE SET NULL,
    extractor_name VARCHAR(100) NOT NULL DEFAULT 'tesseract_pymupdf_v1',
    extractor_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    extracted_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    page_references JSONB DEFAULT '{}'::jsonb,
    bounding_boxes JSONB DEFAULT '{}'::jsonb,
    errors_warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    processing_status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extractions_doc ON public.document_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_extractions_fdr ON public.document_extractions(fdr_id);

-- ----------------------------------------------------------------------------
-- 7. VERIFICATION CASES (Officer scrutiny session & discrepancies)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fdr_id UUID NOT NULL REFERENCES public.fdr_records(id) ON DELETE CASCADE,
    review_status VARCHAR(50) NOT NULL DEFAULT 'UNDER_SCRUTINY',
    assigned_officer_id UUID REFERENCES public.profiles(id),
    submitted_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    extracted_snapshot JSONB DEFAULT '{}'::jsonb,
    discrepancy_summary JSONB DEFAULT '[]'::jsonb,
    independent_evidence_notes TEXT,
    observations TEXT,
    decision VARCHAR(50) CHECK (
        decision IN ('ACCEPT', 'REJECT', 'RETURN_FOR_CORRECTION', 'FLAG_DISCREPANCY')
    ),
    decision_reason TEXT,
    decision_at TIMESTAMPTZ,
    officer_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_fdr ON public.verification_cases(fdr_id);
CREATE INDEX IF NOT EXISTS idx_cases_officer ON public.verification_cases(officer_id);

-- ----------------------------------------------------------------------------
-- 8. RENEWALS TABLE (Explicit link between predecessor and successor FDRs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_fdr_id UUID NOT NULL REFERENCES public.fdr_records(id) ON DELETE RESTRICT,
    replacement_fdr_id UUID NOT NULL REFERENCES public.fdr_records(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUPERSEDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(original_fdr_id, replacement_fdr_id)
);

CREATE INDEX IF NOT EXISTS idx_renewals_original ON public.renewals(original_fdr_id);
CREATE INDEX IF NOT EXISTS idx_renewals_replacement ON public.renewals(replacement_fdr_id);

-- ----------------------------------------------------------------------------
-- 9. RELEASE / REFUND REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.release_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
    fdr_id UUID NOT NULL REFERENCES public.fdr_records(id) ON DELETE RESTRICT,
    request_type VARCHAR(50) NOT NULL CHECK (
        request_type IN ('PROGRAM_CLOSURE', 'COURSE_DISCONTINUATION', 'DEPOSIT_PERIOD_EXPIRED', 'OTHER')
    ),
    justification TEXT NOT NULL,
    workflow_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (
        workflow_status IN ('SUBMITTED', 'UNDER_REVIEW', 'AWAITING_CLARIFICATION', 'RECOMMENDED', 'APPROVED', 'REJECTED', 'RELEASE_RECORDED')
    ),
    assigned_reviewer_id UUID REFERENCES public.profiles(id),
    recommendation TEXT,
    approval_decision VARCHAR(50) CHECK (approval_decision IN ('APPROVED', 'REJECTED')),
    decision_reason TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    bank_release_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_release_inst ON public.release_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_release_fdr ON public.release_requests(fdr_id);
CREATE INDEX IF NOT EXISTS idx_release_status ON public.release_requests(workflow_status);

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    fdr_id UUID REFERENCES public.fdr_records(id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (
        notification_type IN ('MATURITY_APPROACHING', 'CORRECTION_NEEDED', 'VERIFICATION_APPROVED', 'RELEASE_PROCESSED', 'RENEWAL_DUE')
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'DELIVERED' CHECK (delivery_status IN ('PENDING', 'DELIVERED', 'FAILED')),
    attempt_count INT NOT NULL DEFAULT 1,
    read_status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read_status);

-- ----------------------------------------------------------------------------
-- 11. AUDIT EVENTS (Tamper-evident append-only ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    correlation_id VARCHAR(100),
    before_state JSONB,
    after_state JSONB,
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE')),
    reason TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_events(created_at DESC);

-- ----------------------------------------------------------------------------
-- 12. SYSTEM SETTINGS & CONFIGURATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('maturity_warning_intervals', '{"days": [90, 60, 30, 15]}'::jsonb, 'Advance warning intervals in days for upcoming FDR maturities'),
    ('max_upload_size_mb', '{"size_mb": 15}'::jsonb, 'Maximum allowed document upload size in megabytes'),
    ('allowed_mime_types', '{"types": ["application/pdf", "image/png", "image/jpeg"]}'::jsonb, 'Allowed file mime types for FDR uploads')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. AUTOMATED UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_fdr_records_updated_at BEFORE UPDATE ON public.fdr_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_verification_cases_updated_at BEFORE UPDATE ON public.verification_cases FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_release_requests_updated_at BEFORE UPDATE ON public.release_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

