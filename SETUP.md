# Setup Guide - Conversational AI Chatbot

## Table of Contents
1. [Quick Start with Docker](#quick-start-with-docker)
2. [Local Development Setup](#local-development-setup)
3. [Configuration](#configuration)
4. [Troubleshooting](#troubleshooting)

---

## Quick Start with Docker

The easiest way to get started is with Docker Compose. This sets up both backend and frontend automatically.

### Prerequisites
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- Windows, macOS, or Linux

### Steps

1. **Clone/Download the project**
   ```bash
   cd Convo
   ```

2. **Run the quick start script**
   
   **Windows:**
   ```bash
   run.bat
   ```
   
   **macOS/Linux:**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```
   
   **Or manually:**
   ```bash
   docker-compose build
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Stop the services**
   - Press `Ctrl+C` in the terminal
   - Or run: `docker-compose down`

---

## Local Development Setup

For local development without Docker, follow these instructions.

### Backend Setup

#### 1. Prerequisites
- Python 3.11 or higher
- pip package manager
- (Optional) ffmpeg for advanced audio features

**Install Python:**
- Windows: https://www.python.org/downloads/
- macOS: `brew install python3`
- Linux: `sudo apt-get install python3 python3-pip`

#### 2. Activate Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
# Make sure LLM_API points to your local LLM or cloud API
```

#### 5. Run the Backend
```bash
python app.py
```

Your backend will start on `http://localhost:5000`

### Frontend Setup

#### 1. Prerequisites
- Node.js 18+ and npm
- Download from: https://nodejs.org/

**Verify installation:**
```bash
node --version
npm --version
```

#### 2. Install Dependencies
```bash
cd frontend
npm install
```

#### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# The default settings should work fine for local development
```

#### 4. Start Development Server
```bash
npm run dev
```

Your frontend will start on `http://localhost:3000`

---

## Configuration

### Connecting to an LLM

The chatbot can connect to any OpenAI-compatible LLM API.

#### Option 1: Local LLM (Ollama/Llama.cpp)

1. **Install Ollama**: https://ollama.ai
2. **Download a model**: `ollama pull mistral` (or your preferred model)
3. **Start Ollama**: `ollama serve`
4. **Configure backend `.env`**:
   ```
   LLM_API=http://localhost:11434/v1/chat/completions
   ```

#### Option 2: Local LLM (llama.cpp)

1. **Build llama.cpp**: https://github.com/ggerganov/llama.cpp
2. **Start server**: `./server -m model.gguf --port 1234`
3. **Configure backend `.env`**:
   ```
   LLM_API=http://localhost:1234/v1/chat/completions
   ```

#### Option 3: Cloud-Based LLM (OpenAI)

1. **Get API key**: https://platform.openai.com/api-keys
2. **Configure backend `.env`**:
   ```
   LLM_API=https://api.openai.com/v1/chat/completions
   LLM_API_KEY=sk-your-key-here
   ```

#### Option 4: Other Cloud Providers

- **Anthropic Claude**: https://console.anthropic.com
- **Google Gemini**: https://ai.google.dev
- **Mistral AI**: https://console.mistral.ai
- **Cohere**: https://dashboard.cohere.com

### System Prompt

Customize the AI's behavior by editing the system prompt in `backend/app.py`:

```python
# Line ~80 in ask_llm() function
"content": "You are a helpful, professional AI assistant..."
```

### Port Configuration

**Backend (Flask):**
- Default: 5000
- Change in `docker-compose.yml` or run: `python app.py --port 8000`

**Frontend (Vite):**
- Default: 3000
- Change in `frontend/vite.config.js`: `port: 3000`

### Database (Future Enhancement)

Currently, conversations are stored in memory. For production:

1. **PostgreSQL**:
   - Add to docker-compose.yml
   - Update backend to use SQLAlchemy

2. **MongoDB**:
   - Add to docker-compose.yml
   - Update backend to use PyMongo

---

## Troubleshooting

### Backend Issues

#### Port 5000 already in use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

#### Whisper model failing to load

- First run downloads ~1.4GB model
- Ensure 2GB disk space available
- Check internet connection
- Can take 5-10 minutes first time

#### LLM connection refused

1. Check LLM is running: `curl http://localhost:11434/api/tags` or appropriate endpoint
2. Verify URL in `.env` matches your LLM setup
3. Check firewall isn't blocking connection
4. Try with full IP address instead of localhost

#### Import errors after installing packages

```bash
# Deactivate and reactivate venv
deactivate
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall packages
pip install -r requirements.txt
```

### Frontend Issues

#### Blank page after loading

1. **Check browser console**: F12 → Console tab
2. **Check backend is running**: Visit http://localhost:5000/api/health
3. **Clear cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

#### API 404 errors

- Ensure backend is running on port 5000
- Check frontend proxy in `vite.config.js`

#### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker Issues

#### Container exits immediately

Check logs:
```bash
docker logs <container_id>
# or
docker-compose logs
```

#### Port conflicts

```bash
# Change ports in docker-compose.yml
# Or find and stop conflicting containers
docker ps
docker stop <container_id>
```

#### Volumes not syncing

- Restart Docker Desktop
- Ensure volume paths are correct in docker-compose.yml

#### Network issues between containers

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up
```

---

## Next Steps

1. **Customize appearance**: Edit CSS in `frontend/src/`
2. **Add database**: Set up PostgreSQL and update backend
3. **Deploy**: Use Docker for cloud deployment (AWS, GCP, etc.)
4. **Scale**: Add rate limiting, authentication, analytics
5. **Integrate**: Add more LLM providers or tools

---

## Support

For issues:
1. Check this guide's troubleshooting section
2. Review Docker/npm/Python error messages
3. Check GitHub issues
4. Open a new issue with:
   - OS and version
   - Steps to reproduce
   - Full error messages
   - Logs output

---

**Happy chatting! 🚀**
