import io
import base64
import hashlib
from typing import Tuple
from PIL import Image, ImageOps


class ImageProcessor:
    """
    图片预处理与优化服务:
    - 自动依据 EXIF 旋转纠正手机多角度拍摄问题
    - 限制大图最大尺寸（如最长边不超过 2048px），保留文字锐度同时极大降低网络传输与模型 Token 消耗
    - 计算哈希、转换为 Base64 及压缩存储 Buffer
    """

    MAX_DIMENSION: int = 2048
    JPEG_QUALITY: int = 85

    @classmethod
    def process_and_optimize(
        cls, image_bytes: bytes, filename: str = "upload.jpg"
    ) -> Tuple[bytes, str, str, str]:
        """
        处理图片，返回:
        - 优化后的图片二进制 (processed_bytes)
        - mime 类型 (mime_type)
        - base64 编码字符串 (base64_str)
        - 文件的 sha256 摘要 (file_hash)
        """
        # 1. 计算原始文件哈希 (存证唯一校验)
        file_hash = hashlib.sha256(image_bytes).hexdigest()

        # 2. 读取图片
        with Image.open(io.BytesIO(image_bytes)) as img:
            # 自动处理手机拍摄等 EXIF 方向标记
            img = ImageOps.exif_transpose(img)

            # 转换为 RGB 模式（针对 RGBA 或 CMYK 格式的送货单照片）
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            # 3. 动态缩放超大图片
            width, height = img.size
            if max(width, height) > cls.MAX_DIMENSION:
                scale_ratio = cls.MAX_DIMENSION / float(max(width, height))
                new_width = int(width * scale_ratio)
                new_height = int(height * scale_ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            # 4. 压缩输出为标准 JPEG Buffer
            output_buffer = io.BytesIO()
            img.save(output_buffer, format="JPEG", quality=cls.JPEG_QUALITY, optimize=True)
            processed_bytes = output_buffer.getvalue()

        # 5. 生成 Base64 用于 OpenAI 多模态 API 调用
        base64_str = base64.b64encode(processed_bytes).decode("utf-8")
        mime_type = "image/jpeg"

        return processed_bytes, mime_type, base64_str, file_hash
