# Lead Intake API - Developer Reference

## What This API Does
Submits lead information to Salesforce with smart duplicate handling:
- **First submission**: Creates a new lead in Salesforce
- **Duplicate email**: Creates a follow-up task on the existing lead instead of duplicate

## Endpoint
```
POST https://salesforce-lead-intake-api.vercel.app/api/submit-lead
```

## Authentication
Pre-configured - no API keys or tokens required for form submissions.

## Request Format
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@company.com",
  "jobTitle": "Marketing Manager",
  "companyName": "Acme Corp",
  "notes": "Interested in enterprise solution"
}
```

## Field Mapping
| Form Field | API Field | Required | Notes |
|------------|-----------|----------|--------|
| First Name | `firstName` | Yes | |
| Last Name | `lastName` | Yes | |
| Email | `email` | Yes | Used for duplicate detection |
| Job Title | `jobTitle` or `title` | Yes | Both field names accepted |
| Company | `companyName` or `company` | Yes | Both field names accepted |
| Notes/Message | `notes` | No | Saved as lead description |

## Response Examples

**Success (200)**
```json
{
  "success": true,
  "message": "Thank you! Your information has been submitted."
}
```

**Error (500)**
```json
{
  "success": false,
  "message": "Sorry, there was an error. Please try again.",
  "error": "Specific error details"
}
```

## Quick Tips
- **CORS enabled** - can call from any domain
- **Duplicate handling** - same email creates follow-up task instead of duplicate lead
- **Content-Type** - send as `application/json`
- **Method** - POST only (OPTIONS supported for preflight)

## Test with cURL
```bash
curl -X POST https://salesforce-lead-intake-api.vercel.app/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "jobTitle": "Developer",
    "companyName": "Test Corp"
  }'
```
