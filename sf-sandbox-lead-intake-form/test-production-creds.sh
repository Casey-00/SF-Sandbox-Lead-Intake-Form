#!/bin/bash

echo "Production Salesforce Connection Test"
echo "====================================="

echo -n "Enter production Client ID: "
read SF_CLIENT_ID

echo -n "Enter production Client Secret: "
read -s SF_CLIENT_SECRET
echo

echo -n "Enter Integration User Username: "
read SF_USERNAME

echo -n "Enter Integration User Password (including security token): "
read -s SF_PASSWORD
echo

echo "Setting login URL to production..."
SF_LOGIN_URL="https://login.salesforce.com"

echo
echo "Testing connection..."

export SF_CLIENT_ID SF_CLIENT_SECRET SF_USERNAME SF_PASSWORD SF_LOGIN_URL

node debug-sf-connection.js
