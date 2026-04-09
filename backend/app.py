from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
from datetime import datetime
import json
from io import BytesIO
import sys
import random

app = Flask(__name__)
CORS(app)

# ==============================
# ⚙️ CONFIG
# ==============================
AUDIO_FOLDER = "recordings"
LLM_API = os.getenv("LLM_API", "http://ollama:11434/api/chat")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")

# Create recordings folder
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Whisper model (optional, removed for simplicity)
model = None

# In-memory conversation history per session
conversation_history = {}

# ==============================
# 🗣️ FILLER WORDS & NATURAL SPEECH
# ==============================
FILLER_WORDS = [
    "Well, ",
    "You know, ",
    "Actually, ",
    "I mean, ",
    "So, ",
    "Umm, ",
    "Let me think... ",
    "Basically, ",
    "In other words, ",
    "Sort of, ",
]

TRANSITION_WORDS = [
    " I think.",
    " For sure.",
    " Right?",
    " Honestly.",
    " If you ask me.",
    " What I mean is, ",
]

def add_natural_filler_words(response):
    """Add natural-sounding filler words to make the response feel more conversational"""
    # Don't add fillers to very short responses
    if len(response) < 50:
        return response
    
    # Split into sentences
    sentences = response.split('. ')
    if len(sentences) < 2:
        return response
    
    # Process sentences, randomly adding fillers
    processed = []
    for i, sentence in enumerate(sentences):
        sentence = sentence.strip()
        if not sentence:
            continue
        
        # Randomly add filler words to the beginning of some sentences (20% chance)
        if i > 0 and random.random() < 0.2:
            filler = random.choice(FILLER_WORDS)
            # Lowercase first letter if sentence starts with capital
            if sentence and sentence[0].isupper():
                sentence = sentence[0].lower() + sentence[1:]
            sentence = filler + sentence
        
        # Randomly add transition words at the end (10% chance last sentence)
        if i == len(sentences) - 2 and random.random() < 0.3:
            sentence = sentence + random.choice(TRANSITION_WORDS)
        
        processed.append(sentence)
    
    # Rejoin with periods and spaces
    result = '. '.join(processed)
    
    # Clean up any double spaces or weird punctuation
    result = result.replace('  ', ' ')
    result = result.replace('. .', '.')
    
    # Ensure it ends properly
    if result and not result.endswith('.') and not result.endswith('?'):
        result += '.'
    
    return result

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
    """Send messages to Ollama LLM with fallback"""
    try:
        print(f"\n{'='*50}", flush=True)
        print(f"[LLM] Attempting to connect to: {LLM_API}", flush=True)
        print(f"[LLM] Model: {LLM_MODEL}", flush=True)
        print(f"{'='*50}\n", flush=True)
        sys.stdout.flush()
        
        response = requests.post(
            LLM_API,
            json={
                "model": LLM_MODEL,
                "messages": messages,
                "temperature": 0.7,
                "stream": False
            },
            timeout=300  # 5 minutes for llama3 (it's slow!)
        )
        
        print(f"[LLM] Response status: {response.status_code}", flush=True)
        sys.stdout.flush()
        response.raise_for_status()
        
        result = response.json()
        ai_response = result["message"]["content"]
        
        # Add natural filler words to make the response conversational
        ai_response_with_fillers = add_natural_filler_words(ai_response)
        
        print(f"[LLM] SUCCESS - Got response from {LLM_MODEL}", flush=True)
        print(f"[LLM] Response length: {len(ai_response_with_fillers)} chars", flush=True)
        sys.stdout.flush()
        return ai_response_with_fillers
        
    except requests.exceptions.ConnectionError as e:
        print(f"\n[LLM ERROR] ❌ CONNECTION FAILED", flush=True)
        print(f"[LLM ERROR] Cannot reach: {LLM_API}", flush=True)
        print(f"[LLM ERROR] Make sure Ollama is running", flush=True)
        print(f"[LLM ERROR] Details: {str(e)}\n", flush=True)
        sys.stdout.flush()
        user_message = messages[-1]["content"] if messages else "your message"
        return get_fallback_response(user_message)
        
    except requests.exceptions.Timeout as e:
        print(f"\n[LLM ERROR] ❌ TIMEOUT (120+ seconds)", flush=True)
        print(f"[LLM ERROR] Ollama or model is taking too long", flush=True)
        print(f"[LLM ERROR] Try again - first request loads model into memory", flush=True)
        print(f"[LLM ERROR] Details: {str(e)}\n", flush=True)
        sys.stdout.flush()
        user_message = messages[-1]["content"] if messages else "your message"
        return get_fallback_response(user_message)
        
    except Exception as e:
        print(f"\n[LLM ERROR] ❌ {type(e).__name__}", flush=True)
        print(f"[LLM ERROR] {str(e)}\n", flush=True)
        sys.stdout.flush()
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
