// YOUR API server (hosted by you)
const express = require('express');
const cors = require('cors');
const { submitForm } = require('./salesforce-form-handler'); // Your existing code!

const app = express();
app.use(express.json());
app.use(cors()); // Allow website to call your API

// This endpoint receives form submissions from ANY website
app.post('/api/submit-lead', async (req, res) => {
  try {
    console.log('📨 Received form submission from website...');
    
    // Use YOUR existing Salesforce logic
    await submitForm({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      notes: req.body.notes
    });
    
    console.log('✅ Successfully sent to YOUR Salesforce!');
    res.json({ 
      success: true, 
      message: 'Thank you! Your information has been submitted.' 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, there was an error. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Your API server is running on port ${PORT}`);
  console.log(`📡 Website forms can submit to: http://localhost:${PORT}/api/submit-lead`);
});

module.exports = app;
