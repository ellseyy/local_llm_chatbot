import sqlite3
from config import settings

def init_db():

    conn = sqlite3.connect(settings.sqlite_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            created_at TEXT,
            route TEXT,
            status TEXT,
            backend TEXT,
            model TEXT,
            latency_ms_total INTEGER,
            input_chars INTEGER,
            output_chars INTEGER,
            temperature REAL,
            max_tokens INTEGER,
            prompt_preview TEXT,
            response_preview TEXT,
            error_message TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def log_request(log_data: dict):
    with sqlite3.connect(settings.sqlite_path) as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO requests (
                id, created_at, route, status, backend, model, 
                latency_ms_total, input_chars, output_chars, temperature, 
                max_tokens, prompt_preview, response_preview, error_message
            ) VALUES (
                :id, :created_at, :route, :status, :backend, :model, 
                :latency_ms_total, :input_chars, :output_chars, :temperature, 
                :max_tokens, :prompt_preview, :response_preview, :error_message
            )
        """, log_data)