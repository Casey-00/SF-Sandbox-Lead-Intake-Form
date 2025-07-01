const { submitForm } = require('./salesforce-form-handler');

async function testUniqueSubmission() {
  // Use completely unique data
  const timestamp = Date.now();
  const uniqueEmail = `unique.test.${timestamp}@uniquecorp${timestamp}.com`;
  
  console.log(`🧪 Testing with unique email: ${uniqueEmail}`);
  
  try {
    console.log('\n--- FIRST SUBMISSION (should create new lead) ---');
    await submitForm({
      firstName: 'Unique',
      lastName: `TestUser${timestamp}`,
      jobTitle: 'Unique Test Manager',
      email: uniqueEmail,
      companyName: `Unique Corp ${timestamp}`,
      notes: 'First submission - should create new lead with unique data'
    });
    
    console.log('\n--- SECOND SUBMISSION (should add task to existing lead) ---');
    await submitForm({
      firstName: 'Unique',
      lastName: `TestUser${timestamp}`,
      jobTitle: 'Unique Test Manager',
      email: uniqueEmail,
      companyName: `Unique Corp ${timestamp}`,
      notes: 'Second submission - should create task on existing lead'
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testUniqueSubmission();
