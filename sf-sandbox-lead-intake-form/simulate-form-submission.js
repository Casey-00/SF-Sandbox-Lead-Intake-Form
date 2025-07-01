const axios = require('axios');

async function simulateFormSubmission() {
  // Create a unique email to simulate the lead submission
  const timestamp = Date.now();
  const email = `test.lead.${timestamp}@example.com`;
  const firstName = 'Test';
  const lastName = 'Lead';
  
  try {
    console.log(`🧪 Simulating form submission with email: ${email}`);
    console.log('\n--- FIRST SUBMISSION (should create new lead) ---');
    await axios.post('https://salesforce-lead-intake-api.vercel.app/api/submit-lead', {
        firstName,
        lastName,
        email,
        jobTitle: 'Tester',
        companyName: 'Test Company',
        notes: 'First submission to create a new lead'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    console.log('✅ First submission successful! Lead created.');

    console.log('\n--- SECOND SUBMISSION (should add task to existing lead) ---');
    await axios.post('https://salesforce-lead-intake-api.vercel.app/api/submit-lead', {
        firstName,
        lastName,
        email,
        jobTitle: 'Tester',
        companyName: 'Test Company',
        notes: 'Second submission to add a task'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    console.log('✅ Second submission successful! Task added.');

  } catch (error) {
    console.error('❌ Error during form submission simulation:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

simulateFormSubmission();
