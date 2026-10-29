-- ============================================================================
-- AICTE FDR Portal: Synthetic Seed Data
-- Database Seed: supabase/seed.sql
-- ============================================================================

-- Fix UUIDs for predictable testing and relations
DO $$
DECLARE
    -- User Profile UUIDs
    u_inst1 UUID := '11111111-1111-4111-8111-111111111111';
    u_inst2 UUID := '22222222-2222-4222-8222-222222222222';
    u_officer UUID := '33333333-3333-4333-8333-333333333333';
    u_approver UUID := '44444444-4444-4444-8444-444444444444';
    u_admin UUID := '55555555-5555-4555-8555-555555555555';

    -- Institution UUIDs
    inst_delhi UUID := 'a1111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    inst_mumbai UUID := 'b2222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    inst_bangalore UUID := 'c3333333-cccc-4ccc-8ccc-cccccccccccc';
    inst_hyderabad UUID := 'd4444444-dddd-4ddd-8ddd-dddddddddddd';

    -- FDR UUIDs
    fdr_1 UUID := 'f1111111-0000-4000-8000-000000000001';
    fdr_2 UUID := 'f2222222-0000-4000-8000-000000000002';
    fdr_3 UUID := 'f3333333-0000-4000-8000-000000000003';
    fdr_4 UUID := 'f4444444-0000-4000-8000-000000000004';
    fdr_5_old UUID := 'f5555555-0000-4000-8000-000000000005';
    fdr_5_new UUID := 'f5555555-0000-4000-8000-000000000006';
    fdr_6 UUID := 'f6666666-0000-4000-8000-000000000007';

    -- Document UUIDs
    doc_1 UUID := 'd1111111-0000-4000-8000-000000000001';
    doc_2 UUID := 'd2222222-0000-4000-8000-000000000002';
    doc_3 UUID := 'd3333333-0000-4000-8000-000000000003';

BEGIN

    -- 1. Create auth.users entries if not existing (for local/testing Supabase)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES 
        (u_inst1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'registrar@dit.edu.in', crypt('Password@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Rajesh Sharma"}', now(), now()),
        (u_inst2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dean@mumbaipoly.edu.in', crypt('Password@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Prof. Anita Rao"}', now(), now()),
        (u_officer, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'officer@aicte-india.org', crypt('Password@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sunil Kumar (Scrutiny Officer)"}', now(), now()),
        (u_approver, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'approver@aicte-india.org', crypt('Password@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. V. K. Adiseshiah (Approving Authority)"}', now(), now()),
        (u_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@aicte-india.org', crypt('Password@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sanjay Verma (Administrator)"}', now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- 2. Populate Profiles
    INSERT INTO public.profiles (id, email, full_name, phone, system_role, is_active)
    VALUES
        (u_inst1, 'registrar@dit.edu.in', 'Dr. Rajesh Sharma', '+91 98112 34567', 'institution_user', true),
        (u_inst2, 'dean@mumbaipoly.edu.in', 'Prof. Anita Rao', '+91 98223 45678', 'institution_user', true),
        (u_officer, 'officer@aicte-india.org', 'Sunil Kumar', '+91 98334 56789', 'scrutiny_officer', true),
        (u_approver, 'approver@aicte-india.org', 'Dr. V. K. Adiseshiah', '+91 98445 67890', 'approving_authority', true),
        (u_admin, 'admin@aicte-india.org', 'Sanjay Verma', '+91 98556 78901', 'administrator', true)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        system_role = EXCLUDED.system_role;

    -- 3. Populate Institutions
    INSERT INTO public.institutions (id, aicte_id, name, institution_type, state, city, address, contact_email, contact_phone, status)
    VALUES
        (inst_delhi, '1-109283741', 'Delhi Institute of Advanced Technology', 'Engineering & Technology', 'Delhi', 'New Delhi', 'Plot 4, Institutional Area, Sector 9, Dwarka, New Delhi 110077', 'info@dit.edu.in', '011-28082001', 'active'),
        (inst_mumbai, '1-209384752', 'Mumbai Central Polytechnic Institute', 'Polytechnic', 'Maharashtra', 'Mumbai', 'Dr. D.N. Road, Fort, Mumbai, Maharashtra 400001', 'contact@mumbaipoly.edu.in', '022-22620123', 'active'),
        (inst_bangalore, '1-309485763', 'Bangalore College of Pharmaceutical Sciences', 'Pharmacy', 'Karnataka', 'Bengaluru', 'Ring Road, Rajajinagar, Bengaluru 560010', 'admin@bcps.edu.in', '080-23456789', 'active'),
        (inst_hyderabad, '1-409586774', 'Hyderabad National Institute of Management', 'Management', 'Telangana', 'Hyderabad', 'Gachibowli Financial District, Hyderabad 500032', 'admissions@hnim.edu.in', '040-23001234', 'active')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- 4. Memberships
    INSERT INTO public.institution_memberships (user_id, institution_id, membership_role)
    VALUES
        (u_inst1, inst_delhi, 'institution_admin'),
        (u_inst2, inst_mumbai, 'institution_admin')
    ON CONFLICT (user_id, institution_id) DO NOTHING;

    -- 5. FDR Records
    -- FDR 1: Active, Verified, SBI
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status, submitted_by
    ) VALUES (
        fdr_1, inst_delhi, 'SBI-DEL-FDR-2023-8891', 'State Bank of India', 'Dwarka Sector 10 Branch', 'SBIN0011566',
        1500000.00, 'INR', CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE + INTERVAL '4 years',
        'Regional Officer, AICTE (North)', 'ACTIVE', 'ACCEPTED', 'VERIFIED', u_inst1
    ) ON CONFLICT (id) DO NOTHING;

    -- FDR 2: Active, Maturing in 25 days (Approaching maturity alert!)
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status, submitted_by
    ) VALUES (
        fdr_2, inst_delhi, 'PNB-DEL-FDR-2021-4412', 'Punjab National Bank', 'Connaught Place Branch', 'PUNB0001900',
        2500000.00, 'INR', CURRENT_DATE - INTERVAL '5 years' + INTERVAL '25 days', CURRENT_DATE + INTERVAL '25 days',
        'Regional Officer, AICTE (North)', 'ACTIVE', 'ACCEPTED', 'VERIFIED', u_inst1
    ) ON CONFLICT (id) DO NOTHING;

    -- FDR 3: Discrepancy Flagged (Amount entered ₹ 10,00,000 but receipt displays ₹ 8,00,000)
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status, submitted_by
    ) VALUES (
        fdr_3, inst_delhi, 'HDFC-DEL-FDR-2024-1029', 'HDFC Bank', 'Janakpuri District Center', 'HDFC0000249',
        1000000.00, 'INR', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '57 months',
        'Regional Officer, AICTE (North)', 'ACTIVE', 'NEEDS_CORRECTION', 'DISCREPANCY_FLAGGED', u_inst1
    ) ON CONFLICT (id) DO NOTHING;

    -- FDR 4: Under Scrutiny, Canara Bank (Mumbai Poly)
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status, submitted_by
    ) VALUES (
        fdr_4, inst_mumbai, 'CNRB-MUM-FDR-2024-5519', 'Canara Bank', 'Fort Mumbai Branch', 'CNRB0000102',
        3500000.00, 'INR', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '59 months',
        'Regional Officer, AICTE (West)', 'ACTIVE', 'UNDER_SCRUTINY', 'AUTO_CHECKED', u_inst2
    ) ON CONFLICT (id) DO NOTHING;

    -- FDR 5 Old (Matured & Replaced)
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status, submitted_by
    ) VALUES (
        fdr_5_old, inst_bangalore, 'BOB-BLR-FDR-2019-3321', 'Bank of Baroda', 'Rajajinagar Branch', 'BARB0RAJAJI',
        2000000.00, 'INR', CURRENT_DATE - INTERVAL '5 years' - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months',
        'Regional Officer, AICTE (South)', 'REPLACED', 'ACCEPTED', 'VERIFIED', u_inst1
    ) ON CONFLICT (id) DO NOTHING;

    -- FDR 5 New (Active Replacement Instrument)
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status,
        predecessor_fdr_id, submitted_by
    ) VALUES (
        fdr_5_new, inst_bangalore, 'BOB-BLR-FDR-2024-7712', 'Bank of Baroda', 'Rajajinagar Branch', 'BARB0RAJAJI',
        2000000.00, 'INR', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '58 months',
        'Regional Officer, AICTE (South)', 'ACTIVE', 'ACCEPTED', 'VERIFIED',
        fdr_5_old, u_inst1
    ) ON CONFLICT (id) DO NOTHING;

    -- FDR 6: Release Requested (Hyderabad Mgmt)
    INSERT INTO public.fdr_records (
        id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, currency,
        issue_date, maturity_date, joint_holder_name, lifecycle_status, review_status, verification_status, submitted_by
    ) VALUES (
        fdr_6, inst_hyderabad, 'ICIC-HYD-FDR-2018-9124', 'ICICI Bank', 'Gachibowli Branch', 'ICIC0000048',
        1200000.00, 'INR', CURRENT_DATE - INTERVAL '8 years', CURRENT_DATE - INTERVAL '3 years',
        'Regional Officer, AICTE (South Central)', 'ACTIVE', 'ACCEPTED', 'VERIFIED', u_inst1
    ) ON CONFLICT (id) DO NOTHING;

    -- 6. Documents Metadata
    INSERT INTO public.documents (
        id, institution_id, fdr_id, document_type, storage_path, file_name, mime_type, file_size, sha256_hash, processing_status, uploaded_by
    ) VALUES 
        (doc_1, inst_delhi, fdr_1, 'FDR_RECEIPT', 'a1111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa/sbi_receipt_8891.pdf', 'sbi_receipt_8891.pdf', 'application/pdf', 241500, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'COMPLETED', u_inst1),
        (doc_2, inst_delhi, fdr_2, 'FDR_RECEIPT', 'a1111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa/pnb_receipt_4412.pdf', 'pnb_receipt_4412.pdf', 'application/pdf', 189200, 'a2c4e68013579bdf02468ace13579bdf02468ace13579bdf02468ace13579bdf', 'COMPLETED', u_inst1),
        (doc_3, inst_delhi, fdr_3, 'FDR_RECEIPT', 'a1111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa/hdfc_receipt_1029.pdf', 'hdfc_receipt_1029.pdf', 'application/pdf', 312400, 'b3d5f7912468ace013579bdf02468ace13579bdf02468ace13579bdf02468ace', 'COMPLETED', u_inst1)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Document Extractions (OCR Data)
    INSERT INTO public.document_extractions (
        id, document_id, fdr_id, extractor_name, extractor_version, extracted_fields, confidence_scores, processing_status
    ) VALUES (
        'e1111111-0000-4000-8000-000000000001', doc_1, fdr_1, 'tesseract_pymupdf_v1', '1.0.0',
        '{"fdr_number": "SBI-DEL-FDR-2023-8891", "bank_name": "State Bank of India", "amount": 1500000.00, "ifsc_code": "SBIN0011566", "joint_holder": "Regional Officer, AICTE"}'::jsonb,
        '{"fdr_number": 0.99, "bank_name": 0.98, "amount": 0.99, "ifsc_code": 0.97, "overall": 0.98}'::jsonb,
        'COMPLETED'
    ) ON CONFLICT (id) DO NOTHING;

    -- Extraction for FDR 3 (with mismatch on amount)
    INSERT INTO public.document_extractions (
        id, document_id, fdr_id, extractor_name, extractor_version, extracted_fields, confidence_scores, errors_warnings, processing_status
    ) VALUES (
        'e3333333-0000-4000-8000-000000000003', doc_3, fdr_3, 'tesseract_pymupdf_v1', '1.0.0',
        '{"fdr_number": "HDFC-DEL-FDR-2024-1029", "bank_name": "HDFC Bank", "amount": 800000.00, "ifsc_code": "HDFC0000249", "joint_holder": "Regional Officer, AICTE"}'::jsonb,
        '{"fdr_number": 0.96, "bank_name": 0.97, "amount": 0.98, "ifsc_code": 0.95, "overall": 0.96}'::jsonb,
        ARRAY['Amount mismatch detected: Submitted ₹10,00,000.00 vs Document receipt ₹8,00,000.00'],
        'COMPLETED'
    ) ON CONFLICT (id) DO NOTHING;

    -- 8. Verification Cases
    -- Verified case
    INSERT INTO public.verification_cases (
        fdr_id, review_status, assigned_officer_id, submitted_snapshot, extracted_snapshot,
        discrepancy_summary, observations, decision, decision_reason, decision_at, officer_id
    ) VALUES (
        fdr_1, 'ACCEPTED', u_officer,
        '{"fdr_number": "SBI-DEL-FDR-2023-8891", "amount": 1500000.00, "bank": "State Bank of India"}'::jsonb,
        '{"fdr_number": "SBI-DEL-FDR-2023-8891", "amount": 1500000.00, "bank": "State Bank of India"}'::jsonb,
        '[]'::jsonb, 'Document verified against bank joint confirmation letter. All terms compliant with AICTE Approval Process Handbook (APH).',
        'ACCEPT', 'All fields verified with bank certificate', now() - INTERVAL '10 months', u_officer
    ) ON CONFLICT DO NOTHING;

    -- Discrepancy Case
    INSERT INTO public.verification_cases (
        fdr_id, review_status, assigned_officer_id, submitted_snapshot, extracted_snapshot,
        discrepancy_summary, observations, decision, decision_reason, decision_at, officer_id
    ) VALUES (
        fdr_3, 'NEEDS_CORRECTION', u_officer,
        '{"fdr_number": "HDFC-DEL-FDR-2024-1029", "amount": 1000000.00, "bank": "HDFC Bank"}'::jsonb,
        '{"fdr_number": "HDFC-DEL-FDR-2024-1029", "amount": 800000.00, "bank": "HDFC Bank"}'::jsonb,
        '[{"field": "amount", "submitted": "1000000.00", "extracted": "800000.00", "discrepancy": "₹ 2,00,000 shortfall detected"}]'::jsonb,
        'The deposited receipt scanned shows Rs 8,00,000 while institution portal claims Rs 10,00,000. Please upload the complete FDR receipt or rectify.',
        'RETURN_FOR_CORRECTION', 'Amount mismatch between submitted form and bank receipt scan', now() - INTERVAL '2 days', u_officer
    ) ON CONFLICT DO NOTHING;

    -- 9. Renewals Linkage
    INSERT INTO public.renewals (
        id, original_fdr_id, replacement_fdr_id, reason, submission_date, status
    ) VALUES (
        'r5555555-0000-4000-8000-000000000001', fdr_5_old, fdr_5_new,
        'Tenure completed for initial 5-year security deposit period. Renewed for extended period per AICTE norms.',
        CURRENT_DATE - INTERVAL '2 months', 'ACTIVE'
    ) ON CONFLICT DO NOTHING;

    -- 10. Release Requests
    INSERT INTO public.release_requests (
        id, institution_id, fdr_id, request_type, justification, workflow_status, assigned_reviewer_id,
        recommendation, approval_decision, decision_reason, approved_by, approved_at, bank_release_ref
    ) VALUES (
        'q6666666-0000-4000-8000-000000000001', inst_hyderabad, fdr_6,
        'COURSE_DISCONTINUATION',
        'Closure of Master of Applied Management (Dual Degree) batch 2018-2023. All student obligations completed and NOC received.',
        'RECOMMENDED', u_officer,
        'Regional office has inspected records. No outstanding student grievances. Refund of security deposit recommended.',
        NULL, NULL, NULL, NULL, NULL
    ) ON CONFLICT DO NOTHING;

    -- 11. Notifications
    INSERT INTO public.notifications (
        recipient_id, institution_id, fdr_id, notification_type, title, message, scheduled_at, delivery_status, read_status
    ) VALUES
        (u_inst1, inst_delhi, fdr_2, 'MATURITY_APPROACHING', 'Action Required: FDR Maturing in 25 Days', 'FDR PNB-DEL-FDR-2021-4412 of INR 25,00,000 will mature on ' || (CURRENT_DATE + INTERVAL '25 days')::text || '. Please submit a renewal instrument or request release.', now(), 'DELIVERED', false),
        (u_inst1, inst_delhi, fdr_3, 'CORRECTION_NEEDED', 'Submission Returned: Discrepancy Found in FDR-2024-1029', 'Your submission for FDR HDFC-DEL-FDR-2024-1029 was returned for correction: Amount on uploaded receipt is Rs 8,00,000 instead of Rs 10,00,000.', now() - INTERVAL '2 days', 'DELIVERED', true),
        (u_officer, inst_mumbai, fdr_4, 'VERIFICATION_APPROVED', 'New FDR Assigned for Scrutiny', 'FDR CNRB-MUM-FDR-2024-5519 (INR 35,00,000) from Mumbai Central Polytechnic is awaiting your review.', now() - INTERVAL '1 day', 'DELIVERED', false);

    -- 12. Audit Events
    INSERT INTO public.audit_events (
        actor_id, actor_role, action, entity_type, entity_id, outcome, reason, ip_address
    ) VALUES
        (u_inst1, 'institution_user', 'FDR_SUBMISSION', 'fdr_records', fdr_1, 'SUCCESS', 'Initial submission of FDR instrument', '192.168.1.10'),
        (u_officer, 'scrutiny_officer', 'VERIFICATION_ACCEPT', 'fdr_records', fdr_1, 'SUCCESS', 'Document verified against bank confirmation', '14.139.60.2'),
        (u_inst1, 'institution_user', 'FDR_SUBMISSION', 'fdr_records', fdr_3, 'SUCCESS', 'FDR form submitted with uploaded receipt', '192.168.1.10'),
        (u_officer, 'scrutiny_officer', 'RETURN_FOR_CORRECTION', 'fdr_records', fdr_3, 'SUCCESS', 'Amount discrepancy detected between submitted data and OCR receipt', '14.139.60.2');

END $$;
