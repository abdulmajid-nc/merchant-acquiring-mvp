#!/bin/bash
# Start the backend and frontend locally, log output, and stop on close

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOGFILE="run-local.log"

# Start backend
cd "$BACKEND_DIR"
echo "Starting backend..." | tee -a "$LOGFILE"
npm install >> "$LOGFILE" 2>&1
npm start >> "$LOGFILE" 2>&1 &
BACKEND_PID=$!


# Start frontend
cd "$FRONTEND_DIR"
echo "Compiling frontend..." | tee -a "$LOGFILE"
npm install >> "$LOGFILE" 2>&1
npm run build >> "$LOGFILE" 2>&1
echo "Starting frontend..." | tee -a "$LOGFILE"
npm start >> "$LOGFILE" 2>&1 &
FRONTEND_PID=$!

trap 'echo "Stopping servers..." | tee -a "$LOGFILE"; kill $BACKEND_PID $FRONTEND_PID; exit 0' SIGINT SIGTERM


# Wait for backend to start
sleep 2
if ps -p $BACKEND_PID > /dev/null; then
  echo "Backend started successfully (PID: $BACKEND_PID)" | tee -a "$LOGFILE"
else
  echo "Backend failed to start." | tee -a "$LOGFILE"
fi

# Wait for frontend to start
sleep 2
if ps -p $FRONTEND_PID > /dev/null; then
  echo "Frontend started successfully (PID: $FRONTEND_PID)" | tee -a "$LOGFILE"
else
  echo "Frontend failed to start." | tee -a "$LOGFILE"
fi

echo "Servers running. Press Ctrl+C to stop. Logs are in $LOGFILE."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
