# Salesforce Form Handler 🚀

## Overview
This project handles web form submissions for the **"Lead Intake Form"** Connected App in **Salesforce Sandbox**. It creates leads in Salesforce or adds tasks to existing leads. Perfect for teams to share and use!

**Note:** This is configured for Salesforce Sandbox environment.

## Features
- ✅ Creates new leads with LeadSource = "Web"
- ✅ Prevents duplicates by adding tasks to existing leads
- ✅ Secure .env file management
- ✅ Works with both sandbox and production
- ✅ Interactive lead creator for testing
- ✅ Team-friendly setup

## Quick Start

### 1. Clone and Setup
```bash
git clone [your-repo-url]
cd salesforce-form-handler
npm run setup
```

### 2. Configure Your Credentials
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual Salesforce credentials
# (Don't worry, .env is in .gitignore so it won't be committed)
```

### 3. Fill in your .env file:
```bash
# Connected App Credentials (from Salesforce Setup)
SF_CLIENT_ID=your_actual_client_id
SF_CLIENT_SECRET=your_actual_client_secret

# Your Salesforce Login
SF_USERNAME=your_username@company.com
SF_PASSWORD=your_password
SF_SECURITY_TOKEN=your_security_token

# Environment: 'production' or 'sandbox'
SF_ENVIRONMENT=production
```

### 4. Test It Out!
```bash
# Interactive lead creator (perfect for testing)
npm run create-lead

# Or run the main script
npm start
```

## Usage in Your Code
```javascript
const { submitForm } = require('./salesforce-form-handler');

submitForm({
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'CEO',
  email: 'john.doe@company.com',
  companyName: 'Example Corp',
  notes: 'Lead from contact form'
});
```

## File Structure
```
├── salesforce-form-handler.js    # Main handler
├── interactive-lead-creator.js    # Interactive testing tool
├── .env.example                   # Template for credentials
├── .env                          # Your actual credentials (gitignored)
├── .gitignore                    # Protects your secrets
├── package.json                  # Dependencies and scripts
└── SALESFORCE-SETUP.md           # This guide
```

## Scripts
- `npm run setup` - Install dependencies and show setup message
- `npm run create-lead` - Interactive lead creator (great for testing)
- `npm start` - Run the main script

## Salesforce Setup Requirements

### Connected App Setup:
1. Go to Salesforce Setup → App Manager
2. Create New Connected App
3. Enable OAuth Settings
4. Selected OAuth Scopes: "Access and manage your data (api)"
5. Callback URL: Not required for this flow
6. Save and get your Client ID and Secret

### Security Token:
1. Go to Setup → My Personal Information → Reset My Security Token
2. Check your email for the token

## Security Features
- ✅ `.env` files keep secrets local
- ✅ `.gitignore` prevents committing credentials
- ✅ Environment-based configuration
- ✅ No hardcoded secrets in code

## Team Sharing & Security 🔒

**Important:** When you push this repo to GitHub, your credentials stay safe!

### What Gets Shared:
- ✅ All the code files
- ✅ `.env.example` (template with placeholders)
- ✅ Documentation and setup instructions

### What Stays Private:
- ❌ Your actual `.env` file (protected by `.gitignore`)
- ❌ Your Salesforce credentials
- ❌ Any sensitive information

### For Team Members:
When someone clones your repo, they get the code but **must provide their own Salesforce credentials**. They need:
1. Access to the "Lead Intake Form" Connected App
2. Their own Salesforce sandbox/production login
3. To create their own `.env` file

This setup is perfect for teams because:
- Each person has their own `.env` file with their credentials
- The code is the same for everyone
- No secrets are ever committed to git
- Easy onboarding with `npm run setup`

## Troubleshooting
- **"invalid_client_id"** - Check your Client ID in .env
- **"invalid_grant"** - Check username/password/security token
- **Environment issues** - Make sure SF_ENVIRONMENT is set correctly
