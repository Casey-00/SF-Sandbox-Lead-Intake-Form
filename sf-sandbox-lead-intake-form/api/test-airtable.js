// Test version of Airtable endpoint for debugging
const axios = require('axios');

export default async function handler(req, res) {
  try {
    console.log('🔍 Testing Airtable configuration...');
    
    const airtableToken = process.env.AIRTABLE_API_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;
    
    console.log('Environment check:');
    console.log('- AIRTABLE_API_TOKEN exists:', !!airtableToken);
    console.log('- AIRTABLE_BASE_ID exists:', !!baseId);
    console.log('- AIRTABLE_TABLE_NAME exists:', !!tableName);
    
    if (!airtableToken || !baseId || !tableName) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        debug: {
          hasToken: !!airtableToken,
          hasBaseId: !!baseId,
          hasTableName: !!tableName
        }
      });
    }
    
    // Test Airtable connection
    const response = await axios.get(`https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Airtable connection successful',
      recordsCount: response.data.records.length,
      tableName: tableName
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    
    res.status(500).json({ 
      error: error.message,
      responseData: error.response?.data,
      responseStatus: error.response?.status
    });
  }
}
