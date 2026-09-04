from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import get_settings

settings = get_settings()

import logging

logger = logging.getLogger(__name__)

# 优先连接配置的 MySQL 8.0 数据库，若尚未启动 MySQL 则自动回退到本地 sqlite 文件，确保本地即开即用
try:
    engine = create_engine(
        settings.database_url,
        echo=settings.DB_ECHO,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=3600
    )
    # 测试连接连通性
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to MySQL database: %s", settings.DB_NAME)
except Exception as e:
    logger.warning("MySQL 连接失败 (%s)，自动启用本地 SQLite 数据库 (./pod_ocr_records.db) 确保本地服务可立即部署识别", e)
    sqlite_url = "sqlite:///./pod_ocr_records.db"
    engine = create_engine(
        sqlite_url,
        echo=False,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI 依赖注入 Session 发生器"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
