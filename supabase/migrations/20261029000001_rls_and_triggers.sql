-- ============================================================================
-- AICTE FDR Portal: Row Level Security & Access Control Policies
-- Migration: 20261029000001_rls_and_triggers.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to obtain current user's system role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT system_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to verify if auth.uid() is an active member of the given institution
CREATE OR REPLACE FUNCTION public.is_institution_member(target_inst_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.institution_memberships
        WHERE user_id = auth.uid() AND institution_id = target_inst_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to verify if auth.uid() has official scrutiny or administrative role
CREATE OR REPLACE FUNCTION public.is_officer_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND system_role IN ('scrutiny_officer', 'approving_authority', 'administrator')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to verify if auth.uid() is specifically an approving authority or admin
CREATE OR REPLACE FUNCTION public.is_approver_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND system_role IN ('approving_authority', 'administrator')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fdr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile or officers/admins can view all"
    ON public.profiles FOR SELECT
    USING (id = auth.uid() OR public.is_officer_or_admin());

CREATE POLICY "Users can update own non-role fields"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND 
        system_role = (SELECT system_role FROM public.profiles WHERE id = auth.uid()) -- Prevent self privilege-escalation
    );

CREATE POLICY "Admins have full profile management"
    ON public.profiles FOR ALL
    USING (public.get_current_user_role() = 'administrator');

-- ----------------------------------------------------------------------------
-- 4. INSTITUTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Institution members can view own institution"
    ON public.institutions FOR SELECT
    USING (public.is_institution_member(id) OR public.is_officer_or_admin());

CREATE POLICY "Admins can create and update institutions"
    ON public.institutions FOR ALL
    USING (public.get_current_user_role() = 'administrator');

-- ----------------------------------------------------------------------------
-- 5. INSTITUTION MEMBERSHIPS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own memberships or officers can view"
    ON public.institution_memberships FOR SELECT
    USING (user_id = auth.uid() OR public.is_officer_or_admin());

CREATE POLICY "Admins manage memberships"
    ON public.institution_memberships FOR ALL
    USING (public.get_current_user_role() = 'administrator');

-- ----------------------------------------------------------------------------
-- 6. FDR RECORDS POLICIES (Institution isolation + Officer access)
-- ----------------------------------------------------------------------------
CREATE POLICY "Institution users view own FDRs; officers view all"
    ON public.fdr_records FOR SELECT
    USING (public.is_institution_member(institution_id) OR public.is_officer_or_admin());

CREATE POLICY "Institution users can submit FDR for their affiliated institution"
    ON public.fdr_records FOR INSERT
    WITH CHECK (
        public.is_institution_member(institution_id) AND
        submitted_by = auth.uid()
    );

CREATE POLICY "Institution users can edit draft/correction FDRs of their institution"
    ON public.fdr_records FOR UPDATE
    USING (
        public.is_institution_member(institution_id) AND
        review_status IN ('DRAFT', 'NEEDS_CORRECTION')
    )
    WITH CHECK (
        public.is_institution_member(institution_id) AND
        review_status IN ('DRAFT', 'SUBMITTED')
    );

CREATE POLICY "Officers can update review and verification statuses"
    ON public.fdr_records FOR UPDATE
    USING (public.is_officer_or_admin());

-- ----------------------------------------------------------------------------
-- 7. DOCUMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view documents of their institution; officers view all"
    ON public.documents FOR SELECT
    USING (public.is_institution_member(institution_id) OR public.is_officer_or_admin());

CREATE POLICY "Users can insert documents for their institution"
    ON public.documents FOR INSERT
    WITH CHECK (
        public.is_institution_member(institution_id) AND
        uploaded_by = auth.uid()
    );

-- ----------------------------------------------------------------------------
-- 8. DOCUMENT EXTRACTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view extractions for their institution's docs; officers view all"
    ON public.document_extractions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = document_id AND (public.is_institution_member(d.institution_id) OR public.is_officer_or_admin())
        )
    );

CREATE POLICY "Internal service or admins insert extractions"
    ON public.document_extractions FOR INSERT
    WITH CHECK (public.is_officer_or_admin() OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 9. VERIFICATION CASES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Institution users view their cases; officers view all"
    ON public.verification_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fdr_records f
            WHERE f.id = fdr_id AND (public.is_institution_member(f.institution_id) OR public.is_officer_or_admin())
        )
    );

CREATE POLICY "Officers can create and update verification cases"
    ON public.verification_cases FOR ALL
    USING (public.is_officer_or_admin());

-- ----------------------------------------------------------------------------
-- 10. RENEWALS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view renewals of their institution; officers view all"
    ON public.renewals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fdr_records f
            WHERE f.id = original_fdr_id AND (public.is_institution_member(f.institution_id) OR public.is_officer_or_admin())
        )
    );

CREATE POLICY "Institution users can submit renewal linkage"
    ON public.renewals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.fdr_records f
            WHERE f.id = original_fdr_id AND public.is_institution_member(f.institution_id)
        )
    );

-- ----------------------------------------------------------------------------
-- 11. RELEASE / REFUND REQUESTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Institution users view their release requests; officers view all"
    ON public.release_requests FOR SELECT
    USING (public.is_institution_member(institution_id) OR public.is_officer_or_admin());

CREATE POLICY "Institution users create release requests for their institution"
    ON public.release_requests FOR INSERT
    WITH CHECK (public.is_institution_member(institution_id));

CREATE POLICY "Officers can review and update release requests"
    ON public.release_requests FOR UPDATE
    USING (public.is_officer_or_admin());

-- ----------------------------------------------------------------------------
-- 12. NOTIFICATIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view only their own notifications"
    ON public.notifications FOR SELECT
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
    ON public.notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "System and officers can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_officer_or_admin() OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 13. AUDIT EVENTS POLICIES (Strictly Append-Only)
-- ----------------------------------------------------------------------------
CREATE POLICY "Officers and Admins view audit events; Users view events for their entity"
    ON public.audit_events FOR SELECT
    USING (
        public.is_officer_or_admin() OR
        actor_id = auth.uid()
    );

CREATE POLICY "Authorized actors insert audit events"
    ON public.audit_events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

-- Explicitly DO NOT create UPDATE or DELETE policies on audit_events to guarantee immutability!

-- ----------------------------------------------------------------------------
-- 14. SYSTEM SETTINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "All authenticated users can read system settings"
    ON public.system_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify system settings"
    ON public.system_settings FOR ALL
    USING (public.get_current_user_role() = 'administrator');

-- ----------------------------------------------------------------------------
-- 15. PRIVATE STORAGE BUCKET CREATION & POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fdr-documents',
    'fdr-documents',
    false, -- Strictly private bucket!
    15728640, -- 15MB limit
    ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 15728640;

-- Storage Policy: Users can read files belonging to their institution
CREATE POLICY "Allow authenticated read for authorized institutions"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'fdr-documents' AND (
            public.is_officer_or_admin() OR
            public.is_institution_member((storage.foldername(name))[1]::uuid)
        )
    );

-- Storage Policy: Users can upload files to their institution folder
CREATE POLICY "Allow authenticated upload to institution folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'fdr-documents' AND (
            public.is_institution_member((storage.foldername(name))[1]::uuid) OR
            public.is_officer_or_admin()
        )
    );

