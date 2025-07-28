#!/bin/bash
# Start the backend and frontend locally, display logs, and stop on close

# Color definitions for better log visualization
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOGFILE="$ROOT_DIR/run-local.log"

echo -e "${YELLOW}Starting local development environment...${NC}"
echo -e "${YELLOW}Logs will be displayed in the terminal and also saved to $LOGFILE${NC}"

# Clean up old processes if they exist
cleanup() {
  echo -e "${YELLOW}Cleaning up and stopping servers...${NC}"
  [[ -n $BACKEND_PID ]] && kill $BACKEND_PID 2>/dev/null
  [[ -n $FRONTEND_PID ]] && kill $FRONTEND_PID 2>/dev/null
  [[ -n $BACKEND_LOG_PID ]] && kill $BACKEND_LOG_PID 2>/dev/null
  [[ -n $FRONTEND_LOG_PID ]] && kill $FRONTEND_LOG_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Create named pipes for logging
BACKEND_PIPE="/tmp/backend_pipe_$$"
FRONTEND_PIPE="/tmp/frontend_pipe_$$"
mkfifo $BACKEND_PIPE
mkfifo $FRONTEND_PIPE

# Function to start backend
start_backend() {
  echo -e "${GREEN}Installing backend dependencies...${NC}"
  cd "$BACKEND_DIR"
  npm install

  echo -e "${GREEN}Starting backend server...${NC}"
  node app.js > $BACKEND_PIPE 2>&1 &
  BACKEND_PID=$!

  # Start a process to read from the pipe and format output
  cat $BACKEND_PIPE | while read -r line; do
    echo -e "${GREEN}[BACKEND]${NC} $line" | tee -a "$LOGFILE"
  done &
  BACKEND_LOG_PID=$!
}

# Function to start frontend
start_frontend() {
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  cd "$FRONTEND_DIR"
  npm install

  echo -e "${BLUE}Starting frontend development server...${NC}"
  npm start > $FRONTEND_PIPE 2>&1 &
  FRONTEND_PID=$!

  # Start a process to read from the pipe and format output
  cat $FRONTEND_PIPE | while read -r line; do
    echo -e "${BLUE}[FRONTEND]${NC} $line" | tee -a "$LOGFILE"
  done &
  FRONTEND_LOG_PID=$!
}

# Start both services
start_backend
start_frontend

# Check if backend started successfully
sleep 3
if ps -p $BACKEND_PID > /dev/null; then
  echo -e "${GREEN}Backend started successfully (PID: $BACKEND_PID)${NC}" | tee -a "$LOGFILE"
else
  echo -e "${RED}Backend failed to start.${NC}" | tee -a "$LOGFILE"
  cleanup
fi

# Check if frontend started successfully
sleep 3
if ps -p $FRONTEND_PID > /dev/null; then
  echo -e "${BLUE}Frontend started successfully (PID: $FRONTEND_PID)${NC}" | tee -a "$LOGFILE"
else
  echo -e "${RED}Frontend failed to start.${NC}" | tee -a "$LOGFILE"
  cleanup
fi

# Print access information
echo -e "\n${YELLOW}======================================${NC}"
echo -e "${GREEN}Backend API:${NC} http://localhost:4000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}======================================${NC}"
echo -e "\n${YELLOW}Services are running. Press Ctrl+C to stop.${NC}"
echo -e "${YELLOW}All logs are being saved to $LOGFILE${NC}\n"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

# Clean up named pipes
rm -f $BACKEND_PIPE $FRONTEND_PIPE
