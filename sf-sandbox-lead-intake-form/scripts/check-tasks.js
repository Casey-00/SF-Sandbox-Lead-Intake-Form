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

async function checkTasksForLead() {
  try {
    console.log('🔑 Authenticating...');
    const { token, instanceUrl } = await authenticate();
    
    console.log('🔍 Finding the debug lead...');
    const leadResponse = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: `SELECT Id, FirstName, LastName, Email FROM Lead WHERE Email = 'debug.test@example.com'`
      }
    });
    
    if (leadResponse.data.records.length === 0) {
      console.log('❌ No lead found with email debug.test@example.com');
      return;
    }
    
    const lead = leadResponse.data.records[0];
    console.log('✅ Found lead:', lead);
    
    console.log('🔍 Checking tasks for this lead...');
    const taskResponse = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: `SELECT Id, Subject, Description, CreatedDate, Status FROM Task WHERE WhoId = '${lead.Id}' ORDER BY CreatedDate DESC`
      }
    });
    
    console.log(`📝 Found ${taskResponse.data.records.length} tasks for this lead:`);
    taskResponse.data.records.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.Subject} - ${task.Status} (Created: ${task.CreatedDate})`);
      console.log(`     Description: ${task.Description}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

checkTasksForLead();
