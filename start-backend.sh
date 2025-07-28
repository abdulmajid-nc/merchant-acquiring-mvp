#!/bin/bash
# Script to start the backend server only

cd "$(dirname "$0")/backend"
echo "Starting backend..."
npm start
