require('dotenv').config();
const axios = require('axios');

// Load environment variables
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

async function authenticate() {
  console.log('🔑 Authenticating with Salesforce...');
  
  const response = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`, null, {
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

async function findTestLead(token, instanceUrl) {
  console.log('🔍 Finding a test lead...');
  
  const query = `
    SELECT Id, FirstName, LastName, Email 
    FROM Lead 
    WHERE Email LIKE '%debug%' OR Email LIKE '%test%'
    ORDER BY CreatedDate DESC 
    LIMIT 1
  `;
  
  const response = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query }
  });
  
  if (response.data.records.length > 0) {
    const lead = response.data.records[0];
    console.log(`✅ Found test lead: ${lead.FirstName} ${lead.LastName} (${lead.Email})`);
    console.log(`   Lead ID: ${lead.Id}`);
    return lead;
  } else {
    console.log('❌ No test lead found. Creating one...');
    return await createTestLead(token, instanceUrl);
  }
}

async function createTestLead(token, instanceUrl) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const leadData = {
    FirstName: 'Task',
    LastName: 'Visibility Test',
    Email: `task-visibility-test-${timestamp}@example.com`,
    Company: 'Test Company',
    LeadSource: 'Web'
  };
  
  console.log('🆕 Creating test lead...');
  const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, leadData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const leadId = response.data.id;
  console.log(`✅ Test lead created with ID: ${leadId}`);
  
  return {
    Id: leadId,
    FirstName: leadData.FirstName,
    LastName: leadData.LastName,
    Email: leadData.Email
  };
}

async function createTaskWithConfig(leadId, config, token, instanceUrl) {
  console.log(`\n📝 Testing task configuration: ${config.name}`);
  console.log('Task data:', JSON.stringify(config.taskData, null, 2));
  
  try {
    const response = await axios.post(`${instanceUrl}/services/data/v59.0/sobjects/Task`, config.taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Task created successfully with ID: ${response.data.id}`);
    
    // Immediately verify the task
    const verifyResponse = await axios.get(`${instanceUrl}/services/data/v59.0/sobjects/Task/${response.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Task verification successful:');
    console.log('  - Subject:', verifyResponse.data.Subject);
    console.log('  - Status:', verifyResponse.data.Status);
    console.log('  - Priority:', verifyResponse.data.Priority);
    console.log('  - Activity Date:', verifyResponse.data.ActivityDate);
    console.log('  - Owner ID:', verifyResponse.data.OwnerId);
    
    return response.data.id;
    
  } catch (error) {
    console.error(`❌ Failed to create task with config "${config.name}":`, error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testTaskConfigurations() {
  try {
    const { token, instanceUrl } = await authenticate();
    console.log('✅ Authentication successful!');
    
    const testLead = await findTestLead(token, instanceUrl);
    
    // Different task configurations to test
    const configurations = [
      {
        name: 'Minimal Configuration',
        taskData: {
          WhoId: testLead.Id,
          Subject: 'Minimal Task Test'
        }
      },
      {
        name: 'Current Production Configuration',
        taskData: {
          WhoId: testLead.Id,
          Subject: 'New form resubmission',
          Description: 'Test form resubmission notes',
          Status: 'Not Started',
          Priority: 'Normal',
          ActivityDate: new Date().toISOString().split('T')[0]
        }
      },
      {
        name: 'Standard Task Configuration',
        taskData: {
          WhoId: testLead.Id,
          Subject: 'Standard Task Test',
          Description: 'Standard task description',
          Status: 'Open',
          Priority: 'Normal'
        }
      },
      {
        name: 'Call Task Configuration',
        taskData: {
          WhoId: testLead.Id,
          Subject: 'Call Task Test',
          Description: 'Call task description',
          Status: 'Not Started',
          Priority: 'Normal'
        }
      },
      {
        name: 'Email Task Configuration',
        taskData: {
          WhoId: testLead.Id,
          Subject: 'Email Task Test',
          Description: 'Email task description',
          Status: 'Not Started',
          Priority: 'Normal'
        }
      },
      {
        name: 'Task with Due Date',
        taskData: {
          WhoId: testLead.Id,
          Subject: 'Task with Due Date',
          Description: 'Task with due date description',
          Status: 'Not Started',
          Priority: 'Normal',
          ActivityDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
        }
      }
    ];
    
    const createdTaskIds = [];
    
    for (const config of configurations) {
      const taskId = await createTaskWithConfig(testLead.Id, config, token, instanceUrl);
      if (taskId) {
        createdTaskIds.push(taskId);
      }
      
      // Small delay between creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Final verification - query all tasks for the lead
    console.log('\n🔍 Final verification - querying all tasks for the test lead...');
    const allTasksQuery = `
      SELECT Id, Subject, Description, Status, Priority, ActivityDate, CreatedDate, OwnerId
      FROM Task 
      WHERE WhoId = '${testLead.Id}'
      ORDER BY CreatedDate DESC
    `;
    
    const allTasksResponse = await axios.get(`${instanceUrl}/services/data/v59.0/query`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: allTasksQuery }
    });
    
    console.log(`\n📊 Summary: Found ${allTasksResponse.data.records.length} total tasks for test lead`);
    console.log(`Created ${createdTaskIds.length} tasks in this session`);
    
    allTasksResponse.data.records.forEach((task, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(`  - ID: ${task.Id}`);
      console.log(`  - Subject: ${task.Subject}`);
      console.log(`  - Status: ${task.Status}`);
      console.log(`  - Priority: ${task.Priority}`);
      console.log(`  - Activity Date: ${task.ActivityDate}`);
      console.log(`  - Created: ${task.CreatedDate}`);
      console.log(`  - Owner: ${task.OwnerId}`);
    });
    
  } catch (error) {
    console.error('❌ Task configuration test failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
console.log('🧪 Starting Task Configuration Tests...');
testTaskConfigurations();
