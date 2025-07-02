// Vercel Serverless Function for Trial Access Requests
const { submitTrialRequest } = require('../salesforce-form-handler');

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
    console.log('🚀 Received trial access request from website...');
    console.log('Trial request data:', JSON.stringify(req.body, null, 2));
    
    // Map incoming data to our expected format
    const trialData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      organizationName: req.body.organizationName || req.body.organization || req.body.companyName || req.body.company,
      fullName: req.body.fullName || req.body.name
    };
    
    console.log('Mapped trial data:', JSON.stringify(trialData, null, 2));
    
    // Validate required fields
    if (!trialData.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if we have name information
    if (!trialData.firstName && !trialData.lastName && !trialData.fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name information is required (firstName/lastName or fullName)' 
      });
    }
    
    // Use YOUR existing Salesforce logic for trial requests
    await submitTrialRequest(trialData);
    
    console.log('✅ Successfully processed trial access request!');
    res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your trial access request has been submitted.' 
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
      message: 'Sorry, there was an error processing your trial request. Please try again.',
      error: error.message // Include error message for debugging
    });
  }
}
