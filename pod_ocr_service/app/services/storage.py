import os
import io
from abc import ABC, abstractmethod
from typing import Tuple
from app.config import get_settings

settings = get_settings()


class BaseStorage(ABC):
    """对象存储抽象基类"""

    @abstractmethod
    def upload(self, file_bytes: bytes, file_key: str, content_type: str = "image/jpeg") -> Tuple[str, str]:
        """
        上传文件并返回: (image_url, image_oss_key)
        """
        pass


class LocalStorage(BaseStorage):
    """本地磁盘持久化存储（开发与测试环境）"""

    def __init__(self, base_dir: str = None, public_base_url: str = None):
        self.base_dir = base_dir or settings.STORAGE_LOCAL_DIR
        self.public_base_url = (public_base_url or settings.STORAGE_PUBLIC_BASE_URL).rstrip("/")
        os.makedirs(self.base_dir, exist_ok=True)

    def upload(self, file_bytes: bytes, file_key: str, content_type: str = "image/jpeg") -> Tuple[str, str]:
        file_path = os.path.join(self.base_dir, file_key)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        image_url = f"{self.public_base_url}/{file_key.replace(os.sep, '/')}"
        return image_url, file_key


class MockOSSStorage(BaseStorage):
    """纯模拟存证存储（无需真实公网连通）"""

    def __init__(self, bucket_name: str = "pod-receipts"):
        self.bucket_name = bucket_name

    def upload(self, file_bytes: bytes, file_key: str, content_type: str = "image/jpeg") -> Tuple[str, str]:
        mock_url = f"https://{self.bucket_name}.oss-cn-hangzhou.aliyuncs.com/{file_key}"
        return mock_url, file_key


class AliyunOSSStorage(BaseStorage):
    """阿里云 OSS 对象存储适配器"""

    def __init__(self):
        try:
            import oss2
            auth = oss2.Auth(settings.OSS_ACCESS_KEY_ID, settings.OSS_ACCESS_KEY_SECRET)
            self.bucket = oss2.Bucket(auth, settings.OSS_ENDPOINT, settings.OSS_BUCKET_NAME)
        except ImportError:
            raise RuntimeError("请安装 oss2 库以启用阿里云 OSS: pip install oss2")

    def upload(self, file_bytes: bytes, file_key: str, content_type: str = "image/jpeg") -> Tuple[str, str]:
        headers = {"Content-Type": content_type}
        self.bucket.put_object(file_key, file_bytes, headers=headers)
        endpoint = settings.OSS_ENDPOINT.replace("http://", "").replace("https://", "")
        image_url = f"https://{settings.OSS_BUCKET_NAME}.{endpoint}/{file_key}"
        return image_url, file_key


class TencentCOSStorage(BaseStorage):
    """腾讯云 COS 对象存储适配器"""

    def __init__(self):
        try:
            from qcloud_cos import CosConfig, CosS3Client
            config = CosConfig(
                Region=settings.COS_REGION,
                SecretId=settings.COS_SECRET_ID,
                SecretKey=settings.COS_SECRET_KEY
            )
            self.client = CosS3Client(config)
        except ImportError:
            raise RuntimeError("请安装 cos-python-sdk-v5 库以启用腾讯云 COS: pip install cos-python-sdk-v5")

    def upload(self, file_bytes: bytes, file_key: str, content_type: str = "image/jpeg") -> Tuple[str, str]:
        self.client.put_object(
            Bucket=settings.COS_BUCKET_NAME,
            Body=file_bytes,
            Key=file_key,
            ContentType=content_type
        )
        image_url = f"https://{settings.COS_BUCKET_NAME}.cos.{settings.COS_REGION}.myqcloud.com/{file_key}"
        return image_url, file_key


def get_storage_client() -> BaseStorage:
    """根据配置动态加载存储实现"""
    storage_type = settings.STORAGE_TYPE.lower()
    if storage_type == "oss":
        return AliyunOSSStorage()
    elif storage_type == "cos":
        return TencentCOSStorage()
    elif storage_type == "mock":
        return MockOSSStorage()
    else:
        return LocalStorage()
