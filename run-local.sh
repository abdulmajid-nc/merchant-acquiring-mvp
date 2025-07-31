#!/bin/bash
# Start MongoDB, backend and frontend locally, display logs, and stop on close

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

echo -e "${YELLOW}Starting local development environment...${NC}"
echo -e "${YELLOW}Logs will be displayed in the terminal and also saved to $LOGFILE${NC}"

# Clean up old processes if they exist
cleanup() {
  echo -e "${YELLOW}Cleaning up and stopping servers...${NC}"
  [[ -n $BACKEND_PID ]] && kill $BACKEND_PID 2>/dev/null
  [[ -n $FRONTEND_PID ]] && kill $FRONTEND_PID 2>/dev/null
  [[ -n $BACKEND_LOG_PID ]] && kill $BACKEND_LOG_PID 2>/dev/null
  [[ -n $FRONTEND_LOG_PID ]] && kill $FRONTEND_LOG_PID 2>/dev/null
  [[ -n $MONGODB_LOG_PID ]] && kill $MONGODB_LOG_PID 2>/dev/null
  
  # Clean up temp files and named pipes
  rm -f $BACKEND_PIPE $FRONTEND_PIPE $MONGODB_PIPE
  rm -f $BACKEND_TEMP $FRONTEND_TEMP $MONGODB_TEMP
  
  exit 0
}

trap cleanup SIGINT SIGTERM

# Create temp files for logging (we'll use these instead of named pipes for better reliability)
BACKEND_TEMP="/tmp/backend_log_$$"
FRONTEND_TEMP="/tmp/frontend_log_$$"
MONGODB_TEMP="/tmp/mongodb_log_$$"
touch $BACKEND_TEMP $FRONTEND_TEMP $MONGODB_TEMP

# Create named pipes as well for backward compatibility
BACKEND_PIPE="/tmp/backend_pipe_$$"
FRONTEND_PIPE="/tmp/frontend_pipe_$$"
MONGODB_PIPE="/tmp/mongodb_pipe_$$"
mkfifo $BACKEND_PIPE $FRONTEND_PIPE $MONGODB_PIPE

# Function to check and start MongoDB
start_mongodb() {
    echo -e "${PURPLE}Checking MongoDB status...${NC}"
    
    # Check if MongoDB is installed
    if ! command -v mongod &> /dev/null; then
        echo -e "${YELLOW}MongoDB not found. Installing MongoDB...${NC}"
        # Import MongoDB public GPG key
        sudo apt-get install -y gnupg curl
        curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
            sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
            --dearmor
        
        # Create list file for MongoDB
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | \
            sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        
        # Install MongoDB packages
        sudo apt-get update
        sudo apt-get install -y mongodb-org mongodb-mongosh
    fi
    
    # Check if MongoDB service file exists
    if [ ! -f /lib/systemd/system/mongod.service ] && [ ! -f /etc/systemd/system/mongod.service ]; then
        echo -e "${YELLOW}MongoDB service file not found. Creating one...${NC}"
        sudo bash -c 'cat > /etc/systemd/system/mongod.service << EOL
[Unit]
Description=MongoDB Database Server
Documentation=https://docs.mongodb.org/manual
After=network.target

[Service]
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --config /etc/mongod.conf
PIDFile=/var/run/mongodb/mongod.pid
RuntimeDirectory=mongodb
RuntimeDirectoryMode=0755

[Install]
WantedBy=multi-user.target
EOL'
        sudo systemctl daemon-reload
    fi
    
    # Ensure MongoDB data directory exists and has correct permissions
    if [ ! -d /var/lib/mongodb ]; then
        echo -e "${YELLOW}Creating MongoDB data directory...${NC}"
        sudo mkdir -p /var/lib/mongodb
        sudo chown -R mongodb:mongodb /var/lib/mongodb
    fi
    
    # Check MongoDB service status
    if ! systemctl is-active --quiet mongod; then
        echo -e "${PURPLE}Starting MongoDB service...${NC}"
        sudo systemctl enable mongod
        sudo systemctl start mongod
        echo -e "${PURPLE}Waiting for service to start...${NC}"
        sleep 5
    fi
    
    # Wait for MongoDB to be ready
    echo -e "${PURPLE}Checking MongoDB connection...${NC}"
    timeout=30
    while [ $timeout -gt 0 ]; do
        if mongosh --quiet --eval "try { db.adminCommand('ping').ok } catch(e) { e }" 2>/dev/null | grep -q "1"; then
            echo -e "${GREEN}MongoDB is ready!${NC}"
            return 0
        fi
        echo -n "."
        timeout=$((timeout-1))
        sleep 1
    done
    
    echo -e "\n${RED}MongoDB failed to start within timeout period.${NC}"
    return 1
    
    # Start MongoDB log monitoring
    cat $MONGODB_PIPE | while read -r line; do
        echo -e "${PURPLE}[MONGODB]${NC} $line" | tee -a "$LOGFILE"
    done &
    MONGODB_LOG_PID=$!
    
    echo -e "${PURPLE}MongoDB is running${NC}"
    return 0
}

# Function to initialize the database
initialize_database() {
  echo -e "${RED}Dropping MongoDB database 'merchant-acquiring-mvp' before seeding...${NC}"
  mongosh --quiet --eval "db.getSiblingDB('merchant-acquiring-mvp').dropDatabase()" 2>&1 | tee -a "$LOGFILE"
  echo -e "${PURPLE}Seeding database with init-data.js...${NC}"
  cd "$BACKEND_DIR"
  node init-data.js 2>&1 | tee -a "$LOGFILE"
  echo -e "${PURPLE}Database initialized with fresh, realistic data${NC}"
}

# Function to start backend
start_backend() {
  echo -e "${GREEN}Installing backend dependencies...${NC}"
  cd "$BACKEND_DIR"
  npm install

  # Initialize database before starting the server
  initialize_database
  
  echo -e "${GREEN}Starting backend server...${NC}"
  # Create temporary file instead of pipe to avoid blocking
  BACKEND_TEMP="/tmp/backend_log_$$"
  touch $BACKEND_TEMP
  
  # Start the backend server
  node app.js > $BACKEND_TEMP 2>&1 &
  BACKEND_PID=$!
  
  # Verify the process started
  if [ -z "$BACKEND_PID" ] || ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Failed to start backend server${NC}"
    return 1
  fi
  
  echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

  # Start a process to read from the file and format output
  tail -f $BACKEND_TEMP | while read -r line; do
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
  # Create temporary file instead of pipe to avoid blocking
  FRONTEND_TEMP="/tmp/frontend_log_$$"
  touch $FRONTEND_TEMP
  
  # Start the frontend development server
  npm start > $FRONTEND_TEMP 2>&1 &
  FRONTEND_PID=$!
  
  # Verify the process started
  if [ -z "$FRONTEND_PID" ] || ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}Failed to start frontend development server${NC}"
    return 1
  fi
  
  echo -e "${BLUE}Frontend server started with PID: $FRONTEND_PID${NC}"

  # Start a process to read from the file and format output
  tail -f $FRONTEND_TEMP | while read -r line; do
    echo -e "${BLUE}[FRONTEND]${NC} $line" | tee -a "$LOGFILE"
  done &
  FRONTEND_LOG_PID=$!
}

# Start services in order: MongoDB, Backend, Frontend
echo -e "${YELLOW}Starting services...${NC}"

# Start MongoDB first
start_mongodb
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start MongoDB. Exiting.${NC}"
    cleanup
    exit 1
fi

# Start backend 
echo -e "${YELLOW}Starting backend server...${NC}"
start_backend
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start backend server. Continuing anyway...${NC}"
    # We'll continue even if backend fails, as frontend might still be useful
fi

# Start frontend
echo -e "${YELLOW}Starting frontend server...${NC}"
start_frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start frontend server.${NC}"
    # If both servers failed, we should exit
    if [ $? -ne 0 ]; then
        echo -e "${RED}Both servers failed to start. Exiting.${NC}"
        cleanup
        exit 1
    fi
fi

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
echo -e "${PURPLE}MongoDB:${NC} mongodb://localhost:27017"
echo -e "${GREEN}Backend API:${NC} http://localhost:4000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}======================================${NC}"
echo -e "\n${YELLOW}Services are running. Press Ctrl+C to stop.${NC}"
echo -e "${YELLOW}All logs are being saved to $LOGFILE${NC}\n"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

# Clean up named pipes
rm -f $BACKEND_PIPE $FRONTEND_PIPE
