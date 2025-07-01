const readline = require('readline');
const { submitForm } = require('./salesforce-form-handler');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function interactiveLeadCreator() {
  console.log('\n🚀 Welcome to the Salesforce Lead Creator!');
  console.log('Please enter the lead information:\n');

  try {
    const firstName = await askQuestion('First Name: ');
    const lastName = await askQuestion('Last Name: ');
    const email = await askQuestion('Email: ');
    const jobTitle = await askQuestion('Job Title: ');
    const companyName = await askQuestion('Company Name: ');
    const notes = await askQuestion('Notes (optional): ');

    console.log('\n📋 Lead Information:');
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Email: ${email}`);
    console.log(`Title: ${jobTitle}`);
    console.log(`Company: ${companyName}`);
    console.log(`Notes: ${notes || 'None'}\n`);

    const confirm = await askQuestion('Submit this lead to Salesforce? (y/n): ');
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      console.log('\n🔄 Submitting to Salesforce...\n');
      
      await submitForm({
        firstName,
        lastName,
        jobTitle,
        email,
        companyName,
        notes: notes || 'Lead created via interactive script'
      });
      
      console.log('\n✨ Process complete!');
    } else {
      console.log('\n❌ Submission cancelled.');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    rl.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  interactiveLeadCreator();
}

module.exports = { interactiveLeadCreator };
