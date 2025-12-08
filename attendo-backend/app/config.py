from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    
    # Email settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    ALLOWED_COLLEGE_DOMAIN: str = "iiitr.ac.in"
    FRONTEND_URL: str
    
    # OTP
    OTP_EXPIRY_MINUTES: int = 10
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Valid branches
    VALID_BRANCHES: List[str] = ["CS", "AD", "MC"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()