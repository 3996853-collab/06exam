import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import engine, Base
from app.routers import pod

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时自动检查并创建数据库表结构（若尚不存在）
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # 开发模式或未连接数据库时友好容错
        print(f"[Warning] 自动初始化数据库表时出现提示: {e}")
    # 确保本地存储目录存在
    os.makedirs(settings.STORAGE_LOCAL_DIR, exist_ok=True)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="送货单回单智能扫描识别系统（POD OCR）核心服务接口",
    version="1.0.0",
    lifespan=lifespan
)

# 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载本地存储访问路径（供前端预览存证图片）
if os.path.exists(settings.STORAGE_LOCAL_DIR):
    app.mount("/storage", StaticFiles(directory=settings.STORAGE_LOCAL_DIR), name="storage")

# 注册业务路由
app.include_router(pod.router)


@app.get("/health", tags=["系统健康检查"])
def health_check():
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "env": settings.APP_ENV,
        "vlm_model": settings.VLM_MODEL_NAME,
        "storage_type": settings.STORAGE_TYPE
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )
