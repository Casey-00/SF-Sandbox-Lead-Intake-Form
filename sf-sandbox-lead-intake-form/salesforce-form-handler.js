require('dotenv').config();
const axios = require('axios');

// Load environment variables from .env file
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
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

async function queryLead(email, token, instanceUrl) {
  const response = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: `SELECT Id FROM Lead WHERE Email = '${email}'`
    }
  });
  return response.data.records[0];
}

async function createLead(firstName, lastName, email, jobTitle, companyName, notes, token, instanceUrl) {
  const leadData = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Title: jobTitle,
    Company: companyName,
    LeadSource: 'Web'
  };
  
  // Add description if notes are provided
  if (notes && notes.trim()) {
    leadData.Description = notes;
  }
  
  const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, leadData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.id;
}

async function createTask(leadId, notes, token, instanceUrl) {
  console.log('📝 Creating task for lead ID:', leadId);
  console.log('Task notes:', notes);
  
  const taskData = {
    WhoId: leadId,
    Subject: 'New form resubmission',
    Description: notes || 'Form resubmitted without additional notes',
    Status: 'Not Started',
    Priority: 'Normal',
    ActivityDate: new Date().toISOString().split('T')[0] // Today's date
  };
  
  console.log('Task data being sent:', JSON.stringify(taskData, null, 2));
  
  try {
    const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Task`, taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Task creation response:', JSON.stringify(response.data, null, 2));
    console.log('🎯 Task ID created:', response.data.id);
    
    // Immediately verify the task was created
    await verifyTaskCreation(response.data.id, token, instanceUrl);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Error creating task:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function verifyTaskCreation(taskId, token, instanceUrl) {
  console.log('🔍 Verifying task creation for ID:', taskId);
  
  try {
    const response = await axios.get(`${instanceUrl}/services/data/v59.0/sobjects/Task/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Task verification successful:');
    console.log('Task details:', JSON.stringify({
      Id: response.data.Id,
      Subject: response.data.Subject,
      Description: response.data.Description,
      Status: response.data.Status,
      Priority: response.data.Priority,
      WhoId: response.data.WhoId,
      ActivityDate: response.data.ActivityDate,
      CreatedDate: response.data.CreatedDate
    }, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error verifying task creation:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
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
      const leadId = await createLead(firstName, lastName, email, jobTitle, companyName, notes, token, instanceUrl);
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

async function submitTrialRequest({ firstName, lastName, email, organizationName, fullName, jobTitle, description }) {
  console.log('🔍 Starting trial access request process...');
  console.log('Trial request data received:', { firstName, lastName, email, organizationName, fullName, jobTitle, description });
  
  try {
    console.log('🔑 Step 1: Authenticating...');
    const { token, instanceUrl } = await authenticate();
    console.log('✅ Authentication successful!');
    console.log('Instance URL:', instanceUrl);

    console.log('🔍 Step 2: Checking for existing lead...');
    const existingLead = await queryLead(email, token, instanceUrl);

    if (existingLead) {
      console.log('✅ Lead exists. Adding trial access task...');
      await createTrialTask(existingLead.Id, organizationName, jobTitle, description, token, instanceUrl);
      console.log('📝 Trial access task added successfully!');
    } else {
      console.log('✨ Step 3: Creating new lead for trial access...');
      
      // Handle name parsing - if fullName is provided and firstName/lastName are missing
      let finalFirstName = firstName;
      let finalLastName = lastName;
      
      if (!firstName && !lastName && fullName) {
        const nameParts = fullName.trim().split(' ');
        finalFirstName = nameParts[0] || '';
        finalLastName = nameParts.slice(1).join(' ') || 'Unknown';
        console.log(`📝 Parsed fullName "${fullName}" into firstName: "${finalFirstName}", lastName: "${finalLastName}"`);
      }
      
      const leadId = await createTrialLead(finalFirstName, finalLastName, email, organizationName, jobTitle, description, token, instanceUrl);
      console.log('🎉 Trial access lead created with ID:', leadId);
      
      // Always create a task for trial access requests (even for new leads)
      console.log('📝 Adding trial access task to new lead...');
      await createTrialTask(leadId, organizationName, jobTitle, description, token, instanceUrl);
      console.log('📝 Trial access task added to new lead successfully!');
    }
    console.log('✅ Trial access request completed successfully!');
  } catch (err) {
    console.error('❌ Error during trial access request:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
    throw err; // Re-throw so API can handle it
  }
}

async function createTrialLead(firstName, lastName, email, organizationName, jobTitle, description, token, instanceUrl) {
  const leadData = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Company: organizationName || 'Unknown Organization',
    LeadSource: 'Web',
    Description: description || 'Requested trial access'
  };
  
  // Add job title if provided
  if (jobTitle && jobTitle.trim()) {
    leadData.Title = jobTitle;
  }
  
  console.log('Creating trial lead with data:', JSON.stringify(leadData, null, 2));
  
  const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, leadData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.id;
}

async function createTrialTask(leadId, organizationName, jobTitle, description, token, instanceUrl) {
  console.log('📝 Creating trial access task for lead ID:', leadId);
  
  // Build description with all available information
  let taskDescription = 'Trial access requested';
  const details = [];
  
  if (organizationName) details.push(`Organization: ${organizationName}`);
  if (jobTitle) details.push(`Job Title: ${jobTitle}`);
  if (description) details.push(`Additional Details: ${description}`);
  
  if (details.length > 0) {
    taskDescription += '\n\n' + details.join('\n');
  }
  
  const taskData = {
    WhoId: leadId,
    Subject: 'Requested trial access',
    Description: taskDescription,
    Status: 'Not Started',
    Priority: 'Normal',
    ActivityDate: new Date().toISOString().split('T')[0] // Today's date
  };
  
  console.log('Trial task data being sent:', JSON.stringify(taskData, null, 2));
  
  try {
    const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Task`, taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Trial task creation response:', JSON.stringify(response.data, null, 2));
    console.log('🎯 Trial task ID created:', response.data.id);
    
    // Immediately verify the task was created
    await verifyTaskCreation(response.data.id, token, instanceUrl);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Error creating trial task:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Export for use in other modules
module.exports = {
  submitForm,
  submitTrialRequest,
  authenticate,
  queryLead,
  createLead,
  createTask
};

// If running directly (not imported), run the interactive version
if (require.main === module) {
  require('./interactive-lead-creator');
}
