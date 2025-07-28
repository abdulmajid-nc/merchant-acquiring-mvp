#!/bin/bash
# Script to start the frontend server only

cd "$(dirname "$0")/frontend"
echo "Starting frontend..."
npm start
