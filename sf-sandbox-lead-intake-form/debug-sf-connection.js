// Debug script to test Salesforce connection
const { submitForm } = require('./salesforce-form-handler');

async function testConnection() {
  console.log('🧪 Testing Salesforce connection...');
  console.log('Environment variables:');
  console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('SF_CLIENT_SECRET:', process.env.SF_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('SF_USERNAME:', process.env.SF_USERNAME ? '✅ Set' : '❌ Missing');
  console.log('SF_PASSWORD:', process.env.SF_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('SF_SECURITY_TOKEN:', process.env.SF_SECURITY_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('SF_LOGIN_URL:', process.env.SF_LOGIN_URL || '❌ Missing');
  console.log('');

  try {
    await submitForm({
      firstName: 'Debug',
      lastName: 'Test',
      email: 'debug.test@example.com',
      jobTitle: 'Test Engineer',
      companyName: 'Debug Corp',
      notes: 'This is a debug test from local script'
    });
    console.log('✅ Success! Lead should be created in Salesforce.');
  } catch (error) {
    console.error('❌ Error details:', error);
  }
}

testConnection();
