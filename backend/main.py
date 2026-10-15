from fastapi import FastAPI
from config import settings
from datetime import datetime, timezone
import time
import httpx

from contextlib import asynccontextmanager
from database import init_db

import uuid
import asyncio
from schemas import ChatRequest, ChatResponse
from database import log_request


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🟢")
    init_db()  
    yield      
    print("🔴")

app=FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)


START_TIME = time.time()


async def check_ollama() -> tuple[bool, str]:

    url = "http://localhost:11434/" 
    
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                return True, ""
            else:
                return False, f"model returned error: {response.status_code}"
            
    except Exception as e:
        return False, "model not available"
    
@app.get("/health")
async def health_check():

    uptime_sec = int(time.time() - START_TIME)
    
    is_ok, error_reason = await check_ollama()
    
    response = {
        "status": "ok" if is_ok else "degraded",
        "uptimeSec": uptime_sec,
        "backend": settings.backend,
        "model": settings.model,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    
    if not is_ok:
        response["reason"] = error_reason
        
    return response


@app.get("/model")
async def get_model_info():

    return {
        "backend": settings.backend,
        "model": settings.model,
        "temperature": settings.temperature,
        "max_tokens": settings.max_tokens
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    req_id = f"req_{uuid.uuid4().hex[:8]}"

    prompt_text = request.messages[-1].content if request.messages else ""

    ollama_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    payload = {
        "model": settings.model,
        "messages": ollama_messages,
        "stream": False,  
        "options": {
            "temperature": request.temperature,
            "num_predict": request.maxTokens 
        }
    }
    try:
       
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post("http://localhost:11434/api/chat", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                response_text = data["message"]["content"]
                status = "ok"
                error_msg = ""
            else:
                response_text = ""
                status = "degraded"
                error_msg = f"Ollama error: {response.status_code}"
                
    except Exception as e:
        response_text = ""
        status = "degraded"
        error_msg = "model not available"


    latency_ms = int((time.time() - start_time) * 1000)
    log_data = { 
        "id": req_id,
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "route": "/chat",
        "status": status,
        "backend": settings.backend,
        "model": settings.model,
        "latency_ms_total": latency_ms,
        "input_chars": len(prompt_text),
        "output_chars": len(response_text),
        "temperature": request.temperature,
        "max_tokens": request.maxTokens,
        "prompt_preview": prompt_text[:200],
        "response_preview": response_text[:200],
        "error_message": error_msg
    }

    log_request(log_data)
    return ChatResponse(id=req_id, text=response_text)