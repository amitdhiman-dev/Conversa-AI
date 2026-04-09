# API Documentation

Complete reference for the Conversational AI Chatbot API.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

## Authentication

Currently, the API has no authentication. For production, implement:
- API keys
- JWT tokens
- OAuth 2.0

---

## Endpoints

### 1. Chat / Send Message

**POST** `/api/chat`

Send a text message and get an AI response.

**Request:**
```json
{
  "message": "What is the capital of France?",
  "session_id": "session_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "response": "The capital of France is Paris, a city located in north-central France...",
  "timestamp": "2024-04-09T10:30:45.123456"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Empty message"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "LLM service unavailable"
}
```

**Parameters:**
- `message` (string, required) - User's message
- `session_id` (string, optional) - Session ID for conversation history. Default: "default"

**Response Fields:**
- `success` (boolean) - Whether request succeeded
- `response` (string) - AI's response
- `timestamp` (string) - ISO 8601 timestamp

---

### 2. Voice Input / Transcribe Audio

**POST** `/api/voice-input`

Transcribe audio to text using Whisper.

**Request:**
- Content-Type: `multipart/form-data`
- Files: `audio` (WAV, MP3, M4A, etc.)
- Form data: `session_id` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "transcribed_text": "What is the weather today?"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "No audio file provided"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Whisper model not loaded"
}
```

**Parameters:**
- `audio` (file, required) - Audio file to transcribe
- `session_id` (string, optional) - Session ID

**Response Fields:**
- `success` (boolean) - Whether transcription succeeded
- `transcribed_text` (string) - Transcribed text

---

### 3. Get Conversation History

**GET** `/api/history/<session_id>`

Retrieve conversation history for a session.

**Request:**
```
GET /api/history/session_123
```

**Response (200 OK):**
```json
{
  "success": true,
  "history": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    }
  ]
}
```

**Parameters:**
- `session_id` (string, path) - Session ID to retrieve history for

**Response Fields:**
- `success` (boolean) - Whether request succeeded
- `history` (array) - Array of messages (system message excluded)
  - `role` (string) - "user" or "assistant"
  - `content` (string) - Message text

---

### 4. Clear Conversation History

**DELETE** `/api/clear-history/<session_id>`

Clear all messages in a conversation session.

**Request:**
```
DELETE /api/clear-history/session_123
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation cleared"
}
```

**Parameters:**
- `session_id` (string, path) - Session ID to clear

**Response Fields:**
- `success` (boolean) - Whether request succeeded
- `message` (string) - Success message

---

### 5. Health Check

**GET** `/api/health`

Check API status and available services.

**Request:**
```
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "llm_available": true,
  "whisper_loaded": true,
  "timestamp": "2024-04-09T10:30:45.123456"
}
```

**Response Fields:**
- `status` (string) - "healthy" or "degraded"
- `llm_available` (boolean) - Whether LLM API is reachable
- `whisper_loaded` (boolean) - Whether Whisper model is loaded
- `timestamp` (string) - ISO 8601 timestamp

---

## Session Management

Sessions automatically persist conversation history in memory.

**Session ID Generation (Frontend):**
```javascript
const sessionId = `session_${Date.now()}`;
```

**Session ID Reuse:**
- Use same `session_id` to continue conversations
- Different `session_id` = separate conversation thread
- Sessions cleared on server restart (if no database)

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request succeeded |
| 400 | Bad request (missing/invalid parameters) |
| 500 | Server error (LLM unavailable, etc.) |

### Error Response Format

```json
{
  "error": "Description of what went wrong"
}
```

**Common Errors:**
- "Empty message" - No text in message
- "No audio file provided" - Missing audio file
- "LLM service unavailable" - Cannot reach LLM API
- "Whisper model not loaded" - Model download/load failed

---

## Rate Limiting (Future)

Recommended for production:

```python
# Example: 100 requests per hour per IP
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)
```

---

## CORS Headers

Current CORS configuration allows all origins. For production:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-domain.com"],
        "methods": ["GET", "POST", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## Example Usage

### JavaScript/Fetch

```javascript
// Send message
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hello!',
    session_id: 'session_123'
  })
});

const data = await response.json();
console.log(data.response);

// Get history
const historyResponse = await fetch('/api/history/session_123');
const history = await historyResponse.json();
console.log(history.history);

// Clear history
await fetch('/api/clear-history/session_123', {
  method: 'DELETE'
});
```

### Python/Requests

```python
import requests

# Send message
response = requests.post('http://localhost:5000/api/chat', json={
    'message': 'Hello!',
    'session_id': 'session_123'
})

print(response.json()['response'])

# Get history
history = requests.get('http://localhost:5000/api/history/session_123')
print(history.json()['history'])

# Clear history
requests.delete('http://localhost:5000/api/clear-history/session_123')
```

### cURL

```bash
# Send message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "session_id": "session_123"
  }'

# Get history
curl http://localhost:5000/api/history/session_123

# Clear history
curl -X DELETE http://localhost:5000/api/clear-history/session_123

# Health check
curl http://localhost:5000/api/health
```

---

## Versioning

Current API version: **1.0.0**

Future versions will maintain backward compatibility with v1 endpoints.

---

## Support

For API issues or questions:
1. Check this documentation
2. Review server logs: `docker logs chatbot-backend`
3. Test endpoints with cURL or Postman
4. Open an issue on GitHub

---

**Last Updated**: April 2024
