from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Sturgeon AI Application Settings"""

    # Application
    APP_NAME: str = "Sturgeon AI"
    DEBUG: bool = False
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://sturgeon.ai"]

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"

    # Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo"

    # AgentKit
    AGENT_KIT_ENABLED: bool = True
    AGENT_KIT_API_KEY: str = ""

    # ChatKit
    CHAT_KIT_ENABLED: bool = True

    # Vector Database (Pinecone/Chroma)
    VECTOR_DB_ENABLED: bool = False
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""

    # Stripe Billing
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Redis (for Celery and caching)
    REDIS_URL: str = "redis://localhost:6379"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
