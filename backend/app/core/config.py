import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 数据库配置
    database_url: str = "sqlite:///./posts.db"
    
    # JWT配置
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # 上传配置
    upload_path: str = "uploads"
    max_file_size: int = 20 * 1024 * 1024  # 20MB
    allowed_extensions: list = [".jpg", ".jpeg", ".png", ".gif"]
    
    class Config:
        env_file = ".env"

settings = Settings()