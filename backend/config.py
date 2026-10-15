from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    port: int = 8000
    backend: str = "ollama"
    model: str = "llama3.1:8b"
    temperature: float = 0.7
    max_tokens: int = 1000
    sqlite_path: str = "logs.db"
    request_timeout_sec: int = 30


    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()