const axios = require('axios');

async function detailedFormTest() {
  // Create a unique email to simulate the lead submission
  const timestamp = Date.now();
  const testData = {
    firstName: 'FormTest',
    lastName: 'User',
    email: `form.test.${timestamp}@testcompany.com`,
    jobTitle: 'Test Manager',
    companyName: 'Test Company Inc',
    notes: ''
  };
  
  console.log(`🧪 Running detailed form submission test`);
  console.log(`📧 Test email: ${testData.email}`);
  console.log(`👤 Test user: ${testData.firstName} ${testData.lastName}`);
  console.log(`🏢 Company: ${testData.companyName}`);
  
  try {
    // First submission - should create a new lead
    console.log('\n🎯 === FIRST SUBMISSION (New Lead Creation) ===');
    testData.notes = 'This is the first form submission. Should create a new lead in Salesforce.';
    
    console.log('📤 Sending first submission...');
    const firstResponse = await axios.post(
      'https://salesforce-lead-intake-api.vercel.app/api/submit-lead', 
      testData,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log('✅ First submission response:');
    console.log(`   Status: ${firstResponse.status}`);
    console.log(`   Message: ${firstResponse.data.message}`);
    console.log(`   Success: ${firstResponse.data.success}`);
    
    // Wait a moment between submissions
    console.log('\n⏳ Waiting 2 seconds before duplicate submission...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Second submission - should add a task to existing lead
    console.log('\n🎯 === SECOND SUBMISSION (Duplicate - Should Add Task) ===');
    testData.notes = 'This is a duplicate submission with the same email. Should create a task on the existing lead.';
    
    console.log('📤 Sending duplicate submission...');
    const secondResponse = await axios.post(
      'https://salesforce-lead-intake-api.vercel.app/api/submit-lead', 
      testData,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    console.log('✅ Second submission response:');
    console.log(`   Status: ${secondResponse.status}`);
    console.log(`   Message: ${secondResponse.data.message}`);
    console.log(`   Success: ${secondResponse.data.success}`);
    
    // Third submission with different notes to verify task creation
    console.log('\n⏳ Waiting 2 seconds before third submission...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n🎯 === THIRD SUBMISSION (Another Task Addition) ===');
    testData.notes = 'This is a third submission to verify multiple tasks can be added to the same lead.';
    
    console.log('📤 Sending third submission...');
    const thirdResponse = await axios.post(
      'https://salesforce-lead-intake-api.vercel.app/api/submit-lead', 
      testData,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    console.log('✅ Third submission response:');
    console.log(`   Status: ${thirdResponse.status}`);
    console.log(`   Message: ${thirdResponse.data.message}`);
    console.log(`   Success: ${thirdResponse.data.success}`);
    
    console.log('\n🎉 === TEST SUMMARY ===');
    console.log('✅ All three submissions completed successfully!');
    console.log('📝 Expected results in Salesforce:');
    console.log('   - One new lead created with the test email');
    console.log('   - Two tasks attached to that lead (from duplicate submissions)');
    console.log('   - Lead description should contain notes from first submission');
    console.log('   - Tasks should contain notes from second and third submissions');
    console.log(`\n🔍 You can verify this in Salesforce by searching for: ${testData.email}`);
    
  } catch (error) {
    console.error('\n❌ === ERROR OCCURRED ===');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timed out - the API might be slow or having issues');
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   - Check if the API is deployed and accessible');
    console.error('   - Verify environment variables are set correctly in Vercel');
    console.error('   - Check Salesforce connectivity and permissions');
  }
}

// Run the test
console.log('🚀 Starting detailed form submission test...');
detailedFormTest();
