# Salesforce Lead Management API

A secure Node.js application that handles form submissions and automatically creates leads in Salesforce with intelligent duplicate detection.

## 🚀 What This Does

- **Receives form submissions** from websites via API endpoint
- **Checks for existing leads** by email to prevent duplicates
- **Creates new leads** in Salesforce or adds tasks to existing ones
- **Handles authentication** securely with environment variables
- **Supports both sandbox and production** Salesforce environments

## 📁 Project Structure

```
├── salesforce-form-handler.js     # Core Salesforce integration logic
├── interactive-lead-creator.js    # Interactive testing script
├── api-server-example.js          # API server for web integration
├── package.json                   # Project dependencies
├── .env.example                   # Template for environment variables
├── .gitignore                     # Security protection (excludes .env)
├── SALESFORCE-SETUP.md           # Detailed Salesforce configuration
├── DESIGNER-INSTRUCTIONS.md      # Instructions for web designers
└── README.md                     # This file
```

## 🛠️ Setup

### 1. Clone and Install
```bash
git clone [your-repo-url]
cd salesforce-lead-api
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the template
cp .env.example .env

# Edit .env with your Salesforce credentials
# See SALESFORCE-SETUP.md for detailed instructions
```

### 3. Test the Integration
```bash
# Run interactive testing
node salesforce-form-handler.js

# Or test directly
node interactive-lead-creator.js
```

## 🌐 API Usage

### For Web Designers & Developers

This project provides an API endpoint that websites can use to submit leads to Salesforce.

#### API Endpoint
```
POST /api/submit-lead
```

#### Required Fields
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "jobTitle": "Manager",
  "companyName": "ABC Corp",
  "notes": "Interested in your services"
}
```

#### Example Form Integration
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

#### JavaScript Integration
```javascript
const response = await fetch('https://your-api-domain.com/api/submit-lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

const result = await response.json();
console.log(result.success ? 'Success!' : 'Error occurred');
```

## 🚀 Deployment

### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set SF_CLIENT_ID=your_client_id
heroku config:set SF_CLIENT_SECRET=your_client_secret
heroku config:set SF_USERNAME=your_username
heroku config:set SF_PASSWORD=your_password
heroku config:set SF_SECURITY_TOKEN=your_token
heroku config:set SF_ENVIRONMENT=sandbox
git push heroku main
```

### Option 2: Vercel
```bash
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard
```

### Option 3: Railway
```bash
# Connect GitHub repo to Railway
# Add environment variables in Railway dashboard
```

## 🔧 Environment Variables

Required environment variables (add to your hosting platform):

```bash
SF_CLIENT_ID=your_salesforce_client_id
SF_CLIENT_SECRET=your_salesforce_client_secret
SF_USERNAME=your_salesforce_username
SF_PASSWORD=your_salesforce_password
SF_SECURITY_TOKEN=your_salesforce_security_token
SF_ENVIRONMENT=sandbox  # or 'production'
```

## 🎯 How It Works

```
Website Form → API Endpoint → Salesforce Integration → Your Salesforce
     ↓              ↓                ↓                    ↓
  Designer's     Your hosted      Your smart           Leads appear
  contact form   API server       logic runs           automatically
```

### The Smart Logic
1. **Authentication**: Securely connects to Salesforce using OAuth
2. **Duplicate Detection**: Checks if lead already exists by email
3. **Smart Actions**:
   - **New email**: Creates a new lead
   - **Existing email**: Adds a task to the existing lead
4. **Error Handling**: Gracefully handles and logs any issues

## 👥 Team Usage

### For Designers
- See `DESIGNER-INSTRUCTIONS.md` for form integration
- No Salesforce access needed
- Just point forms to your API endpoint

### For Developers
- Use the `submitForm()` function in your applications
- Extend the API with additional endpoints as needed
- All Salesforce complexity is handled for you

## 🔒 Security Features

- ✅ **Environment variables**: No secrets in code
- ✅ **CORS enabled**: Allows cross-origin requests
- ✅ **Input validation**: Protects against malformed data
- ✅ **Error handling**: Doesn't expose sensitive information
- ✅ **Gitignore protection**: `.env` never gets committed

## 📚 Additional Documentation

- **[SALESFORCE-SETUP.md](./SALESFORCE-SETUP.md)**: Step-by-step Salesforce configuration
- **[DESIGNER-INSTRUCTIONS.md](./DESIGNER-INSTRUCTIONS.md)**: Instructions for web designers

## 🧪 Testing

### Manual Testing
```bash
# Run the interactive script
node salesforce-form-handler.js
```

### API Testing
```bash
# Start the server
node api-server-example.js

# Test with curl
curl -X POST http://localhost:3000/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","companyName":"Test Corp"}'
```

## 🆘 Support

If you encounter issues:

1. **Check your `.env` file** - Ensure all variables are set correctly
2. **Verify Salesforce credentials** - Test login in Salesforce directly
3. **Check the logs** - The application provides detailed error messages
4. **Test the API endpoint** - Visit `/api/health` to verify the server is running

## 📄 License

This project is intended for internal use. Modify and distribute as needed for your organization.

---

**Ready to collect leads effortlessly!** 🎯
