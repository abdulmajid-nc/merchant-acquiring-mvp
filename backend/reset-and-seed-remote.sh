#!/bin/bash
# reset-and-seed-remote.sh
# This script sets environment variables for Render Postgres, then runs the reset-and-seed.js script.

# Set these to your Render Postgres credentials
export JPTS_HOST=dpg-d2hig3v5r7bs7385av80-a.oregon-postgres.render.com
export JPTS_PORT=5432
export JPTS_DB=jpts_dev
export JPTS_USER=jpts_dev_user
export JPTS_PASSWORD=DEzQ7gfH0CiLvptQg4cymcWmlMBVkMyj

# Move to backend directory
cd "$(dirname "$0")"

# Ensure core tables exist in the remote DB
node init-jpts-data.js

# Run the reset-and-seed script
node reset-and-seed.js
