#!/bin/bash
# Optimized frontend dependencies installer

# Get directory dynamically (don't hardcode paths)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Progress indicators
echo "📦 Starting frontend dependency installation..."
echo "🧹 Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Set npm to non-interactive and less verbose to avoid hanging
export NPM_CONFIG_LOGLEVEL=error
export NPM_CONFIG_NO_PROGRESS=true
export NPM_CONFIG_COLOR=false

echo "📥 Installing core dependencies..."
npm install --no-audit --no-fund

echo "📥 Installing react-datepicker..."
npm install react-datepicker@latest --no-audit --no-fund

# Skip build during initial installation to speed up startup
# The main script will handle building if needed
echo "✅ Dependencies installed successfully!"