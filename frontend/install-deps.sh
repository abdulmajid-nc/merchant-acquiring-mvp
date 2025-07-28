#!/bin/bash
cd /home/abdulmajid/merchant-acquiring-mvp/frontend
echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Installing react-datepicker..."
npm install react-datepicker@latest

echo "Building project..."
npm run build