# Dependency Installation Guide

This guide helps you fix the dependency issues related to react-datepicker and Bootstrap configuration.

## Issues Fixed

1. Missing `react-datepicker` package
2. Missing `react-datepicker/dist/react-datepicker.css` file
3. PostCSS configuration error (incorrectly trying to use Tailwind CSS)

## Steps to Fix

1. Run the installation script:

```bash
cd /home/abdulmajid/merchant-acquiring-mvp/frontend
chmod +x install-deps.sh
./install-deps.sh
```

2. If you still encounter issues, try the following manual steps:

```bash
cd /home/abdulmajid/merchant-acquiring-mvp/frontend
npm install react-datepicker@latest
npm run build
```

## What Changed

1. Added `react-datepicker` to package.json
2. Fixed the imports in MerchantPricing.js
3. Simplified PostCSS configuration to only use autoprefixer
4. Removed Tailwind CSS references (your project is using Bootstrap, not Tailwind)
5. Updated the DatePicker component in MerchantPricing.js

After running the installation script, your application should build without errors.

## Why This Fix Works

The errors were occurring because:
1. The react-datepicker package was missing
2. The PostCSS configuration was incorrectly trying to use Tailwind CSS, but your project is using Bootstrap
3. By removing the incorrect Tailwind references and installing only what's needed, we've fixed the build errors
