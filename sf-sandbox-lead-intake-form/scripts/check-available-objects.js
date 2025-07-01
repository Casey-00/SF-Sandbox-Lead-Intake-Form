require('dotenv').config();
const axios = require('axios');

async function checkAvailableObjects() {
    try {
        console.log('🔑 Authenticating with Salesforce...');
        
        // Get OAuth token using client credentials flow
        const authResponse = await axios.post(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, null, {
            params: {
                grant_type: 'client_credentials',
                client_id: process.env.SF_CLIENT_ID,
                client_secret: process.env.SF_CLIENT_SECRET
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const { access_token, instance_url } = authResponse.data;
        console.log('✅ Authentication successful!');
        
        // Get list of all available sobjects
        console.log('🔍 Fetching available sObjects...');
        const sobjectsResponse = await axios.get(`${instance_url}/services/data/v59.0/sobjects`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        
        const sobjects = sobjectsResponse.data.sobjects;
        console.log(`\n📊 Found ${sobjects.length} total sObjects`);
        
        // Filter for Lead-related objects
        const leadRelated = sobjects.filter(obj => 
            obj.name.toLowerCase().includes('lead') || 
            obj.label.toLowerCase().includes('lead')
        );
        
        console.log('\n🎯 Lead-related sObjects:');
        leadRelated.forEach(obj => {
            console.log(`  - ${obj.name} (${obj.label}) - Queryable: ${obj.queryable}, Createable: ${obj.createable}`);
        });
        
        // Check if standard Lead exists
        const standardLead = sobjects.find(obj => obj.name === 'Lead');
        if (standardLead) {
            console.log('\n✅ Standard Lead object is available:');
            console.log(`   Queryable: ${standardLead.queryable}`);
            console.log(`   Createable: ${standardLead.createable}`);
            console.log(`   Updateable: ${standardLead.updateable}`);
            console.log(`   Deletable: ${standardLead.deletable}`);
        } else {
            console.log('\n❌ Standard Lead object is NOT available');
        }
        
        // Also check Task object
        const taskObject = sobjects.find(obj => obj.name === 'Task');
        if (taskObject) {
            console.log('\n✅ Standard Task object is available:');
            console.log(`   Queryable: ${taskObject.queryable}`);
            console.log(`   Createable: ${taskObject.createable}`);
        } else {
            console.log('\n❌ Standard Task object is NOT available');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

checkAvailableObjects();
