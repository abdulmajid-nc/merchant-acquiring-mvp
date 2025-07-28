#!/bin/bash

# Clean up script to remove Tailwind CSS and fix build issues
cd /home/abdulmajid/merchant-acquiring-mvp/frontend

echo "Removing Tailwind configuration files..."
rm -f tailwind.config.js

echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Installing only required dependencies..."
npm install

echo "Installing react-datepicker..."
npm install react-datepicker@latest

echo "Building project..."
npm run build

echo ""
echo "If the build was successful, the project is now properly configured without Tailwind CSS."
echo "The application uses Bootstrap for styling."
