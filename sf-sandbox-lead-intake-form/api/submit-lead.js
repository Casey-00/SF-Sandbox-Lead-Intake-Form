// Vercel Serverless Function for Lead Submissions
const { submitForm } = require('../salesforce-form-handler'); // Use subfolder version with client credentials

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
    console.log('📨 Received form submission from website...');
    console.log('Form data:', JSON.stringify(req.body, null, 2));
    
    const formData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      jobTitle: req.body.jobTitle || req.body.title,
      companyName: req.body.companyName || req.body.company,
      notes: req.body.notes
    };
    
    console.log('Mapped form data:', JSON.stringify(formData, null, 2));
    
    // Use YOUR existing Salesforce logic
    await submitForm(formData);
    
    console.log('✅ Successfully sent to YOUR Salesforce!');
    res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your information has been submitted.' 
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
      message: 'Sorry, there was an error. Please try again.',
      error: error.message // Include error message for debugging
    });
  }
}
