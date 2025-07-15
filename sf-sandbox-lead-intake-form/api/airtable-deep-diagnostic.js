// Deep Airtable diagnostic to understand base structure
export default async function handler(req, res) {
  try {
    console.log('🔍 Starting deep Airtable diagnostic...');
    
    const airtableToken = process.env.AIRTABLE_API_TOKEN;
    const baseId = 'appOiKeK8DXCv4L2q';
    
    if (!airtableToken) {
      return res.status(500).json({ error: 'Missing AIRTABLE_API_TOKEN' });
    }
    
    console.log('Token exists:', !!airtableToken);
    console.log('Base ID:', baseId);
    
    const results = {};
    
    // Test 1: Try to access the base metadata
    console.log('Test 1: Accessing base metadata...');
    try {
      const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        results.metadata = {
          success: true,
          tables: metaData.tables?.map(t => ({ name: t.name, id: t.id })) || []
        };
        console.log('✅ Base metadata accessible');
      } else {
        results.metadata = {
          success: false,
          status: metaResponse.status,
          statusText: metaResponse.statusText
        };
        console.log('❌ Base metadata not accessible:', metaResponse.status);
      }
    } catch (error) {
      results.metadata = { success: false, error: error.message };
    }
    
    // Test 2: Try to access "People" table
    console.log('Test 2: Accessing People table...');
    try {
      const peopleResponse = await fetch(`https://api.airtable.com/v0/${baseId}/People?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (peopleResponse.ok) {
        const peopleData = await peopleResponse.json();
        results.peopleTable = {
          success: true,
          recordCount: peopleData.records?.length || 0,
          fields: peopleData.records[0]?.fields ? Object.keys(peopleData.records[0].fields) : []
        };
        console.log('✅ People table accessible');
      } else {
        results.peopleTable = {
          success: false,
          status: peopleResponse.status,
          statusText: peopleResponse.statusText
        };
        console.log('❌ People table not accessible:', peopleResponse.status);
      }
    } catch (error) {
      results.peopleTable = { success: false, error: error.message };
    }
    
    // Test 3: Try to access "Subscriptions" table
    console.log('Test 3: Accessing Subscriptions table...');
    try {
      const subscriptionsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Subscriptions?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        results.subscriptionsTable = {
          success: true,
          recordCount: subscriptionsData.records?.length || 0,
          fields: subscriptionsData.records[0]?.fields ? Object.keys(subscriptionsData.records[0].fields) : []
        };
        console.log('✅ Subscriptions table accessible');
      } else {
        results.subscriptionsTable = {
          success: false,
          status: subscriptionsResponse.status,
          statusText: subscriptionsResponse.statusText
        };
        console.log('❌ Subscriptions table not accessible:', subscriptionsResponse.status);
      }
    } catch (error) {
      results.subscriptionsTable = { success: false, error: error.message };
    }
    
    // Test 4: Try to find "Nuon Newsletter" record
    console.log('Test 4: Looking for Nuon Newsletter...');
    try {
      const newsletterUrl = `https://api.airtable.com/v0/${baseId}/Subscriptions?filterByFormula=${encodeURIComponent('{Name} = "Nuon Newsletter"')}`;
      const newsletterResponse = await fetch(newsletterUrl, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (newsletterResponse.ok) {
        const newsletterData = await newsletterResponse.json();
        results.newsletterSearch = {
          success: true,
          found: newsletterData.records?.length > 0,
          records: newsletterData.records || []
        };
        console.log('✅ Newsletter search completed');
      } else {
        results.newsletterSearch = {
          success: false,
          status: newsletterResponse.status,
          statusText: newsletterResponse.statusText
        };
        console.log('❌ Newsletter search failed:', newsletterResponse.status);
      }
    } catch (error) {
      results.newsletterSearch = { success: false, error: error.message };
    }
    
    res.status(200).json({
      success: true,
      baseId: baseId,
      diagnostics: results
    });
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
