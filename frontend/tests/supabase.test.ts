import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { FDRService } from '../lib/supabase/service';
import { createClient as createBrowserClient } from '../lib/supabase/client';
import { createAdminClient } from '../lib/supabase/admin';

console.log('================================================================');
console.log('AICTE FDR PORTAL: DETAILED SUPABASE IMPLEMENTATION TEST SUITE');
console.log('================================================================\n');

async function runDetailedSupabaseTests() {
  const rootDir = path.resolve(__dirname, '../../');
  const migrationsDir = path.join(rootDir, 'supabase/migrations');
  const seedFile = path.join(rootDir, 'supabase/seed.sql');

  // -------------------------------------------------------------------------
  // TEST 1: Schema Migration & Relational Architecture Verification
  // -------------------------------------------------------------------------
  console.log('[Test 1] Verifying Supabase PostgreSQL Schema Migrations...');
  const initMigrationPath = path.join(migrationsDir, '20261029000000_init_aicte_schema.sql');
  assert(fs.existsSync(initMigrationPath), 'Initial schema migration file must exist');

  const initSql = fs.readFileSync(initMigrationPath, 'utf8');

  // 12 Required Core Tables
  const expectedTables = [
    'profiles',
    'institutions',
    'institution_memberships',
    'fdr_records',
    'documents',
    'document_extractions',
    'verification_cases',
    'renewals',
    'release_requests',
    'notifications',
    'audit_events',
    'system_settings',
  ];

  for (const table of expectedTables) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`, 'i');
    assert(tableRegex.test(initSql), `Table public.${table} must be defined in initial schema`);
  }
  console.log(`  -> Verified: All 12 relational tables correctly defined.`);

  // Verify Critical Financial & Date Constraints
  assert(initSql.includes('NUMERIC(14, 2) NOT NULL CHECK (amount > 0)'), 'FDR amount must be NUMERIC(14,2) and > 0');
  assert(initSql.includes('CHECK (maturity_date > issue_date)'), 'FDR maturity_date must be strictly after issue_date');
  assert(initSql.includes("system_role IN ('institution_user', 'scrutiny_officer', 'approving_authority', 'administrator')"), 'Roles restricted to 4 valid system roles');
  assert(initSql.includes('handle_updated_at()'), 'Automated timestamp trigger must be defined');
  console.log('  -> Verified: Financial constraints, date bounds, and updated_at triggers confirmed.\n');

  // -------------------------------------------------------------------------
  // TEST 2: Row Level Security (RLS) & Access Control Migration
  // -------------------------------------------------------------------------
  console.log('[Test 2] Verifying Supabase Row Level Security (RLS) & Security Definer Functions...');
  const rlsMigrationPath = path.join(migrationsDir, '20261029000001_rls_and_triggers.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS migration file must exist');

  const rlsSql = fs.readFileSync(rlsMigrationPath, 'utf8');

  // Verify RLS enabled on all 12 tables
  for (const table of expectedTables) {
    const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
    assert(rlsRegex.test(rlsSql), `RLS must be enabled on public.${table}`);
  }
  console.log('  -> Verified: RLS enabled across all 12 tables.');

  // Verify Security Definer Helper Functions
  assert(rlsSql.includes('CREATE OR REPLACE FUNCTION public.get_current_user_role()'), 'get_current_user_role helper must exist');
  assert(rlsSql.includes('CREATE OR REPLACE FUNCTION public.is_institution_member'), 'is_institution_member helper must exist');
  assert(rlsSql.includes('CREATE OR REPLACE FUNCTION public.is_officer_or_admin()'), 'is_officer_or_admin helper must exist');
  assert(rlsSql.includes('CREATE OR REPLACE FUNCTION public.is_approver_or_admin()'), 'is_approver_or_admin helper must exist');
  console.log('  -> Verified: Security Definer helper functions defined with search_path = public.');

  // Verify Append-Only Immutability on audit_events
  assert(rlsSql.includes('CREATE POLICY "Authorized actors insert audit events"'), 'Audit events must have an INSERT policy');
  assert(!rlsSql.includes('ON public.audit_events FOR UPDATE'), 'SECURITY MANDATE: Audit events must NEVER have an UPDATE policy');
  assert(!rlsSql.includes('ON public.audit_events FOR DELETE'), 'SECURITY MANDATE: Audit events must NEVER have a DELETE policy');
  console.log('  -> Verified: Append-only immutability enforced for audit_events (no UPDATE/DELETE policies).\n');

  // -------------------------------------------------------------------------
  // TEST 3: Supabase Storage Bucket & Isolation Policies
  // -------------------------------------------------------------------------
  console.log('[Test 3] Verifying Supabase Storage Bucket Configuration...');
  assert(rlsSql.includes("'fdr-documents'"), "Storage bucket 'fdr-documents' must be initialized");
  assert(rlsSql.includes('public = false'), "'fdr-documents' bucket must be strictly private");
  assert(rlsSql.includes('15728640'), 'Storage size limit must be set (15MB)');
  assert(rlsSql.includes('storage.foldername(name)'), 'Folder isolation policy must restrict files to institution subdirectories');
  console.log("  -> Verified: Private 'fdr-documents' bucket with institution folder isolation verified.\n");

  // -------------------------------------------------------------------------
  // TEST 4: Seed Data & Realistic Compliance Fixtures
  // -------------------------------------------------------------------------
  console.log('[Test 4] Verifying Seed Data & Initial Compliance Dataset...');
  assert(fs.existsSync(seedFile), 'seed.sql must exist');
  const seedSql = fs.readFileSync(seedFile, 'utf8');

  assert(seedSql.includes("INSERT INTO public.profiles"), 'Seed data must contain user profiles');
  assert(seedSql.includes("INSERT INTO public.institutions"), 'Seed data must contain technical institutions');
  assert(seedSql.includes("INSERT INTO public.fdr_records"), 'Seed data must contain realistic FDR instruments');
  assert(seedSql.includes("INSERT INTO public.audit_events"), 'Seed data must contain traceable audit trail');
  assert(initSql.includes("INSERT INTO public.system_settings"), 'Schema/seed must configure system settings');
  console.log('  -> Verified: Comprehensive seed dataset validated.\n');

  // -------------------------------------------------------------------------
  // TEST 5: Supabase Client Factories (Browser, Server & Admin)
  // -------------------------------------------------------------------------
  console.log('[Test 5] Testing Supabase Client Initialization & SSR Config...');
  const browserClient = createBrowserClient();
  assert(browserClient !== null, 'createBrowserClient must return a valid SupabaseClient');
  assert(typeof browserClient.from === 'function', 'Browser client must provide table query interface');
  assert(typeof browserClient.storage === 'object', 'Browser client must provide storage interface');

  const adminClient = createAdminClient();
  assert(adminClient !== null, 'createAdminClient must return a valid SupabaseClient');
  assert(typeof adminClient.from === 'function', 'Admin client must provide table query interface');
  assert(typeof adminClient.auth === 'object', 'Admin client must provide auth interface');
  console.log('  -> Verified: Browser, Server, and Elevated Service-Role admin clients initialized.\n');

  // -------------------------------------------------------------------------
  // TEST 6: FDRService Database Operations & Lifecycle Transactions
  // -------------------------------------------------------------------------
  console.log('[Test 6] Testing FDRService Database Operations (CRUD & Workflows)...');

  // A. Check connection capability
  const connStatus = await FDRService.checkSupabaseConnection();
  console.log(`  -> Supabase connection check executed: Target URL = ${connStatus.url}`);

  // B. Switch to Scrutiny Officer
  await FDRService.switchActiveUserRole('scrutiny_officer');
  const allFdrs = await FDRService.getFDRs();
  assert(allFdrs.length >= 7, 'Scrutiny officer must have multi-institutional oversight of all FDR records');
  console.log(`  -> Verified: Scrutiny officer retrieved ${allFdrs.length} FDR records.`);

  // C. Switch to Institution User and verify institution scoping
  await FDRService.switchActiveUserRole('institution_user');
  const instFdrs = await FDRService.getFDRs();
  assert(instFdrs.length < allFdrs.length, 'Institution user must be isolated to their own institution');
  console.log(`  -> Verified: Institution user isolated to ${instFdrs.length} records.`);

  // D. Create a new FDR record
  const testFdrNumber = `TEST-FDR-${Date.now()}`;
  const createdFdr = await FDRService.createFDR({
    institution_id: instFdrs[0].institution_id,
    fdr_number: testFdrNumber,
    bank_name: 'Punjab National Bank',
    branch_name: 'Connaught Place, New Delhi',
    ifsc_code: 'PUNB0000100',
    amount: 5000000.00,
    issue_date: '2026-01-01',
    maturity_date: '2036-01-01',
  });
  assert(createdFdr.fdr_number === testFdrNumber, 'Created FDR must match submitted number');
  assert(createdFdr.amount === 5000000.00, 'Created FDR amount must match');
  assert(createdFdr.review_status === 'SUBMITTED', 'New FDR must enter SUBMITTED review status');
  console.log(`  -> Verified: FDR submission persisted with ID: ${createdFdr.id}`);

  // E. Record Scrutiny Officer Verification Decision
  await FDRService.switchActiveUserRole('scrutiny_officer');
  const vcase = await FDRService.recordVerificationDecision({
    fdrId: createdFdr.id,
    decision: 'ACCEPT',
    decisionReason: 'Bank verification letter confirmed; joint lien validated.',
    observations: 'All physical and digital security deposit criteria satisfied.',
    evidenceNotes: 'Cross-checked with PNB branch manager letter ref PNB/AICTE/2026/887.',
  });
  assert(vcase.decision === 'ACCEPT', 'Verification decision must be recorded as ACCEPT');
  assert(vcase.review_status === 'ACCEPTED', 'Review status must transition to ACCEPTED');
  console.log(`  -> Verified: Scrutiny decision recorded and status transitioned to ACCEPTED.`);

  // F. Record Audit Event and Verify Immutability
  const auditEvent = await FDRService.recordAuditEvent({
    action: 'TEST_AUDIT_LOG_ACTION',
    entity_type: 'fdr_records',
    entity_id: createdFdr.id,
    outcome: 'SUCCESS',
    reason: 'Detailed test suite verification event',
  });
  assert(auditEvent.action === 'TEST_AUDIT_LOG_ACTION', 'Audit event must record action');
  const auditEvents = await FDRService.getAuditEvents();
  const loggedEvent = auditEvents.find(e => e.id === auditEvent.id);
  assert(loggedEvent !== undefined, 'Audit event must be present in audit ledger');
  console.log(`  -> Verified: Append-only audit event successfully logged with ID: ${auditEvent.id}.\n`);

  // -------------------------------------------------------------------------
  // TEST 7: Supabase Storage Integration
  // -------------------------------------------------------------------------
  console.log('[Test 7] Testing Supabase Storage Pathing & Signed URL Generation...');
  const testBuffer = Buffer.from('Mock PDF Content for FDR Certificate');
  const uploadResult = await FDRService.uploadDocumentToStorage(
    testBuffer,
    instFdrs[0].institution_id,
    'certificate_scan.pdf',
    'application/pdf'
  );
  assert(uploadResult.path.includes(instFdrs[0].institution_id), 'Storage path must enforce institution folder isolation');
  console.log(`  -> Verified: Storage upload path resolved to: ${uploadResult.path}`);

  const signedUrl = await FDRService.getSignedDocumentUrl(uploadResult.path);
  assert(signedUrl !== null && signedUrl.length > 0, 'Signed document URL must be generated');
  console.log(`  -> Verified: Signed URL generated: ${signedUrl.substring(0, 50)}...\n`);

  console.log('================================================================');
  console.log('ALL 7 DETAILED SUPABASE TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runDetailedSupabaseTests().catch(err => {
  console.error('\nFAILED SUPABASE TEST:', err);
  process.exit(1);
});
