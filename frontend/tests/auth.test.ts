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

  console.log(`  -> Verified: Successfully registered new user ${regResult.user.full_name} for ${regResult.institution.name}.`);

  console.log('\nAll 6 Authentication, Authorization & Registration test suites PASSED successfully!');
}

runAuthTests().catch(err => {
  console.error('Auth test failed:', err);
  process.exit(1);
});

