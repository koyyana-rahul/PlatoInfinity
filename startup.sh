#!/bin/bash
# PLATO MENU - Automated Startup Script
# This script starts both server and client in development mode

echo "🚀 PLATO MENU - STARTUP SCRIPT"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo -e "${RED}❌ Error: server and client folders not found${NC}"
    echo "Please run this script from the PLATO_MENU root directory"
    exit 1
fi

echo -e "${YELLOW}📦 Checking dependencies...${NC}"
echo ""

# Check and install server dependencies
echo "Checking server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing server dependencies...${NC}"
    npm install
fi
cd ..

# Check and install client dependencies
echo "Checking client dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing client dependencies...${NC}"
    npm install
fi
cd ..

echo ""
echo -e "${GREEN}✅ Dependencies checked${NC}"
echo ""
echo -e "${YELLOW}🎯 Starting services...${NC}"
echo ""
echo "Server will start on: http://localhost:5000"
echo "Client will start on: http://localhost:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start server in background
cd server
echo -e "${GREEN}▶ Starting Server...${NC}"
npm run dev &
SERVER_PID=$!
cd ..

# Give server time to start
sleep 2

# Start client in new terminal/window (behavior depends on OS)
cd client
echo -e "${GREEN}▶ Starting Client...${NC}"
npm run dev &
CLIENT_PID=$!
cd ..

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Set up signal handlers
trap cleanup EXIT
trap cleanup SIGINT
trap cleanup SIGTERM

# Wait for background processes
wait
