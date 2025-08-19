#!/bin/bash
# reset-and-seed-remote.sh
# This script sets environment variables for Render Postgres, then runs the reset-and-seed.js script.

# Set these to your Render Postgres credentials
export JPTS_HOST=dpg-d2hig3v5r7bs7385av80-a.oregon-postgres.render.com
export JPTS_PORT=5432
export JPTS_DB=jpts_dev
export JPTS_USER=jpts_dev_user
export JPTS_PASSWORD=DEzQ7gfH0CiLvptQg4cymcWmlMBVkMyj
export DB_TYPE=jpts

# Move to backend directory
cd "$(dirname "$0")"

LOG_FILE="seed-remote.log"
echo "Starting remote seeding process at $(date)" > $LOG_FILE

echo "Initializing database tables..."
node init-jpts-data.js 2>&1 | tee -a $LOG_FILE
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "Error: Failed to initialize database tables" | tee -a $LOG_FILE
    exit 1
fi

echo "Seeding MCCs..."
node seed-mccs.js 2>&1 | tee -a $LOG_FILE
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "Error: Failed to seed MCCs" | tee -a $LOG_FILE
    exit 1
fi

echo "Seeding realistic data..."
node seed-realistic-data.js 2>&1 | tee -a $LOG_FILE
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "Error: Failed to seed realistic data" | tee -a $LOG_FILE
    exit 1
fi

echo "Seeding transactions..."
node seed-transactions.js 2>&1 | tee -a $LOG_FILE
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "Error: Failed to seed transactions" | tee -a $LOG_FILE
    exit 1
fi

echo "All seeding completed successfully!" | tee -a $LOG_FILE
echo "Log file saved to $LOG_FILE"
