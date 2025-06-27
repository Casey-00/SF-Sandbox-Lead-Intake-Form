# Designer Integration Instructions

## What You Need to Know

You're creating a contact form that will send data to our Salesforce system. Here's everything you need:

## 1. API Endpoint
Submit form data to: `https://your-api-domain.com/api/submit-lead`

## 2. Required Form Fields
Your form must include these fields with these exact names:

```html
<form>
  <input name="firstName" type="text" required>
  <input name="lastName" type="text" required>  
  <input name="email" type="email" required>
  <input name="jobTitle" type="text">
  <input name="companyName" type="text" required>
  <textarea name="notes"></textarea>
</form>
```

## 3. JavaScript Integration Example

### Option A: Simple HTML Form
```html
<form action="https://your-api-domain.com/api/submit-lead" method="POST">
  <input name="firstName" placeholder="First Name" required>
  <input name="lastName" placeholder="Last Name" required>
  <input name="email" placeholder="Email" required>
  <input name="jobTitle" placeholder="Job Title">
  <input name="companyName" placeholder="Company Name" required>
  <textarea name="notes" placeholder="How can we help?"></textarea>
  <button type="submit">Submit</button>
</form>
```

### Option B: JavaScript/AJAX Submission
```javascript
async function submitForm(formData) {
  try {
    const response = await fetch('https://your-api-domain.com/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        jobTitle: formData.get('jobTitle'),
        companyName: formData.get('companyName'),
        notes: formData.get('notes')
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Thank you! Your message has been sent.');
    } else {
      alert('Sorry, there was an error. Please try again.');
    }
  } catch (error) {
    alert('Sorry, there was an error. Please try again.');
  }
}

// Use with your form
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await submitForm(formData);
});
```

## 4. Expected Response
The API will respond with:
```json
{
  "success": true,
  "message": "Thank you! Your information has been submitted."
}
```

Or on error:
```json
{
  "success": false,
  "message": "Sorry, there was an error. Please try again."
}
```

## 5. Testing
- Test endpoint: `https://your-api-domain.com/api/health`
- Should return: `{"status": "API is running!"}`

## What You DON'T Need
- ❌ No Salesforce account access
- ❌ No API keys or credentials  
- ❌ No backend server setup
- ❌ No database configuration

The form just needs to send data to our API endpoint and handle the response!
