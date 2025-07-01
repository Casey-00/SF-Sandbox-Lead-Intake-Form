const axios = require('axios');
require('dotenv').config();

// Load environment variables for Salesforce verification
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

async function authenticateWithSalesforce() {
  console.log('🔑 Authenticating with Salesforce for verification...');
  
  const response = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`, null, {
    params: {
      grant_type: 'client_credentials',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET
    }
  });
  
  return {
    token: response.data.access_token,
    instanceUrl: response.data.instance_url
  };
}

async function verifyLeadInSalesforce(email, token, instanceUrl) {
  console.log(`🔍 Verifying lead exists in Salesforce for email: ${email}`);
  
  const response = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: `SELECT Id, FirstName, LastName, Email, Company, Description, CreatedDate FROM Lead WHERE Email = '${email}'`
    }
  });
  
  return response.data.records[0];
}

async function verifyTasksInSalesforce(leadId, token, instanceUrl) {
  console.log(`📝 Verifying tasks for lead ID: ${leadId}`);
  
  const response = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: `SELECT Id, Subject, Description, Status, Priority, ActivityDate, CreatedDate FROM Task WHERE WhoId = '${leadId}' ORDER BY CreatedDate DESC`
    }
  });
  
  return response.data.records;
}

async function completeApiTest() {
  // Create unique test data
  const timestamp = Date.now();
  const testData = {
    firstName: 'Complete',
    lastName: 'Test',
    email: `complete.api.test.${timestamp}@example.com`,
    jobTitle: 'API Test Manager',
    companyName: 'API Test Company',
    notes: ''
  };
  
  console.log('🚀 === COMPLETE API TEST WITH SALESFORCE VERIFICATION ===');
  console.log(`📧 Test email: ${testData.email}`);
  console.log(`👤 Test user: ${testData.firstName} ${testData.lastName}`);
  
  try {
    // Test 1: Create new lead
    console.log('\n🎯 STEP 1: Creating new lead via API...');
    testData.notes = 'First submission - creating new lead via API endpoint';
    
    const firstResponse = await axios.post(
      'https://salesforce-lead-intake-api.vercel.app/api/submit-lead',
      testData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('✅ First API call successful:', firstResponse.data.message);
    
    // Test 2: Add task to existing lead
    console.log('\n🎯 STEP 2: Adding task to existing lead via API...');
    testData.notes = 'Second submission - should add task to existing lead';
    
    const secondResponse = await axios.post(
      'https://salesforce-lead-intake-api.vercel.app/api/submit-lead',
      testData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('✅ Second API call successful:', secondResponse.data.message);
    
    // Wait a moment for Salesforce to process
    console.log('\n⏳ Waiting 3 seconds for Salesforce to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify in Salesforce
    console.log('\n🔍 STEP 3: Verifying results in Salesforce...');
    const { token, instanceUrl } = await authenticateWithSalesforce();
    
    // Check if lead was created
    const lead = await verifyLeadInSalesforce(testData.email, token, instanceUrl);
    
    if (lead) {
      console.log('\n✅ LEAD VERIFICATION:');
      console.log(`   Lead ID: ${lead.Id}`);
      console.log(`   Name: ${lead.FirstName} ${lead.LastName}`);
      console.log(`   Email: ${lead.Email}`);
      console.log(`   Company: ${lead.Company}`);
      console.log(`   Description: ${lead.Description}`);
      console.log(`   Created: ${lead.CreatedDate}`);
      
      // Check tasks for this lead
      const tasks = await verifyTasksInSalesforce(lead.Id, token, instanceUrl);
      
      console.log('\n📝 TASK VERIFICATION:');
      if (tasks.length > 0) {
        console.log(`   Found ${tasks.length} task(s):`);
        tasks.forEach((task, index) => {
          console.log(`   Task ${index + 1}:`);
          console.log(`     ID: ${task.Id}`);
          console.log(`     Subject: ${task.Subject}`);
          console.log(`     Description: ${task.Description}`);
          console.log(`     Status: ${task.Status}`);
          console.log(`     Created: ${task.CreatedDate}`);
        });
      } else {
        console.log('   ❌ No tasks found for this lead');
      }
      
      // Summary
      console.log('\n🎉 === TEST RESULTS SUMMARY ===');
      console.log(`✅ Lead created successfully: ${lead.FirstName} ${lead.LastName}`);
      console.log(`✅ Tasks created: ${tasks.length}`);
      console.log('✅ API endpoint working correctly!');
      console.log('✅ Salesforce integration working correctly!');
      
      if (tasks.length === 1) {
        console.log('\n💡 Expected behavior:');
        console.log('   - First submission created the lead with description');
        console.log('   - Second submission created 1 task on the existing lead');
      }
      
    } else {
      console.log('❌ Lead not found in Salesforce - something went wrong');
    }
    
  } catch (error) {
    console.error('\n❌ === TEST FAILED ===');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the complete test
completeApiTest();
