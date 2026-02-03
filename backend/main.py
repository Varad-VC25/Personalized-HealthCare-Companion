from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
from db import users_collection
from passlib.context import CryptContext
from utils import send_otp_email
import secrets
import time
import threading

# Translator
from deep_translator import GoogleTranslator

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
otp_store = {}

# ---------------- MIDDLEWARE ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONSTANTS ----------------

SYSTEM_PROMPT = (
    "You are an empathetic, calm, and emotionally supportive mental health companion. "
    "Your primary role is to listen deeply, validate emotions, and respond with warmth and care. "

    "Always acknowledge the user's feelings first before anything else. "
    "Use gentle, human language that makes the user feel heard and understood. "
    "Avoid being clinical, robotic, or overly technical. "

    "Do NOT give medical diagnoses, do NOT prescribe medication, "
    "and do NOT encourage harmful behavior. "
    "If the user expresses distress, sadness, anxiety, loneliness, or overwhelm, "
    "respond with compassion, reassurance, and emotional validation. "

    "Encourage reflection using soft, open-ended questions. "
    "Ask at most ONE gentle follow-up question per reply. "

    "Keep responses between 2 to 5 short, emotionally rich sentences. "
    "Never judge, never shame, never dismiss feelings. "
    "If a question is political, technical, or unrelated to mental well-being, "
    "politely redirect the conversation back to emotional support."
)

MODEL_NAME = "llama3:8b"
OLLAMA_URL = "http://127.0.0.1:11434/v1/chat/completions"

LANG_CODE_MAP = {
    "en-US": "en",
    "hi-IN": "hi",
    "mr-IN": "mr"
}

# ---------------- MODEL WARM-UP ----------------

def warm_up_model():
    try:
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Hello"}
            ],
            "temperature": 0.8,
            "top_p": 0.9
        }
        requests.post(OLLAMA_URL, json=payload, timeout=30)
        print("✅ LLaMA-3 warmed up")
    except Exception as e:
        print("⚠️ Warm-up failed:", e)

threading.Thread(target=warm_up_model, daemon=True).start()

# ---------------- CHAT ROUTE ----------------

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()

    user_message = data.get("text", "").strip()
    language_code = data.get("language", "en-US")
    source_lang = LANG_CODE_MAP.get(language_code, "en")

    if not user_message:
        return {"reply": "I’m here with you 💙 Take your time."}

    # 1️⃣ Translate input → English
    user_message_en = user_message
    if source_lang != "en":
        user_message_en = GoogleTranslator(
            source=source_lang,
            target="en"
        ).translate(user_message)

    # 2️⃣ Send to LLaMA-3
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message_en}
        ],
        "temperature": 0.8,
        "top_p": 0.9
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()
        bot_reply_en = result["choices"][0]["message"]["content"]

        # 3️⃣ Translate back → original language
        final_reply = bot_reply_en
        if source_lang != "en":
            final_reply = GoogleTranslator(
                source="en",
                target=source_lang
            ).translate(bot_reply_en)

        return {"reply": final_reply}

    except Exception as e:
        print("Chat error:", e)
        return {
            "reply": (
                "सध्या काही अडचण येत आहे 💙."
                if source_lang == "mr"
                else "अभी कुछ समस्या हो रही है 💙."
                if source_lang == "hi"
                else "I’m having a little trouble right now, but I’m still here 💙."
            )
        }

# ---------------- AUTH & OTP ----------------

@app.post("/signup")
async def signup(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Username and password required"}

    if users_collection.find_one({"username": username}):
        return {"success": False, "message": "Username already taken"}

    hashed_password = pwd_context.hash(password)
    users_collection.insert_one({"username": username, "password": hashed_password})
    return {"success": True, "message": "Signup successful"}

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    user = users_collection.find_one({"username": username})
    if not user or not pwd_context.verify(password, user["password"]):
        return {"success": False, "message": "Invalid username or password"}

    return {"success": True, "message": "Login successful"}

@app.post("/send-otp")
async def send_otp(request: Request):
    data = await request.json()
    email = data.get("email")

    otp = str(secrets.randbelow(1000000)).zfill(6)
    otp_store[email] = {"otp": otp, "timestamp": time.time()}

    try:
        await send_otp_email(email, otp)
        return {"success": True, "message": "OTP sent successfully"}
    except:
        return {"success": False, "message": "Failed to send OTP"}

@app.post("/verify-otp")
async def verify_otp(request: Request):
    data = await request.json()
    email = data.get("email")
    otp = data.get("otp")
    password = data.get("password")

    record = otp_store.get(email)
    if not record or record["otp"] != otp:
        return {"success": False, "message": "Invalid or expired OTP"}

    if time.time() - record["timestamp"] > 300:
        del otp_store[email]
        return {"success": False, "message": "OTP expired"}

    hashed_password = pwd_context.hash(password)
    users_collection.insert_one({"username": email, "password": hashed_password})
    del otp_store[email]

    return {"success": True, "message": "OTP verified and account created"}
