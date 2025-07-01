# Utility Scripts

This directory contains utility scripts for managing and debugging the Salesforce integration.

## Scripts

- **`check-available-objects.js`** - Checks what Salesforce objects are available to the authenticated user
- **`check-tasks.js`** - Queries and displays tasks associated with leads
- **`debug-task-visibility.js`** - Comprehensive debugging script for task visibility issues
- **`interactive-lead-creator.js`** - Interactive CLI tool for creating leads with user input
- **`test-production-creds.sh`** - Shell script to test production Salesforce credentials

## Usage

Make sure you have your `.env` file configured with the proper Salesforce credentials before running any scripts.

```bash
# Run from the project root directory
node scripts/script-name.js
```

For the shell script:
```bash
chmod +x scripts/test-production-creds.sh
./scripts/test-production-creds.sh
```
