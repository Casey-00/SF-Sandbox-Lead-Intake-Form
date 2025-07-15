// Vercel Serverless Function for Email Marketing Subscriptions (Airtable)
const axios = require('axios');

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
    console.log('📧 Received Airtable email marketing subscription request...');
    console.log('Marketing data:', JSON.stringify(req.body, null, 2));
    
    const { firstName, lastName, email } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'firstName, lastName, and email are required' 
      });
    }
    
    console.log('🔑 Step 1: Getting Airtable configuration...');
    const airtableToken = process.env.AIRTABLE_API_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    
    if (!airtableToken || !baseId) {
      throw new Error('Missing Airtable configuration');
    }
    
    console.log('✅ Airtable configuration loaded!');

    console.log('🔍 Step 2: Looking up Nuon Newsletter subscription...');
    const subscriptionId = await findNewsletterSubscription(airtableToken, baseId);
    
    console.log('✨ Step 3: Creating person record in Airtable...');
    await createPersonRecord(firstName, lastName, email, subscriptionId, airtableToken, baseId);
    
    console.log('✅ Airtable email marketing subscription completed successfully!');
    res.status(200).json({ 
      success: true, 
      message: 'Thank you! You have been added to our mailing list in Airtable.' 
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

async function findNewsletterSubscription(airtableToken, baseId) {
  console.log('🔍 Looking for "Nuon Newsletter" subscription...');
  
  const response = await axios.get(`https://api.airtable.com/v0/${baseId}/Subscription`, {
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json'
    },
    params: {
      filterByFormula: `{Subscription Name} = "Nuon Newsletter"`
    }
  });
  
  if (response.data.records.length === 0) {
    throw new Error('Nuon Newsletter subscription not found in Airtable');
  }
  
  const subscriptionId = response.data.records[0].id;
  console.log('✅ Found Nuon Newsletter subscription with ID:', subscriptionId);
  
  return subscriptionId;
}

async function createPersonRecord(firstName, lastName, email, subscriptionId, airtableToken, baseId) {
  console.log('📝 Creating person record in Airtable...');
  
  const personData = {
    fields: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      subscription: [subscriptionId] // Link to the subscription record
    }
  };
  
  console.log('Person data being sent:', JSON.stringify(personData, null, 2));
  
  try {
    const response = await axios.post(`https://api.airtable.com/v0/${baseId}/People`, personData, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Person record creation response:', JSON.stringify(response.data, null, 2));
    console.log('🎯 Person record ID created:', response.data.id);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Error creating person record:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}
