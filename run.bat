@echo off
REM Quick Start Script for Windows

echo.
echo ============================================
echo   Conversational AI Chatbot - Quick Start
echo ============================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker not found. Please install Docker Desktop
    echo Visit: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1] Building Docker images...
docker-compose build

if %errorlevel% neq 0 (
    echo Build failed
    pause
    exit /b 1
)

echo.
echo [2] Starting services...
docker-compose up

echo.
echo ============================================
echo   Services started!
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop services
echo.

pause
