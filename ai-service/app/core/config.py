import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AICTE FDR AI Document Processing Service"
    VERSION: str = "1.0.0"
    API_KEY: str = os.getenv("AI_SERVICE_API_KEY", "development_secure_internal_ai_token_key_32chars")
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "/opt/homebrew/bin/tesseract")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "http://127.0.0.1:54321")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
