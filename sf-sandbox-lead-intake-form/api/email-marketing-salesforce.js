// Vercel Serverless Function for Email Marketing Subscriptions (Salesforce)
const { authenticate, queryLead, createLead, createTask } = require('../salesforce-form-handler');

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    console.log('📧 Received email marketing subscription request...');
    console.log('Marketing data:', JSON.stringify(req.body, null, 2));
    
    const { email } = req.body;
    
    // Validate required fields - only email is required now
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'email is required' 
      });
    }
    
    // Set placeholders for firstName, lastName
    const firstName = '-';
    const lastName = '-';
    
    console.log('🔑 Step 1: Authenticating with Salesforce...');
    const { token, instanceUrl } = await authenticate();
    console.log('✅ Authentication successful!');

    console.log('🔍 Step 2: Checking for existing lead...');
    const existingLead = await queryLead(email, token, instanceUrl);

    if (existingLead) {
      console.log('✅ Lead exists. Adding marketing subscription task...');
      await createMarketingTask(existingLead.Id, token, instanceUrl);
      console.log('📝 Marketing task added successfully!');
    } else {
      console.log('✨ Step 3: Creating new lead for marketing...');
      const leadId = await createMarketingLead(firstName, lastName, email, token, instanceUrl);
      console.log('🎉 Marketing lead created with ID:', leadId);
    }
    
    console.log('✅ Email marketing subscription completed successfully!');
    res.status(200).json({ 
      success: true, 
      message: 'Thank you! You have been subscribed to our mailing list.' 
    });
    
  } catch (error) {
    console.error('❌ Full error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Response status:', error.response.status);
    }
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, there was an error processing your subscription. Please try again.',
      error: error.message
    });
  }
}

async function createMarketingLead(firstName, lastName, email, token, instanceUrl) {
  const axios = require('axios');
  
  const leadData = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Company: '-', // Minimal placeholder for marketing leads
    LeadSource: 'Web',
    Description: 'Signed up for marketing list'
  };
  
  console.log('Creating marketing lead with data:', JSON.stringify(leadData, null, 2));
  
  const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, leadData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Create marketing task for new lead
  await createMarketingTask(response.data.id, token, instanceUrl);
  
  return response.data.id;
}

async function createMarketingTask(leadId, token, instanceUrl) {
  const axios = require('axios');
  
  console.log('📝 Creating marketing subscription task for lead ID:', leadId);
  
  const taskData = {
    WhoId: leadId,
    Subject: 'Signed Up For Marketing List',
    Description: 'User subscribed to marketing email list',
    Status: 'Completed', // Mark as completed since subscription happened
    Priority: 'Normal',
    ActivityDate: new Date().toISOString().split('T')[0] // Today's date
  };
  
  console.log('Marketing task data being sent:', JSON.stringify(taskData, null, 2));
  
  try {
    const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Task`, taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Marketing task creation response:', JSON.stringify(response.data, null, 2));
    console.log('🎯 Marketing task ID created:', response.data.id);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Error creating marketing task:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}
