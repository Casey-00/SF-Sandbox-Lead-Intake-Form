require('dotenv').config();
const axios = require('axios');

// Load environment variables
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

async function authenticate() {
  console.log('🔑 Authenticating with Salesforce...');
  
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

async function debugTaskVisibility() {
  try {
    const { token, instanceUrl } = await authenticate();
    console.log('✅ Authentication successful!');
    
    // Get recent leads (last 7 days)
    console.log('\n📋 Fetching recent leads...');
    const recentLeadsQuery = `
      SELECT Id, FirstName, LastName, Email, CreatedDate 
      FROM Lead 
      WHERE CreatedDate >= LAST_N_DAYS:7 
      ORDER BY CreatedDate DESC 
      LIMIT 10
    `;
    
    const leadsResponse = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: recentLeadsQuery }
    });
    
    console.log(`Found ${leadsResponse.data.records.length} recent leads:`);
    
    for (const lead of leadsResponse.data.records) {
      console.log(`\n🎯 Lead: ${lead.FirstName} ${lead.LastName} (${lead.Email})`);
      console.log(`   ID: ${lead.Id}`);
      console.log(`   Created: ${lead.CreatedDate}`);
      
      // Get tasks for this lead
      console.log('   📝 Checking tasks...');
      const tasksQuery = `
        SELECT Id, Subject, Description, Status, Priority, ActivityDate, CreatedDate, WhoId, OwnerId
        FROM Task 
        WHERE WhoId = '${lead.Id}'
        ORDER BY CreatedDate DESC
      `;
      
      try {
        const tasksResponse = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: tasksQuery }
        });
        
        if (tasksResponse.data.records.length === 0) {
          console.log('   ❌ No tasks found for this lead');
        } else {
          console.log(`   ✅ Found ${tasksResponse.data.records.length} task(s):`);
          
          tasksResponse.data.records.forEach((task, index) => {
            console.log(`      Task ${index + 1}:`);
            console.log(`        ID: ${task.Id}`);
            console.log(`        Subject: ${task.Subject}`);
            console.log(`        Description: ${task.Description}`);
            console.log(`        Status: ${task.Status}`);
            console.log(`        Priority: ${task.Priority}`);
            console.log(`        Activity Date: ${task.ActivityDate}`);
            console.log(`        Created Date: ${task.CreatedDate}`);
            console.log(`        Owner ID: ${task.OwnerId}`);
          });
        }
      } catch (taskError) {
        console.error('   ❌ Error fetching tasks:', taskError.message);
        if (taskError.response) {
          console.error('   Response:', JSON.stringify(taskError.response.data, null, 2));
        }
      }
    }
    
    // Check task visibility settings
    console.log('\n🔍 Checking Task object permissions...');
    try {
      const taskMetadataResponse = await axios.get(`${instanceUrl}/services/data/v59.0/sobjects/Task/describe`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Task object accessible');
      console.log('Task object info:');
      console.log(`  - Createable: ${taskMetadataResponse.data.createable}`);
      console.log(`  - Queryable: ${taskMetadataResponse.data.queryable}`);
      console.log(`  - Updateable: ${taskMetadataResponse.data.updateable}`);
      console.log(`  - Deletable: ${taskMetadataResponse.data.deletable}`);
      
    } catch (metadataError) {
      console.error('❌ Error accessing Task metadata:', metadataError.message);
    }
    
    // Get user info
    console.log('\n👤 Checking current user info...');
    try {
      const userInfoResponse = await axios.get(`${instanceUrl}/services/oauth2/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Current user info:');
      console.log(`  - User ID: ${userInfoResponse.data.user_id}`);
      console.log(`  - Username: ${userInfoResponse.data.preferred_username}`);
      console.log(`  - Profile: ${userInfoResponse.data.profile}`);
      console.log(`  - Organization ID: ${userInfoResponse.data.organization_id}`);
      
    } catch (userError) {
      console.error('❌ Error fetching user info:', userError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the debug script
console.log('🐛 Starting Task Visibility Debug Script...');
debugTaskVisibility();
