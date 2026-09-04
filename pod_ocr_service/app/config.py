from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "POD-OCR-Service"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True

    # Database
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_NAME: str = "ztobase_db"
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # VLM API (OpenAI Compatible, e.g., DashScope qwen-vl-max)
    VLM_API_KEY: str = "mock-api-key"
    VLM_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    VLM_MODEL_NAME: str = "qwen-vl-max"
    VLM_TIMEOUT_SECONDS: int = 60
    VLM_MAX_RETRIES: int = 2

    # Concurrency
    MAX_CONCURRENT_WORKERS: int = 5

    # Storage: local, mock, oss, cos
    STORAGE_TYPE: Literal["local", "mock", "oss", "cos"] = "local"
    STORAGE_LOCAL_DIR: str = "./storage_uploads"
    STORAGE_PUBLIC_BASE_URL: str = "http://localhost:8000/storage"

    # Aliyun OSS
    OSS_ACCESS_KEY_ID: str = ""
    OSS_ACCESS_KEY_SECRET: str = ""
    OSS_ENDPOINT: str = "oss-cn-hangzhou.aliyuncs.com"
    OSS_BUCKET_NAME: str = "pod-receipts"

    # Tencent COS
    COS_SECRET_ID: str = ""
    COS_SECRET_KEY: str = ""
    COS_REGION: str = "ap-guangzhou"
    COS_BUCKET_NAME: str = "pod-receipts"

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@"
            f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
