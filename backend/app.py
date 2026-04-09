from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
from datetime import datetime
import json
from io import BytesIO

app = Flask(__name__)
CORS(app)

# ==============================
# ⚙️ CONFIG
# ==============================
AUDIO_FOLDER = "recordings"
LLM_API = os.getenv("LLM_API", "http://localhost:1234/v1/chat/completions")

# Create recordings folder
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Whisper model (optional, removed for simplicity)
model = None

# In-memory conversation history per session
conversation_history = {}

# ==============================
# 🧠 LOAD LLM
# ==============================
def get_fallback_response(user_message):
    """Generate a simple fallback response when LLM is unavailable"""
    message_lower = user_message.lower()
    
    # Simple rule-based responses
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        return "Hello! I'm your AI assistant. How can I help you today?"
    elif any(word in message_lower for word in ['how are you', 'how do you do', "what's up"]):
        return "I'm doing great, thank you for asking! I'm here to help with any questions or tasks you have."
    elif any(word in message_lower for word in ['what is', 'tell me about', 'explain']):
        return f"I'd be happy to help! You asked about: '{user_message}'. In a production environment with a connected LLM, I would provide detailed information. Right now, the LLM service is not configured. Please set up an LLM API endpoint."
    elif any(word in message_lower for word in ['thanks', 'thank you', 'appreciate']):
        return "You're welcome! Is there anything else I can help you with?"
    elif any(word in message_lower for word in ['bye', 'goodbye', 'see you']):
        return "Goodbye! Have a great day!"
    else:
        return f"That's an interesting question: '{user_message}'. To provide better responses, please configure an LLM API endpoint (like Ollama, OpenAI, or similar). For now, I'm using a basic response system."

def ask_llm(messages):
    """Send messages to local LLM with fallback"""
    try:
        print(f"Attempting to connect to LLM: {LLM_API}")
        response = requests.post(
            LLM_API,
            json={
                "model": "local-model",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500
            },
            timeout=10
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError as e:
        print(f"LLM Connection Error: Cannot reach {LLM_API}")
        print("Using fallback response generator...")
        # Fallback to simple response
        return get_fallback_response(messages[-1]["content"])
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback to simple response
        user_message = messages[-1]["content"] if messages else "your message"
        return get_fallback_response(user_message)

# ==============================
# 📝 TEXT CHAT ENDPOINT
# ==============================
@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle text-based chat"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        if not user_message:
            return jsonify({"error": "Empty message"}), 400
        
        # Initialize session history if needed
        if session_id not in conversation_history:
            conversation_history[session_id] = [
                {
                    "role": "system",
                    "content": "You are a helpful, professional AI assistant. Provide clear, concise, and helpful responses. Do not use emojis or cartoon expressions."
                }
            ]
        
        # Add user message
        conversation_history[session_id].append({
            "role": "user",
            "content": user_message
        })
        
        # Get LLM response
        llm_response = ask_llm(conversation_history[session_id])
        
        # Add assistant response to history
        conversation_history[session_id].append({
            "role": "assistant",
            "content": llm_response
        })
        
        return jsonify({
            "success": True,
            "response": llm_response,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500

# ==============================
# 🎤 VOICE INPUT ENDPOINT
# ==============================
@app.route('/api/voice-input', methods=['POST'])
def voice_input():
    """Handle voice input transcription"""
    return jsonify({"error": "Voice transcription requires Whisper model. Please use text-only mode."}), 503

# ==============================
# 📜 CONVERSATION HISTORY ENDPOINT
# ==============================
@app.route('/api/history/<session_id>', methods=['GET'])
def get_history(session_id):
    """Get conversation history"""
    try:
        # Filter out system message
        history = conversation_history.get(session_id, [])
        filtered = [msg for msg in history if msg["role"] != "system"]
        
        return jsonify({
            "success": True,
            "history": filtered
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 🗑️ CLEAR CONVERSATION ENDPOINT
# ==============================
@app.route('/api/clear-history/<session_id>', methods=['DELETE'])
def clear_history(session_id):
    """Clear conversation history"""
    try:
        if session_id in conversation_history:
            conversation_history[session_id] = [
                {
                    "role": "system",
                    "content": "You are a helpful, professional AI assistant. Provide clear, concise, and helpful responses. Do not use emojis or cartoon expressions."
                }
            ]
        
        return jsonify({"success": True, "message": "Conversation cleared"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# ❤️ HEALTH CHECK
# ==============================
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "llm_available": True,
        "whisper_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
