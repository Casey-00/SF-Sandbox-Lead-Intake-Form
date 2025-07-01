# Test Files

This directory contains various test scripts for validating the Salesforce integration functionality.

## Test Scripts

- **`complete-api-test.js`** - Comprehensive API testing including authentication and CRUD operations
- **`detailed-form-test.js`** - Tests form submission scenarios with detailed logging
- **`fresh-test.js`** - Tests creating fresh leads to verify basic functionality
- **`simulate-form-submission.js`** - Simulates web form submissions to the API
- **`test-task-configurations.js`** - Tests task creation and configuration scenarios
- **`unique-test.js`** - Tests unique lead creation and duplicate handling
- **`verify-fresh-lead.js`** - Verifies fresh lead creation and retrieval

## Usage

All test scripts require proper environment configuration. Run from the project root:

```bash
# Example usage
node tests/complete-api-test.js
node tests/simulate-form-submission.js
```

## Testing Strategy

These tests cover:
- Authentication flows (Username-Password and Client Credentials)
- Lead creation and duplicate detection
- Task creation and association
- API endpoint validation
- Error handling scenarios
