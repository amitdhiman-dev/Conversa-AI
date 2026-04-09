#!/bin/bash

# Quick Start Script for macOS/Linux

echo ""
echo "============================================"
echo "  Conversational AI Chatbot - Quick Start"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker"
    echo "Visit: https://www.docker.com/get-started"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found. Please install Docker Desktop"
    exit 1
fi

echo "[1] Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

echo ""
echo "[2] Starting services..."
docker-compose up

echo ""
echo "============================================"
echo "  Services started!"
echo "============================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop services"
echo ""
