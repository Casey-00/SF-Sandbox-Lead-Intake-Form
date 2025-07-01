require('dotenv').config();
const { submitForm } = require('./salesforce-form-handler');

async function testFreshLead() {
  const testEmail = `fresh.test.${Date.now()}@example.com`; // Unique email
  
  console.log('🧪 Testing with fresh email:', testEmail);
  console.log('\n--- FIRST SUBMISSION (should create new lead) ---');
  
  try {
    await submitForm({
      firstName: 'Fresh',
      lastName: 'TestLead',
      email: testEmail,
      jobTitle: 'Test Manager',
      companyName: 'Fresh Corp',
      notes: 'First submission - should create new lead'
    });
    
    console.log('\n--- SECOND SUBMISSION (should create task) ---');
    
    await submitForm({
      firstName: 'Fresh',
      lastName: 'TestLead', 
      email: testEmail,
      jobTitle: 'Test Manager',
      companyName: 'Fresh Corp',
      notes: 'Second submission - should create task on existing lead'
    });
    
    console.log('\n✅ Both submissions completed!');
    console.log('Now checking what was actually created...');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testFreshLead();
