#!/bin/bash

# Stop any running backend process
echo "🛑 Stopping any running backend processes..."
pid=$(lsof -t -i:4000)
if [ ! -z "$pid" ]; then
  echo "Killing process $pid"
  kill -9 $pid
fi

# Start the backend
echo "🚀 Starting backend server..."
cd /home/abdulmajid/merchant-acquiring-mvp
./start-backend.sh
