#!/bin/bash
# Start jPTS, backend and frontend locally, display logs, and stop on close

# Color definitions for better log visualization
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOGFILE="$ROOT_DIR/run-local.log"

# Start with a clean log file
> "$LOGFILE"

echo -e "${YELLOW}Starting local development environment...${NC}" | tee -a "$LOGFILE"
echo -e "${YELLOW}Logs will be displayed in the terminal and also saved to $LOGFILE${NC}" | tee -a "$LOGFILE"

# Clean up old processes if they exist
cleanup() {
  echo -e "${YELLOW}Cleaning up and stopping servers...${NC}" | tee -a "$LOGFILE"
  
  # Kill process IDs we know about
  [[ -n $BACKEND_PID ]] && kill -15 $BACKEND_PID 2>/dev/null
  [[ -n $FRONTEND_PID ]] && kill -15 $FRONTEND_PID 2>/dev/null
  
  # Force-kill any remaining processes on our ports
  echo -e "${YELLOW}Ensuring ports are freed...${NC}" | tee -a "$LOGFILE"
  fuser -k 4000/tcp 2>/dev/null  # Backend port
  fuser -k 3000/tcp 2>/dev/null  # Frontend port
  
  # Clean up temp files
  rm -f $BACKEND_LOG $FRONTEND_LOG
  
  echo -e "${GREEN}Cleanup complete.${NC}" | tee -a "$LOGFILE"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Function to check jPTS connectivity (PostgreSQL)
check_jpts() {
    echo -e "${PURPLE}Checking PostgreSQL jPTS database connectivity...${NC}" | tee -a "$LOGFILE"
    
    # Check if PostgreSQL client is available
    if command -v psql &> /dev/null; then
        echo -e "${PURPLE}PostgreSQL client is installed, checking connection...${NC}" | tee -a "$LOGFILE"
        
        # Try to ping the PostgreSQL database
        if nc -z localhost 5432 &>/dev/null; then
            echo -e "${GREEN}PostgreSQL appears to be running on port 5432${NC}" | tee -a "$LOGFILE"
            
            # Try to connect to the specific database
            if PGPASSWORD="postgres" psql -h localhost -U postgres -d jpts_dev -c '\q' &>/dev/null; then
                echo -e "${GREEN}Successfully connected to jpts_dev database${NC}" | tee -a "$LOGFILE"
                return 0
            else
                echo -e "${YELLOW}Could not connect to jpts_dev database. Check credentials.${NC}" | tee -a "$LOGFILE"
                return 1
            fi
        else
            echo -e "${YELLOW}Cannot connect to PostgreSQL on port 5432.${NC}" | tee -a "$LOGFILE"
            return 1
        fi
    else
        echo -e "${YELLOW}PostgreSQL client (psql) not found.${NC}" | tee -a "$LOGFILE"
        return 1
    fi
}

# Function to initialize the database
initialize_database() {
    echo -e "${PURPLE}Configuring backend to use jPTS database...${NC}" | tee -a "$LOGFILE"
    
    # Export environment variables for database connection
    export DB_TYPE="jpts"
    export JPTS_HOST="localhost"
    export JPTS_PORT="5432"
    export JPTS_DB="jpts_dev"
    export JPTS_USER="postgres"
    export JPTS_PASSWORD="postgres"
    
    cd "$BACKEND_DIR"
    
    if [ -f "init-jpts-data.js" ]; then
        echo -e "${PURPLE}Initializing jPTS data structures...${NC}" | tee -a "$LOGFILE"
        node init-jpts-data.js | tee -a "$LOGFILE"
    else
        echo -e "${YELLOW}No init-jpts-data.js found, skipping initialization${NC}" | tee -a "$LOGFILE"
    fi
    
    # Seed MCC data for categorizing merchants
    if [ -f "seed-mccs.js" ]; then
        echo -e "${PURPLE}Seeding MCC data...${NC}" | tee -a "$LOGFILE"
        node seed-mccs.js | tee -a "$LOGFILE"
    else
        echo -e "${YELLOW}No seed-mccs.js found, skipping MCC seeding${NC}" | tee -a "$LOGFILE"
    fi
    
    # Seed realistic merchant data
    if [ -f "seed-realistic-data.js" ]; then
        echo -e "${PURPLE}Seeding realistic merchant and terminal data...${NC}" | tee -a "$LOGFILE"
        node seed-realistic-data.js | tee -a "$LOGFILE"
    else
        echo -e "${YELLOW}No seed-realistic-data.js found, skipping merchant seeding${NC}" | tee -a "$LOGFILE"
    fi
    
    # Seed transaction data without touching tranlog table
    if [ -f "run-seed-transactions.js" ]; then
        echo -e "${PURPLE}Seeding transaction data...${NC}" | tee -a "$LOGFILE"
        node run-seed-transactions.js | tee -a "$LOGFILE"
    else
        echo -e "${YELLOW}No run-seed-transactions.js found, skipping transaction seeding${NC}" | tee -a "$LOGFILE"
    fi
}

# Start services in the right order
echo -e "${YELLOW}Starting services...${NC}" | tee -a "$LOGFILE"

# Check jPTS connectivity
check_jpts
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to connect to jPTS database. Please make sure PostgreSQL is running.${NC}" | tee -a "$LOGFILE"
    exit 1
fi

# Initialize the database
initialize_database

# Install frontend dependencies if needed
echo -e "${BLUE}Installing frontend dependencies...${NC}" | tee -a "$LOGFILE"
cd "$FRONTEND_DIR"
if [ -f "./install-deps.sh" ]; then
    chmod +x ./install-deps.sh
    ./install-deps.sh | tee -a "$LOGFILE"
else
    npm ci --no-audit --no-fund || npm install | tee -a "$LOGFILE"
fi
cd "$ROOT_DIR"

# Create log files for backend and frontend
BACKEND_LOG="/tmp/backend_$$.log"
FRONTEND_LOG="/tmp/frontend_$$.log"

# Start backend using the script
echo -e "${GREEN}Starting backend server...${NC}" | tee -a "$LOGFILE"
chmod +x ./start-backend.sh
echo -e "${GREEN}Executing backend script...${NC}" | tee -a "$LOGFILE"
./start-backend.sh > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Wait a moment to make sure it's starting up
echo -e "${GREEN}Waiting for backend to start (PID: $BACKEND_PID)...${NC}" | tee -a "$LOGFILE"
sleep 5

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Failed to start backend. Check the log file for details.${NC}" | tee -a "$LOGFILE"
    echo -e "${RED}=== Backend Log Start ====${NC}" | tee -a "$LOGFILE"
    cat "$BACKEND_LOG" | tee -a "$LOGFILE"
    echo -e "${RED}=== Backend Log End ====${NC}" | tee -a "$LOGFILE"
    exit 1
fi
echo -e "${GREEN}Backend process is running.${NC}" | tee -a "$LOGFILE"

# Start frontend using the script
echo -e "${BLUE}Starting frontend server...${NC}" | tee -a "$LOGFILE"
chmod +x ./start-frontend.sh
echo -e "${BLUE}Executing frontend script...${NC}" | tee -a "$LOGFILE"
./start-frontend.sh > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Wait a moment to make sure it's starting up
echo -e "${BLUE}Waiting for frontend to start (PID: $FRONTEND_PID)...${NC}" | tee -a "$LOGFILE"
sleep 5

# Check if frontend is running
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}Failed to start frontend. Check the log file for details.${NC}" | tee -a "$LOGFILE"
    echo -e "${RED}=== Frontend Log Start ====${NC}" | tee -a "$LOGFILE"
    cat "$FRONTEND_LOG" | tee -a "$LOGFILE"
    echo -e "${RED}=== Frontend Log End ====${NC}" | tee -a "$LOGFILE"
    kill $BACKEND_PID
    exit 1
fi
echo -e "${BLUE}Frontend process is running.${NC}" | tee -a "$LOGFILE"

# If we got here, both are running
echo -e "${GREEN}Backend started successfully (PID: $BACKEND_PID)${NC}" | tee -a "$LOGFILE"
echo -e "${BLUE}Frontend started successfully (PID: $FRONTEND_PID)${NC}" | tee -a "$LOGFILE"

# Monitor log files in background
(tail -f "$BACKEND_LOG" | sed -e "s/^/${GREEN}[BACKEND]${NC} /" >> "$LOGFILE") &
(tail -f "$FRONTEND_LOG" | sed -e "s/^/${BLUE}[FRONTEND]${NC} /" >> "$LOGFILE") &

# Print access information
echo -e "\n${YELLOW}======================================${NC}" | tee -a "$LOGFILE"
echo -e "${PURPLE}jPTS Database:${NC} localhost:5432" | tee -a "$LOGFILE"
echo -e "${GREEN}Backend API:${NC} http://localhost:4000" | tee -a "$LOGFILE"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000" | tee -a "$LOGFILE"
echo -e "${YELLOW}======================================${NC}" | tee -a "$LOGFILE"
echo -e "\n${YELLOW}Services are running. Press Ctrl+C to stop.${NC}" | tee -a "$LOGFILE"

# Wait for processes to complete or until interrupted
wait $BACKEND_PID $FRONTEND_PID

# If we get here, one of the processes exited
echo -e "${YELLOW}One of the services has stopped. Cleaning up...${NC}" | tee -a "$LOGFILE"
cleanup
