# Tailwind CSS Removal

No, this project doesn't use Tailwind CSS - it uses Bootstrap.

## Issue

The error message indicates that the build is still trying to use Tailwind CSS as a PostCSS plugin:

```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. 
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS 
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

## Solution

I've created two scripts to fix this:

1. `install-deps.sh` - Updated to clean node_modules and rebuild from scratch
2. `remove-tailwind.sh` - A new script specifically to remove all Tailwind references

## How to Fix

Run the remove-tailwind.sh script:

```bash
chmod +x remove-tailwind.sh
./remove-tailwind.sh
```

This will:
1. Remove the tailwind.config.js file
2. Clean the node_modules directory and package-lock.json
3. Reinstall all dependencies without Tailwind
4. Build the project

## What's Changed

1. Updated postcss.config.js to use a simpler configuration
2. Removed tailwind.config.js
3. Ensured no Tailwind directives in index.css
4. Created scripts to properly clean and rebuild the project
