require('dotenv').config();
const axios = require('axios');

// Load environment variables from .env file
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;
const SF_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN;
const SF_ENVIRONMENT = process.env.SF_ENVIRONMENT || 'production';

async function authenticate() {
  // Automatically choose the right URL based on environment
  const loginUrl = SF_ENVIRONMENT === 'sandbox' 
    ? 'https://test.salesforce.com/services/oauth2/token'
    : 'https://login.salesforce.com/services/oauth2/token';
    
  console.log(`🔑 Authenticating with Salesforce ${SF_ENVIRONMENT}...`);
  
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
  try {
    const { token, instanceUrl } = await authenticate();

    const existingLead = await queryLead(email, token, instanceUrl);

    if (existingLead) {
      console.log('✅ Lead exists. Adding task...');
      await createTask(existingLead.Id, notes, token, instanceUrl);
      console.log('📝 Task added successfully!');
    } else {
      console.log('✨ Creating new lead...');
      const leadId = await createLead(firstName, lastName, email, jobTitle, companyName, token, instanceUrl);
      console.log('🎉 Lead created with ID:', leadId);
    }
  } catch (err) {
    console.error('❌ Error during form submission:', err.response?.data || err);
  }
}

// Export for use in other modules
module.exports = { submitForm };

// If running directly (not imported), run the interactive version
if (require.main === module) {
  require('./interactive-lead-creator');
}
