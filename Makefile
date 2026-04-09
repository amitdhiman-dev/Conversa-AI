.PHONY: help build up down logs clean dev install

help:
	@echo "Conversational AI Chatbot - Available Commands"
	@echo ""
	@echo "Docker commands:"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services with Docker Compose"
	@echo "  make down           - Stop all services"
	@echo "  make logs           - View service logs"
	@echo "  make clean          - Remove all containers and volumes"
	@echo ""
	@echo "Development commands:"
	@echo "  make dev-backend    - Start backend in development mode"
	@echo "  make dev-frontend   - Start frontend in development mode"
	@echo "  make install        - Install all dependencies"
	@echo ""

# Docker Commands
build:
	docker-compose build

up:
	docker-compose up

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	-rm -rf backend/venv backend/.eggs
	-rm -rf frontend/node_modules frontend/dist

# Development Commands
dev-backend:
	cd backend && \
	python -m venv venv && \
	source venv/bin/activate || . venv/Scripts/activate && \
	pip install -r requirements.txt && \
	python app.py

dev-frontend:
	cd frontend && \
	npm install && \
	npm run dev

install:
	cd backend && python -m pip install -r requirements.txt
	cd frontend && npm install

# Shortcuts
backend-logs:
	docker logs -f chatbot-backend

frontend-logs:
	docker logs -f chatbot-frontend

rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up
