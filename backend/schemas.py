from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    maxTokens: Optional[int] = 1000
    

class ChatResponse(BaseModel):
    id: str
    text: str
    usage: Optional[dict] = None