#!/bin/bash
cd "$(dirname "$0")/frontend"

echo "Starting frontend development server on http://localhost:3000..."
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

if [ -f "package.json" ]; then
    echo "Found package.json, checking start script..."
    if grep -q "\"start\":" package.json; then
        echo "Found start script, running npm start..."
        npm start
    else
        echo "ERROR: No start script found in package.json"
        cat package.json
    fi
else
    echo "ERROR: package.json not found in $(pwd)"
    ls -la
fi
