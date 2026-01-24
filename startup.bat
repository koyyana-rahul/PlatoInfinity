@echo off
REM PLATO MENU - Automated Startup Script for Windows
REM This script starts both server and client in development mode

echo.
echo ============================================
echo 🚀 PLATO MENU - STARTUP SCRIPT (Windows)
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "server" (
    echo ❌ Error: server folder not found
    echo Please run this script from the PLATO_MENU root directory
    pause
    exit /b 1
)

if not exist "client" (
    echo ❌ Error: client folder not found
    echo Please run this script from the PLATO_MENU root directory
    pause
    exit /b 1
)

echo 📦 Checking dependencies...
echo.

REM Check and install server dependencies
echo Checking server dependencies...
cd server
if not exist "node_modules" (
    echo Installing server dependencies...
    call npm install
)
cd ..

REM Check and install client dependencies
echo Checking client dependencies...
cd client
if not exist "node_modules" (
    echo Installing client dependencies...
    call npm install
)
cd ..

echo.
echo ✅ Dependencies checked
echo.
echo 🎯 Starting services...
echo.
echo Server will start on: http://localhost:5000
echo Client will start on: http://localhost:5173
echo.
echo ⚠️  Two terminal windows will open automatically
echo.

REM Start server in new window
cd server
echo ▶ Starting Server in new window...
start "PLATO Menu - Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for server to start
timeout /t 3 /nobreak

REM Start client in new window
cd client
echo ▶ Starting Client in new window...
start "PLATO Menu - Client" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Services started! Check the opened terminal windows
echo.
echo To stop services: Close the terminal windows
echo.

pause
