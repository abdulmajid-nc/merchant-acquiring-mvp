#!/bin/bash
# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Configure database environment variables
export DB_TYPE="jpts"
export JPTS_HOST="localhost"
export JPTS_PORT="5432"
export JPTS_DB="jpts_dev"
export JPTS_USER="postgres"
export JPTS_PASSWORD="postgres"

# Increase Node.js memory limit for better performance
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🚀 Starting backend server on http://localhost:4000..."
echo "📂 Current directory: $(pwd)"
echo "💻 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"

# Start the backend server
if [ -f "app.js" ]; then
    echo "✅ Found app.js, starting Node.js server..."
    
    # Check if nodemon is available for auto-reloading
    if npm list -g nodemon >/dev/null 2>&1 || [ -d "node_modules/nodemon" ]; then
        echo "🔄 Using nodemon for auto-reloading"
        nodemon app.js
    else
        echo "⚡ Starting Node.js app directly..."
        node app.js
    fi
else
    echo "❌ ERROR: app.js not found in $(pwd)"
    ls -la
fi
