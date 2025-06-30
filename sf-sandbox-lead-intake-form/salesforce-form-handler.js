require('dotenv').config();
const axios = require('axios');

// Load environment variables from .env file
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;
const SF_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

async function authenticate() {
  console.log('Environment variables check:');
  console.log('SF_LOGIN_URL raw:', SF_LOGIN_URL);
  console.log('SF_CLIENT_ID exists:', !!SF_CLIENT_ID);
  console.log('SF_CLIENT_SECRET exists:', !!SF_CLIENT_SECRET);
  
  // Use the provided login URL
  const loginUrl = `${SF_LOGIN_URL}/services/oauth2/token`;
  console.log('Full login URL:', loginUrl);
    
  console.log(`🔑 Authenticating with Salesforce at ${SF_LOGIN_URL}...`);
  
  const response = await axios.post(loginUrl, null, {
    params: {
      grant_type: 'password',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      username: SF_USERNAME,
      password: SF_PASSWORD + SF_SECURITY_TOKEN
    }
  });
  return {
    token: response.data.access_token,
    instanceUrl: response.data.instance_url
  };
}

async function queryLead(email, token, instanceUrl) {
  const response = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: `SELECT Id FROM Lead WHERE Email = '${email}'`
    }
  });
  return response.data.records[0];
}

async function createLead(firstName, lastName, email, jobTitle, companyName, token, instanceUrl) {
  const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Title: jobTitle,
    Company: companyName,
    LeadSource: 'Web'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.id;
}

async function createTask(leadId, notes, token, instanceUrl) {
  await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Task`, {
    WhoId: leadId,
    Subject: 'New form resubmission',
    Description: notes,
    Status: 'Not Started',
    Priority: 'Normal'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function submitForm({ firstName, lastName, jobTitle, email, companyName, notes }) {
  console.log('🔍 Starting form submission process...');
  console.log('Form data received:', { firstName, lastName, jobTitle, email, companyName, notes });
  
  try {
    console.log('🔑 Step 1: Authenticating...');
    const { token, instanceUrl } = await authenticate();
    console.log('✅ Authentication successful!');
    console.log('Instance URL:', instanceUrl);

    console.log('🔍 Step 2: Checking for existing lead...');
    const existingLead = await queryLead(email, token, instanceUrl);

    if (existingLead) {
      console.log('✅ Lead exists. Adding task...');
      await createTask(existingLead.Id, notes, token, instanceUrl);
      console.log('📝 Task added successfully!');
    } else {
      console.log('✨ Step 3: Creating new lead...');
      const leadId = await createLead(firstName, lastName, email, jobTitle, companyName, token, instanceUrl);
      console.log('🎉 Lead created with ID:', leadId);
    }
    console.log('✅ Form submission completed successfully!');
  } catch (err) {
    console.error('❌ Error during form submission:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
    throw err; // Re-throw so API can handle it
  }
}

// Export for use in other modules
module.exports = { submitForm };

// If running directly (not imported), run the interactive version
if (require.main === module) {
  require('./interactive-lead-creator');
}
