require('dotenv').config();
const axios = require('axios');

async function authenticate() {
  const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
  const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
  const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
  
  const loginUrl = `${SF_LOGIN_URL}/services/oauth2/token`;
  
  const response = await axios.post(loginUrl, null, {
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

async function verifyFreshLead() {
  try {
    console.log('🔑 Authenticating...');
    const { token, instanceUrl } = await authenticate();
    
    // Check the fresh lead we just created (ID: 00Qfi000001DzoIEAS)
    const leadId = '00Qfi000001DzoIEAS';
    
    console.log('🔍 Getting lead details...');
    const leadResponse = await axios.get(`${instanceUrl}/services/data/v59.0/sobjects/Lead/${leadId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const lead = leadResponse.data;
    console.log('✅ Lead details:');
    console.log('   ID:', lead.Id);
    console.log('   Name:', lead.FirstName, lead.LastName);
    console.log('   Email:', lead.Email);
    console.log('   Company:', lead.Company);
    console.log('   Description:', lead.Description);
    console.log('   Created:', lead.CreatedDate);
    
    console.log('\n🔍 Checking tasks for this lead...');
    const taskResponse = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: `SELECT Id, Subject, Description, CreatedDate, Status FROM Task WHERE WhoId = '${leadId}' ORDER BY CreatedDate DESC`
      }
    });
    
    console.log(`📝 Found ${taskResponse.data.records.length} tasks for this lead:`);
    taskResponse.data.records.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.Subject} - ${task.Status} (Created: ${task.CreatedDate})`);
      console.log(`     Description: ${task.Description}`);
      console.log(`     Task ID: ${task.Id}`);
    });
    
    if (taskResponse.data.records.length === 0) {
      console.log('❌ No tasks found! There might be an issue with task creation.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

verifyFreshLead();
