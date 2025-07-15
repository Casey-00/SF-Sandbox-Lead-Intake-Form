// Diagnostic endpoint to test Airtable connection
const axios = require('axios');

export default async function handler(req, res) {
  try {
    console.log('🔍 Starting Airtable diagnostic...');
    
    // Step 1: Check environment variables
    const airtableToken = process.env.AIRTABLE_API_TOKEN;
    console.log('Step 1 - Token exists:', !!airtableToken);
    
    if (!airtableToken) {
      return res.status(500).json({ 
        error: 'Missing AIRTABLE_API_TOKEN',
        step: 1
      });
    }
    
    // Step 2: Test basic Airtable connection
    const baseId = 'appOiKeK8DXCv4L2q';
    console.log('Step 2 - Testing base connection...');
    
    const baseTest = await axios.get(`https://api.airtable.com/v0/${baseId}/People?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Step 2 - Base connection successful');
    
    // Step 3: Test Subscriptions table
    console.log('Step 3 - Testing Subscriptions table...');
    
    const subscriptionsTest = await axios.get(`https://api.airtable.com/v0/${baseId}/Subscriptions?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Step 3 - Subscriptions table accessible');
    
    // Step 4: Look for Nuon Newsletter
    console.log('Step 4 - Looking for Nuon Newsletter...');
    
    const newsletterSearch = await axios.get(`https://api.airtable.com/v0/${baseId}/Subscriptions`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        filterByFormula: `{Name} = "Nuon Newsletter"`
      }
    });
    
    console.log('Step 4 - Newsletter search results:', newsletterSearch.data.records.length);
    
    // Return success with diagnostic info
    res.status(200).json({
      success: true,
      diagnostics: {
        hasToken: !!airtableToken,
        baseId: baseId,
        peopleRecords: baseTest.data.records.length,
        subscriptionRecords: subscriptionsTest.data.records.length,
        newsletterFound: newsletterSearch.data.records.length > 0,
        newsletterData: newsletterSearch.data.records[0] || null
      }
    });
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
    console.error('❌ Error response:', error.response?.data);
    
    res.status(500).json({
      error: error.message,
      step: 'Unknown',
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });
  }
}
