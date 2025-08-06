#!/bin/bash
cd "$(dirname "$0")/backend"
export DB_TYPE="jpts"
export JPTS_HOST="localhost"
export JPTS_PORT="5432"
export JPTS_DB="jpts_dev"
export JPTS_USER="postgres"
export JPTS_PASSWORD="postgres"

echo "Starting backend server on http://localhost:4000..."
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Starting Node.js app directly..."
if [ -f "app.js" ]; then
    node app.js
else
    echo "ERROR: app.js not found in $(pwd)"
    ls -la
fi
