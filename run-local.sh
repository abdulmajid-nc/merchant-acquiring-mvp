#!/bin/bash
# Start jPTS, backend and frontend locally, display logs, and stop on close
# Usage: ./run-local.sh [--skip-deps] [--skip-seed]

# Color definitions for better log visualization
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Parse command line arguments
SKIP_DEPS=false
SKIP_SEED=false

for arg in "$@"; do
  case $arg in
    --skip-deps)
      SKIP_DEPS=true
      shift
      ;;
    --skip-seed)
      SKIP_SEED=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOGFILE="$ROOT_DIR/run-local.log"

# Function to display usage information
show_usage() {
  echo -e "${YELLOW}Usage: ./run-local.sh [OPTIONS]${NC}"
  echo -e "${YELLOW}Options:${NC}"
  echo -e "  ${GREEN}--skip-deps${NC}   Skip frontend dependencies installation entirely"
  echo -e "  ${GREEN}--skip-seed${NC}   Skip database initialization and seeding"
  echo -e "  ${GREEN}--help${NC}        Show this help message"
}

# Handle help flag
for arg in "$@"; do
  if [ "$arg" = "--help" ]; then
    show_usage
    exit 0
  fi
done

# Start with a clean log file
> "$LOGFILE"

echo -e "${YELLOW}Starting local development environment...${NC}" | tee -a "$LOGFILE"
echo -e "${YELLOW}Logs will be displayed in the terminal and also saved to $LOGFILE${NC}" | tee -a "$LOGFILE"
if [ "$SKIP_DEPS" = true ]; then
  echo -e "${YELLOW}Skipping frontend dependencies installation (--skip-deps flag used)${NC}" | tee -a "$LOGFILE"
fi
if [ "$SKIP_SEED" = true ]; then
  echo -e "${YELLOW}Skipping database initialization and seeding (--skip-seed flag used)${NC}" | tee -a "$LOGFILE"
fi

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

# Function to check if tables need to be seeded (returns 1 if seeding needed, 0 if not)
need_seeding() {
    local count=$(PGPASSWORD="postgres" psql -h localhost -U postgres -d jpts_dev -t -c "
        SELECT COUNT(*) FROM merchants;
    " | tr -d ' ')
    
    # Only seed if we have fewer than 5 records (to save time)
    if [ "$count" -lt 5 ]; then
        return 0  # Need seeding (bash return 0 means success/true)
    else
        echo -e "${GREEN}Database already has $count merchants, skipping full seed process${NC}" | tee -a "$LOGFILE"
        return 1  # Don't need seeding (bash return 1 means failure/false)
    fi
}

# Function to truncate database tables
truncate_tables() {
    echo -e "${PURPLE}Truncating database tables to prevent duplicate data...${NC}" | tee -a "$LOGFILE"
    
    # Connect to PostgreSQL and truncate tables in the correct order (respecting foreign keys)
    # Use single transaction for speed and add NOWAIT for faster execution
    PGPASSWORD="postgres" psql -h localhost -U postgres -d jpts_dev --single-transaction -v ON_ERROR_STOP=1 -c "
        -- Disable foreign key checks temporarily
        SET CONSTRAINTS ALL DEFERRED;
        
        -- Truncate tables with cascading to handle foreign keys (all in one transaction)
        TRUNCATE TABLE transactions, terminals, merchants, mccs, 
                     audit_logs, applications, archived_accounts
        RESTART IDENTITY CASCADE;
        
        -- Re-enable foreign key checks
        SET CONSTRAINTS ALL IMMEDIATE;
    " > /dev/null 2>&1
    
    echo -e "${GREEN}Database tables truncated successfully${NC}" | tee -a "$LOGFILE"
}

# Function to initialize the database - optimized for speed
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
    
    # First, make sure tables exist by running initialization script
    if [ -f "init-jpts-data.js" ]; then
        echo -e "${PURPLE}Checking database structure...${NC}" | tee -a "$LOGFILE"
        node init-jpts-data.js > /dev/null 2>&1 &
        INIT_PID=$!
        wait $INIT_PID
    else
        echo -e "${YELLOW}No init-jpts-data.js found, skipping initialization${NC}" | tee -a "$LOGFILE"
    fi
    
    # Check if we need to seed data (saves time if database already has data)
    if need_seeding; then
        echo -e "${PURPLE}Database needs seeding, performing full seed operation...${NC}" | tee -a "$LOGFILE"
        
        # Truncate tables before seeding to prevent duplicate data
        truncate_tables
        
        # Prepare seed scripts in background processes for faster execution
        echo -e "${PURPLE}Starting seed operations in parallel...${NC}" | tee -a "$LOGFILE"
        
        # Start MCC seeding in background
        if [ -f "seed-mccs.js" ]; then
            echo -e "${PURPLE}Seeding MCC data...${NC}" | tee -a "$LOGFILE"
            node seed-mccs.js > /dev/null 2>&1 &
            MCC_PID=$!
        else
            echo -e "${YELLOW}No seed-mccs.js found, skipping MCC seeding${NC}" | tee -a "$LOGFILE"
        fi
        
        # Wait for MCC seeding to complete as merchants may depend on it
        if [ -n "$MCC_PID" ]; then
            wait $MCC_PID
        fi
        
        # Seed merchant data (sequential as it's required for transactions)
        if [ -f "seed-realistic-data.js" ]; then
            echo -e "${PURPLE}Seeding realistic merchant and terminal data...${NC}" | tee -a "$LOGFILE"
            node seed-realistic-data.js > /dev/null 2>&1
        else
            # Fallback to seed-transactions.js if available
            if [ -f "seed-transactions.js" ]; then
                echo -e "${PURPLE}Seeding basic merchant data...${NC}" | tee -a "$LOGFILE"
                node seed-transactions.js > /dev/null 2>&1
            else
                echo -e "${YELLOW}No merchant seeding scripts found${NC}" | tee -a "$LOGFILE"
            fi
        fi
        
        # Seed transaction data if needed
        if [ -f "run-seed-transactions.js" ]; then
            echo -e "${PURPLE}Seeding transaction data...${NC}" | tee -a "$LOGFILE"
            node run-seed-transactions.js > /dev/null 2>&1
        else
            echo -e "${YELLOW}No run-seed-transactions.js found, skipping transaction seeding${NC}" | tee -a "$LOGFILE"
        fi
        
        echo -e "${GREEN}Database seeding completed successfully${NC}" | tee -a "$LOGFILE"
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

# Initialize the database if not skipped
if [ "$SKIP_SEED" = true ]; then
    echo -e "${YELLOW}Skipping database initialization and seeding (--skip-seed flag used)${NC}" | tee -a "$LOGFILE"
else
    initialize_database
fi

# Check if we should install frontend dependencies
if [ "$SKIP_DEPS" = true ]; then
    echo -e "${YELLOW}Skipping frontend dependencies installation (--skip-deps flag used)${NC}" | tee -a "$LOGFILE"
elif [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies (first run only)...${NC}" | tee -a "$LOGFILE"
    cd "$FRONTEND_DIR"
    
    # Set a timeout for the dependency installation to prevent hanging
    if [ -f "./install-deps.sh" ]; then
        echo -e "${BLUE}Running install-deps.sh with a 120-second timeout...${NC}" | tee -a "$LOGFILE"
        chmod +x ./install-deps.sh
        timeout 120s ./install-deps.sh >> "$LOGFILE" 2>&1 || echo -e "${YELLOW}Install script timed out, continuing anyway...${NC}" | tee -a "$LOGFILE"
    else
        echo -e "${BLUE}Running npm install with a 120-second timeout...${NC}" | tee -a "$LOGFILE"
        # Use --no-progress and --silent for less verbose output
        timeout 120s npm install --no-audit --no-fund --no-progress >> "$LOGFILE" 2>&1 || echo -e "${YELLOW}NPM install timed out, continuing anyway...${NC}" | tee -a "$LOGFILE"
    fi
    cd "$ROOT_DIR"
    
    # Continue even if installation didn't complete
    if [ -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${GREEN}Frontend dependencies installed successfully${NC}" | tee -a "$LOGFILE"
    else
        echo -e "${YELLOW}Frontend dependencies may not be complete, but continuing...${NC}" | tee -a "$LOGFILE"
    fi
else
    echo -e "${GREEN}Frontend dependencies already installed, skipping...${NC}" | tee -a "$LOGFILE"
    cd "$ROOT_DIR"
fi

# Create log files for backend and frontend
BACKEND_LOG="/tmp/backend_$$.log"
FRONTEND_LOG="/tmp/frontend_$$.log"

# Start both backend and frontend processes in parallel
echo -e "${GREEN}Starting backend and frontend servers in parallel...${NC}" | tee -a "$LOGFILE"

# Make scripts executable
chmod +x ./start-backend.sh
chmod +x ./start-frontend.sh

# Launch backend and frontend simultaneously
echo -e "${GREEN}Executing backend script...${NC}" | tee -a "$LOGFILE"
./start-backend.sh > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo -e "${BLUE}Executing frontend script...${NC}" | tee -a "$LOGFILE"
./start-frontend.sh > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Check for service startup in parallel (using curl to actually test API endpoint)
echo -e "${YELLOW}Waiting for services to start (Backend: $BACKEND_PID, Frontend: $FRONTEND_PID)...${NC}" | tee -a "$LOGFILE"

# Function to check if backend is ready by testing API endpoint
backend_ready() {
    curl -s http://localhost:4000/health > /dev/null 2>&1
    return $?
}

# Wait for services to start (maximum 30 seconds)
MAX_WAIT=30
COUNTER=0
BACKEND_READY=false

while [ $COUNTER -lt $MAX_WAIT ]; do
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}Backend process failed to start. Check log.${NC}" | tee -a "$LOGFILE"
        break
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${RED}Frontend process failed to start. Check log.${NC}" | tee -a "$LOGFILE"
        break
    fi
    
    # Check if backend is responsive
    if backend_ready; then
        BACKEND_READY=true
        echo -e "${GREEN}✓ Backend API is responding${NC}" | tee -a "$LOGFILE"
        break
    fi
    
    # Show progress
    echo -n "." 
    COUNTER=$((COUNTER+1))
    sleep 1
done

echo "" # New line after progress dots

# Check final status
if [ "$BACKEND_READY" = false ]; then
    echo -e "${YELLOW}Backend may not be fully initialized after $MAX_WAIT seconds, but continuing...${NC}" | tee -a "$LOGFILE"
else
    echo -e "${GREEN}Backend is ready!${NC}" | tee -a "$LOGFILE"
fi

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${BLUE}Frontend is running!${NC}" | tee -a "$LOGFILE"
else 
    echo -e "${RED}Frontend is not running. Check logs.${NC}" | tee -a "$LOGFILE"
fi

# If we got here, both are running
echo -e "${GREEN}Backend started successfully (PID: $BACKEND_PID)${NC}" | tee -a "$LOGFILE"
echo -e "${BLUE}Frontend started successfully (PID: $FRONTEND_PID)${NC}" | tee -a "$LOGFILE"

# Open browser automatically after a short delay (only if we have a graphical environment)
if [ -n "$DISPLAY" ] || [ "$(uname)" = "Darwin" ]; then
    (sleep 2 && echo -e "${GREEN}🚀 Opening application in your browser...${NC}" | tee -a "$LOGFILE" && 
     (xdg-open http://localhost:3000 &>/dev/null || open http://localhost:3000 &>/dev/null)) &
else
    echo -e "${YELLOW}No display detected - open http://localhost:3000 in your browser${NC}" | tee -a "$LOGFILE"
fi

# Monitor logs with reduced verbosity (filter out noise)
# Use background processes with their own PIDs for easier cleanup
(tail -f "$BACKEND_LOG" | grep -v "^$\|webpack\|Download the React DevTools\|compiled\|successfully\|deprecated" | 
 sed -e "s/^/${GREEN}[BACKEND]${NC} /") &
BACKEND_TAIL_PID=$!

(tail -f "$FRONTEND_LOG" | grep -v "^$\|webpack\|Download the React DevTools\|compiled\|successfully\|deprecated" | 
 sed -e "s/^/${BLUE}[FRONTEND]${NC} /") &
FRONTEND_TAIL_PID=$!

# Add these PIDs to our trap for proper cleanup
trap 'cleanup; kill $BACKEND_TAIL_PID $FRONTEND_TAIL_PID 2>/dev/null' SIGINT SIGTERM

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
