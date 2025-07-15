// Vercel Serverless Function for Email Marketing Subscriptions (Airtable)

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
    
    console.log('🔑 Step 1: Getting Airtable configuration...');
    const airtableToken = process.env.AIRTABLE_API_TOKEN;
    
    if (!airtableToken) {
      throw new Error('Missing Airtable API token');
    }
    
    console.log('✅ Airtable configuration loaded!');

    console.log('✨ Step 2: Creating person record in Airtable...');
    await createPersonRecord(firstName, lastName, email, airtableToken);
    
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

async function createPersonRecord(firstName, lastName, email, airtableToken) {
  console.log('📝 Creating person record in Airtable...');
  
  // Using the correct base ID and table name: appOiKeK8DXCv4L2q and People
  const baseId = 'appOiKeK8DXCv4L2q';
  const tableName = 'People';
  
  const personData = {
    fields: {
      first_name: firstName,   // Case sensitive field name
      last_name: lastName,     // Case sensitive field name
      email: email
      // Skipping Subscriptions field for now
    }
  };
  
  console.log('Person data being sent:', JSON.stringify(personData, null, 2));
  
  try {
    console.log('Making request to:', `https://api.airtable.com/v0/${baseId}/${tableName}`);
    
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(personData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    
    console.log('✅ Full Airtable response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Airtable API error:', data);
      throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    console.log('🎯 Person record ID created:', data.id);
    
    return data.id;
  } catch (error) {
    console.error('❌ Error creating person record:');
    console.error('Error message:', error.message);
    throw error;
  }
}
