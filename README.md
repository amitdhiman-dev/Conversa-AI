# 🤖 Conversational AI Chatbot

A modern, fully-featured conversational chatbot application with a beautiful React frontend and Python Flask backend. No cartoon emotes—just professional, intelligent conversation.

## ✨ Features

- **Modern UI**: Built with Vite + React with smooth animations and professional design
- **Conversational AI**: Connect to local or remote LLM for intelligent responses
- **Landing Page**: Professional introduction and feature showcase
- **Real-time Chat**: Instant message delivery and response streaming
- **Conversation History**: Maintains context throughout conversations
- **Fully Dockerized**: Easy deployment with Docker Compose
- **Voice Support**: Speech-to-text transcription with Whisper
- **Responsive Design**: Works beautifully on desktop and mobile
- **No Emojis**: Clean, professional interface

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Convo

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Local Development Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Copy .env.example to .env and update if needed
cp .env.example .env

# Run Flask app
python app.py
```

The backend will be available at `http://localhost:5000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
Convo/
├── backend/                    # Flask API
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile             # Backend Docker image
│   ├── .env                   # Environment variables
│   └── recordings/            # Audio files directory
│
├── frontend/                   # React Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Landing page
│   │   │   ├── LandingPage.css
│   │   │   ├── ChatPage.jsx        # Chat interface
│   │   │   └── ChatPage.css
│   │   ├── components/
│   │   │   ├── ChatMessage.jsx     # Message component
│   │   │   └── ChatMessage.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── docker-compose.yml          # Docker Compose configuration
├── .gitignore
├── README.md
└── recoder.py                  # Original audio recording script

```

## 🔌 API Endpoints

### Chat
- **POST** `/api/chat` - Send a message and get AI response
  ```json
  {
    "message": "Your message here",
    "session_id": "session_123"
  }
  ```

### Voice
- **POST** `/api/voice-input` - Transcribe audio to text
  - Form data with `audio` file and `session_id`

### History
- **GET** `/api/history/<session_id>` - Get conversation history
- **DELETE** `/api/clear-history/<session_id>` - Clear conversation

### Health
- **GET** `/api/health` - Check API status

## 🎨 Customization

### Styling

- Colors and theme: Edit `frontend/src/index.css` (CSS variables)
- Page-specific styles: Edit files in `frontend/src/pages/`
- Component styles: Edit files in `frontend/src/components/`

### LLM Configuration

Update the `LLM_API` environment variable in:
- `backend/.env` (local development)
- `docker-compose.yml` (Docker)

Supports OpenAI-compatible APIs:
- Local LLMs (ollama, llama.cpp)
- cloud-based APIs (OpenAI, Claude API)

### System Prompt

Edit the system prompt in `backend/app.py`:
```python
"content": "You are a helpful, professional AI assistant. ..."
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build --force-recreate
```

## 💾 Data Persistence

- Conversation history: Stored in-memory per session
- Audio recordings: Saved in `backend/recordings/`
- For production: Consider adding a database (PostgreSQL, MongoDB)

## 🔒 Security Notes

- Frontend communicates with backend via proxy in development
- For production, configure CORS appropriately
- Never expose API keys in frontend code
- Use HTTPS in production
- Validate all inputs on the backend

## 🛠️ Troubleshooting

### Backend Issues
- **Port 5000 already in use**: Change `FLASK_DEBUG` or use `lsof -i :5000` to find process
- **Whisper model not loading**: Large model (~3GB), ensure sufficient disk space
- **LLM connection refused**: Ensure local LLM is running on configured port

### Frontend Issues
- **Blank page**: Check browser console for errors
- **API 404 errors**: Ensure backend is running and proxy is configured
- **Slow chat responses**: May be LLM delay, check backend logs

### Docker Issues
- **Container exits immediately**: Check logs with `docker logs <container_id>`
- **Network issues**: Ensure services are on same network (defined in compose)
- **Volume permissions**: May need to chmod volumes on Linux

## 📦 Dependencies

### Backend
- Flask - Web framework
- Flask-CORS - Cross-origin support
- OpenAI Whisper - Speech-to-text
- requests - HTTP client
- python-dotenv - Environment variables

### Frontend
- React 18 - UI library
- Vite - Build tool
- Framer Motion - Animations
- Axios - HTTP client

## 🚀 Deployment

### Production Checklist
- [ ] Set up proper environment variables
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS
- [ ] Set up a database for conversations
- [ ] Configure logging and monitoring
- [ ] Set up backup strategy
- [ ] Test with production LLM
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline

### Deployment Options
- **Docker Compose**: Single machine deployment
- **Kubernetes**: Enterprise deployment
- **AWS/GCP/Azure**: Cloud deployment
- **Heroku**: Simple deployment
- **VPS**: Manual deployment

## 📝 License

MIT License - feel free to use and modify

## 🤝 Contributing

Contributions welcome! Please submit pull requests or open issues for bugs and feature requests.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ - Professional AI Chatbot Interface**
