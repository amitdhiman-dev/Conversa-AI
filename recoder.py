import sounddevice as sd
from scipy.io.wavfile import write
import whisper
import requests
import pyttsx3
import os
import sys

# ==============================
# ⚙️ CONFIG
# ==============================
SAMPLE_RATE = 16000
DURATION = 5  # seconds to record
AUDIO_FILE = "input.wav"
LLM_API = "http://localhost:1234/v1/chat/completions"

# Add FFmpeg to PATH
ffmpeg_path = r"C:\Users\Amit\AppData\Local\Microsoft\WinGet\Links"
if ffmpeg_path not in os.environ.get("PATH", ""):
    os.environ["PATH"] = ffmpeg_path + ";" + os.environ.get("PATH", "")

# ==============================
# 🔊 INIT TTS
# ==============================
engine = pyttsx3.init()
engine.setProperty('rate', 180)

# ==============================
# 🧠 LOAD WHISPER MODEL
# ==============================
print("Loading Whisper model...")
model = whisper.load_model("base")  # use "small" if you have good GPU

# ==============================
# 💬 MEMORY
# ==============================
messages = [
    {
        "role": "system",
        "content": "You are a helpful AI assistant. Speak naturally like a human."
    }
]

# ==============================
# 🎤 RECORD AUDIO
# ==============================
def record_audio():
    print("\n🎤 Speak now...")
    audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1)
    sd.wait()
    write(AUDIO_FILE, SAMPLE_RATE, audio)
    print("✅ Audio recorded")

# ==============================
# 🧠 SPEECH → TEXT
# ==============================
def speech_to_text():
    result = model.transcribe(AUDIO_FILE)
    return result["text"]

# ==============================
# 🤖 ASK LOCAL LLM
# ==============================
def ask_llm(messages):
    try:
        response = requests.post(
            LLM_API,
            json={
                "model": "local-model",
                "messages": messages,
                "temperature": 0.7
            },
            timeout=60
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print("❌ LLM Error:", e)
        return "Sorry, I couldn't process that."

# ==============================
# 🔊 TEXT → SPEECH
# ==============================
def speak(text):
    engine.say(text)
    engine.runAndWait()

# ==============================
# 🔁 MAIN LOOP
# ==============================
def run_assistant():
    print("\n🚀 Voice Assistant Started (Press Ctrl+C to stop)\n")

    while True:
        input("👉 Press ENTER to talk...")

        # 🎤 Record
        record_audio()

        # 🧠 STT
        user_text = speech_to_text()
        print(f"🧑 You: {user_text}")

        if user_text.strip() == "":
            print("⚠️ Didn't catch that, try again.")
            continue

        # Add to memory
        messages.append({"role": "user", "content": user_text})

        # 🤖 LLM
        reply = ask_llm(messages)
        print(f"🤖 AI: {reply}")

        # Save response
        messages.append({"role": "assistant", "content": reply})

        # 🔊 Speak
        speak(reply)


# ==============================
# ▶️ RUN
# ==============================
if __name__ == "__main__":
    try:
        run_assistant()
    except KeyboardInterrupt:
        print("\n👋 Exiting... Goodbye!")
    finally:
        # Clean up pyttsx3 engine
        try:
            engine.stop()
        except:
            pass