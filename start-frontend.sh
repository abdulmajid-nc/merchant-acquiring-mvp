#!/bin/bash
# Navigate to the frontend directory
cd "$(dirname "$0")/frontend"

# Show startup information
echo "🚀 Starting frontend development server on http://localhost:3000..."
echo "📂 Current directory: $(pwd)"
echo "💻 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"

# Export environment variables to avoid issues
export NODE_OPTIONS=--max_old_space_size=4096
export CI=false  # Prevents failures from treating warnings as errors

# Check for package.json and start the application
if [ -f "package.json" ]; then
    echo "✅ Found package.json, checking start script..."
    if grep -q "\"start\":" package.json; then
        echo "🚀 Found start script, running npm start..."
        
        # Skip create-react-app's console clearing
        export FORCE_COLOR=true
        
        # Use cross-env to ensure environment variables work across platforms
        npm start
    else
        echo "❌ ERROR: No start script found in package.json"
        cat package.json
    fi
else
    echo "❌ ERROR: package.json not found in $(pwd)"
    ls -la
fi
