# Salesforce Lead Intake Form API - Project Documentation

## Project Overview
This project creates a secure API endpoint for handling lead submissions to Salesforce, deployed on Vercel with proper environment variable management.

## Key Project Files
- `api/submit-lead.js` - Main API endpoint for form submissions
- `api/health.js` - Health check endpoint
- `salesforce-form-handler.js` - Core Salesforce integration logic
- `README.md` - Comprehensive setup and usage documentation
- `.env.example` - Template for environment variables
- `.gitignore` - Protects secrets from being committed

## Live Deployment
- **Vercel URL**: https://sf-sandbox-lead-intake-form-[your-hash].vercel.app
- **API Endpoint**: `/api/submit-lead` (POST)
- **Health Check**: `/api/health` (GET)

## Environment Variables (Set in Vercel)
- `SF_CLIENT_ID` - Salesforce Connected App Consumer Key
- `SF_CLIENT_SECRET` - Salesforce Connected App Consumer Secret
- `SF_USERNAME` - Salesforce username
- `SF_PASSWORD` - Salesforce password
- `SF_SECURITY_TOKEN` - Salesforce security token
- `SF_LOGIN_URL` - https://test.salesforce.com (for sandbox)

## API Features
- **OAuth2 Authentication** with Salesforce
- **Duplicate Detection** - Checks for existing leads by email
- **Smart Data Handling**:
  - New leads: Creates lead with Description field from notes
  - Existing leads: Adds task instead of duplicating
- **Security**: All credentials stored as environment variables

## Form Fields Supported
- `firstName` (required)
- `lastName` (required)
- `email` (required)
- `companyName` (optional)
- `jobTitle` (optional)
- `notes` (optional)

## Testing Commands Used
```bash
# Health check
curl https://your-vercel-url.vercel.app/api/health

# Submit lead
curl -X POST https://your-vercel-url.vercel.app/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "companyName": "Test Company",
    "jobTitle": "Developer",
    "notes": "This is a test submission"
  }'
```

## Troubleshooting Steps Completed
1. **Fixed Vercel deployment scope** - Created dedicated project directory
2. **Resolved authentication issues** - Re-logged into Vercel via GitHub
3. **Fixed SF_LOGIN_URL errors** - Added https:// prefix to sandbox URL
4. **Environment variable management** - Properly set in Production environment
5. **Enhanced notes handling** - Updated to store in Description field for new leads

## Security Best Practices Implemented
- No secrets in code repository
- Environment variables used for all credentials
- `.env` file properly git-ignored
- Secure OAuth2 flow with Salesforce

## V0 Form Integration Prompt
For creating a frontend form in V0 that submits to this API:

"Create a lead intake form with fields for firstName, lastName, email, companyName, jobTitle, and notes. The form should POST to https://your-vercel-url.vercel.app/api/submit-lead with JSON data. Include proper validation, loading states, and success/error messaging. Style it professionally for business lead capture."

## Next Steps for Future Reference
1. Monitor Vercel logs for any issues
2. Test form submissions regularly
3. Update Salesforce credentials if they change
4. Scale to production Salesforce org when ready
5. Add additional fields as needed

## GitHub Repository
https://github.com/Casey-00/SF-Sandbox-Lead-Intake-Form

## Important Notes
- All sensitive data is stored securely in Vercel environment variables
- The API automatically handles lead deduplication
- Deployment updates are automatic when pushing to main branch
- Form designers only need the API endpoint URL - no Salesforce access required
