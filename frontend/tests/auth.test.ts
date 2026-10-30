import assert from 'assert';
import { 
  isOfficerOrAdmin, 
  isApproverOrAdmin, 
  canReviewVerification, 
  canApproveRelease, 
  canEditFDR 
} from '../lib/auth/roles';
import { Profile, FDRRecord, SystemRole } from '../lib/types/database';
import { FDRService } from '../lib/supabase/service';

async function runAuthTests() {
  console.log('=== Running AICTE FDR Authentication & Authorization Tests ===');

  // 1. Role Capabilities Check
  console.log('[Test 1] Testing Role Gate Functions...');
  assert.strictEqual(isOfficerOrAdmin('institution_user'), false, 'Institution user must NOT be officer/admin');
  assert.strictEqual(isOfficerOrAdmin('scrutiny_officer'), true, 'Scrutiny officer must be officer/admin');
  assert.strictEqual(isOfficerOrAdmin('approving_authority'), true, 'Approving authority must be officer/admin');
  assert.strictEqual(isOfficerOrAdmin('administrator'), true, 'Administrator must be officer/admin');

  assert.strictEqual(isApproverOrAdmin('institution_user'), false);
  assert.strictEqual(isApproverOrAdmin('scrutiny_officer'), false, 'Scrutiny officer must NOT be approver');
  assert.strictEqual(isApproverOrAdmin('approving_authority'), true);

  // 2. Verification Scrutiny Permission Checks
  console.log('[Test 2] Testing Verification Review Permissions...');
  const instUser: Profile = {
    id: 'u-1', email: 'inst@test.edu', full_name: 'Dr. Test', system_role: 'institution_user', is_active: true, created_at: '', updated_at: ''
  };
  const officerUser: Profile = {
    id: 'u-2', email: 'officer@aicte.gov', full_name: 'Officer Test', system_role: 'scrutiny_officer', is_active: true, created_at: '', updated_at: ''
  };
  const approverUser: Profile = {
    id: 'u-3', email: 'approver@aicte.gov', full_name: 'Director Test', system_role: 'approving_authority', is_active: true, created_at: '', updated_at: ''
  };

  assert.strictEqual(canReviewVerification(instUser), false, 'Institution user must NOT review verification');
  assert.strictEqual(canReviewVerification(officerUser), true, 'Scrutiny officer can review verification');

  // 3. Financial Release Approval Permission Checks (Separation of Duties!)
  console.log('[Test 3] Testing Separation of Duties for Release Approvals...');
  assert.strictEqual(canApproveRelease(instUser), false, 'Institution user cannot approve own release');
  assert.strictEqual(canApproveRelease(officerUser), false, 'Scrutiny officer cannot approve financial release (only recommend!)');
  assert.strictEqual(canApproveRelease(approverUser), true, 'Approving authority possesses release approval power');

  // 4. FDR Record Mutation State Guards
  console.log('[Test 4] Testing FDR Record State Mutation Restrictions...');
  const baseFDR: FDRRecord = {
    id: 'fdr-test-1',
    institution_id: 'inst-1',
    fdr_number: 'TEST-FDR-001',
    bank_name: 'State Bank of India',
    branch_name: 'Main',
    ifsc_code: 'SBIN0001',
    amount: 1500000,
    currency: 'INR',
    issue_date: '2024-01-01',
    maturity_date: '2029-01-01',
    joint_holder_name: 'Regional Officer, AICTE',
    lifecycle_status: 'ACTIVE',
    review_status: 'SUBMITTED',
    verification_status: 'PENDING',
    version: 1,
    submitted_by: 'u-1',
    created_at: '',
    updated_at: ''
  };

  // Institution user cannot edit once SUBMITTED
  assert.strictEqual(canEditFDR(instUser, baseFDR), false, 'Cannot edit submitted FDR');
  // Institution user CAN edit when NEEDS_CORRECTION
  const correctionFDR: FDRRecord = { ...baseFDR, review_status: 'NEEDS_CORRECTION' };
  assert.strictEqual(canEditFDR(instUser, correctionFDR), true, 'Can edit FDR returned for correction');
  // Institution user CAN edit when DRAFT
  const draftFDR: FDRRecord = { ...baseFDR, review_status: 'DRAFT' };
  assert.strictEqual(canEditFDR(instUser, draftFDR), true, 'Can edit DRAFT FDR');

  // 5. Institution-Level Data Isolation in FDRService
  console.log('[Test 5] Testing Institution Data Isolation via FDRService...');
  // As institution_user (Delhi Institute)
  await FDRService.switchActiveUserRole('institution_user');
  const instFdrs = await FDRService.getFDRs();
  // Ensure all returned FDRs belong only to Delhi Institute (inst-a1111111)
  instFdrs.forEach(f => {
    assert.strictEqual(
      f.institution_id, 
      'a1111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
      `Cross-institution leak detected! FDR ${f.fdr_number} belongs to ${f.institution_id}`
    );
  });
  console.log(`  -> Verified: Institution user sees exclusively their ${instFdrs.length} institution records.`);

  // As Scrutiny Officer
  await FDRService.switchActiveUserRole('scrutiny_officer');
  const officerFdrs = await FDRService.getFDRs();
  assert.strictEqual(officerFdrs.length > instFdrs.length, true, 'Officer should see records across institutions');
  console.log(`  -> Verified: Scrutiny officer has multi-institution oversight (${officerFdrs.length} records).`);

  // 6. New User Registration Flow
  console.log('[Test 6] Testing New Institutional User Registration (Sign Up Flow)...');
  const regResult = await FDRService.registerInstitutionUser({
    email: 'principal@apextech.edu.in',
    fullName: 'Prof. S. K. Sen',
    designation: 'Principal',
    phone: '+91 98765 12345',
    aicteId: '1-9988776655',
    institutionName: 'Apex Institute of Advanced Technology',
    institutionType: 'Engineering & Technology',
    state: 'Karnataka',
    city: 'Bengaluru',
  });

  assert.strictEqual(regResult.user.email, 'principal@apextech.edu.in');
  assert.strictEqual(regResult.user.system_role, 'institution_user');
  assert.strictEqual(regResult.institution.aicte_id, '1-9988776655');

  // Verify newly registered user is now active and isolated to their new institution
  const currentUser = await FDRService.getCurrentUser();
  assert.strictEqual(currentUser.email, 'principal@apextech.edu.in');
  const registeredUserFdrs = await FDRService.getFDRs();
  assert.strictEqual(registeredUserFdrs.length, 0, 'New institution should have 0 initial FDRs until submitted');

  // Blueprint v2.0 Mandate (Section 0.1, 72): Registration creates PENDING onboarding request
  assert.strictEqual(regResult.institution.onboarding_status, 'PENDING', 'New institution onboarding must be PENDING accreditation verification');
  console.log(`  -> Verified: Successfully registered new user ${regResult.user.full_name} for ${regResult.institution.name} with PENDING onboarding status.`);

  // 7. Blueprint v2.0: Optimistic Concurrency & Version Conflict Protection
  console.log('[Test 7] Testing Blueprint v2.0 Optimistic Concurrency & Versioning...');
  const v2Fdr = await FDRService.createFDR({
    institution_id: regResult.institution.id,
    fdr_number: 'TEST-V2-CONCURRENCY-001',
    bank_name: 'Canara Bank',
    branch_name: 'Main Branch',
    ifsc_code: 'CNRB0001000',
    amount: 1500000,
    issue_date: '2026-01-01',
    maturity_date: '2031-01-01',
    review_status: 'DRAFT',
  });
  assert.strictEqual(v2Fdr.version, 1, 'Initial FDR record must start at version 1');

  // Simulate concurrent stale submission: client thinks version is 2, but actual is 1
  let conflictCaught = false;
  try {
    await FDRService.submitFDRWithOptimisticLock(v2Fdr.id, 2);
  } catch (err: any) {
    conflictCaught = true;
    assert.strictEqual(err.message.includes('VERSION_CONFLICT'), true);
  }
  assert.strictEqual(conflictCaught, true, 'Stale concurrent update must throw VERSION_CONFLICT');

  // Successful submission with correct version
  const submittedV2Fdr = await FDRService.submitFDRWithOptimisticLock(v2Fdr.id, 1);
  assert.strictEqual(submittedV2Fdr.version, 2, 'Successful transition must increment version to 2');
  assert.strictEqual(submittedV2Fdr.review_status, 'SUBMITTED');
  console.log('  -> Verified: Stale update rejected with VERSION_CONFLICT and valid update incremented version to 2.');

  // 8. Blueprint v2.0: Transactional Notification Outbox with Deduplication Key
  console.log('[Test 8] Testing Blueprint v2.0 Transactional Outbox Deduplication...');
  const dedupeKey = `fdr-maturity-alert-${v2Fdr.id}-90days`;
  const outboxResult = await FDRService.enqueueOutboxNotification({
    recipientId: currentUser.id,
    channel: 'IN_APP',
    dedupeKey,
    eventType: 'FDR_MATURITY_APPROACHING',
    aggregateId: v2Fdr.id,
    payload: { fdrNumber: v2Fdr.fdr_number, daysRemaining: 90 },
  });
  assert.strictEqual(outboxResult.queued, true);
  assert.strictEqual(outboxResult.dedupeKey, dedupeKey);
  console.log(`  -> Verified: Enqueued outbox alert with idempotent key '${dedupeKey}'.`);

  console.log('\nAll 8 Authentication, Authorization, Optimistic Concurrency & Registration test suites PASSED successfully!');
}

runAuthTests().catch(err => {
  console.error('Auth test failed:', err);
  process.exit(1);
});

