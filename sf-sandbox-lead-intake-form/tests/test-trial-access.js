require('dotenv').config();
const { submitTrialRequest } = require('../salesforce-form-handler');

async function testTrialAccess() {
  console.log('🧪 Testing trial access request functionality...\n');

  // Test 1: New lead creation with separate first/last names
  console.log('=== TEST 1: New Trial Lead (firstName/lastName) ===');
  try {
    await submitTrialRequest({
      firstName: 'Trial',
      lastName: 'User1',
      email: 'trial-test1@example.com',
      organizationName: 'Test Org Inc'
    });
    console.log('✅ Test 1 passed!\n');
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message, '\n');
  }

  // Test 2: New lead creation with fullName parsing
  console.log('=== TEST 2: New Trial Lead (fullName parsing) ===');
  try {
    await submitTrialRequest({
      fullName: 'Jane Smith-Johnson',
      email: 'trial-test2@example.com',
      organizationName: 'Another Test Company'
    });
    console.log('✅ Test 2 passed!\n');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message, '\n');
  }

  // Test 3: Adding task to existing lead (reuse email from test 1)
  console.log('=== TEST 3: Adding Trial Task to Existing Lead ===');
  try {
    await submitTrialRequest({
      firstName: 'Trial',
      lastName: 'User1',
      email: 'trial-test1@example.com', // Same email as test 1
      organizationName: 'Updated Organization Name'
    });
    console.log('✅ Test 3 passed!\n');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message, '\n');
  }

  console.log('🎉 Trial access testing completed!');
}

// Run the test
if (require.main === module) {
  testTrialAccess().catch(console.error);
}

module.exports = { testTrialAccess };
