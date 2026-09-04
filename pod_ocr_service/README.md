# 送货单回单智能扫描识别系统 (POD OCR) 核心服务

基于 **Python 3.10+**、**FastAPI**、**SQLAlchemy 2.0** 与 **视觉多模态大模型 (VLM) API** 开发的送货单回单（Proof of Delivery, POD）批量扫描识别与存证入库系统。

专门针对物流场景中通过**水印相机**（今日水印相机、马克水印相机等）拍摄的纸质签收单照片进行高精度字段提取与合规入库，为企业数据仓库（DW）T+1 分区抽取提供标准数据源。

---

## 目录
- [核心业务规范](#核心业务规范)
- [技术架构与目录组织](#技术架构与目录组织)
- [数据库 DDL 与数仓支撑](#数据库-ddl-与数仓支撑)
- [快速开始与配置](#快速开始与配置)
- [API 接口规范](#api-接口规范)
- [自动化测试](#自动化测试)

---

## 核心业务规范

1. **送货单号 (`delivery_no`):**
   - 优先识别打印的条形码 (Barcode) 或二维码 (QR Code)；
   - 次选单据头部标注的“送货单号”、“单号”、“凭证号”、“No.”等标签后的连续字母数字串；
   - 自动清洗汉字、空格及标点符号。若彻底模糊或缺失，严格输出 `null`。
2. **水印签收日期 (`sign_date`) 与时间 (`sign_time`):**
   - 定位图片边缘/四角（通常位于底部、左下角或右下角）由相机应用生成的半透明或叠加数字时间水印；
   - 日期强制格式化为 ISO 8601 标准：`YYYY-MM-DD`（数仓核心分区与日汇总关键维度）；
   - 若水印含时分秒，格式化为 `YYYY-MM-DD HH:mm:ss` 赋值给 `sign_time`，否则置为 `null`；
   - **严格禁止**误采送货单表格内部打印的制单日期/出库日期。
3. **状态机与防幻觉 (`recognition_status`):**
   - `1`：**识别成功**（`delivery_no` 与 `sign_date` 均成功识别）；
   - `3`：**待处理**（任一核心字段缺失或模糊，自动转入人工复核流）；
   - `2`：**人工补录**（经客服/操作员确认并手工修正）。

---

## 技术架构与目录组织

```
pod_ocr_service/
├── app/
│   ├── config.py                 # 系统配置与环境变量加载 (Pydantic Settings)
│   ├── database.py               # SQLAlchemy 2.0 数据库引擎与 Session 依赖
│   ├── models.py                 # t_receipt_ocr_record ORM 模型与状态枚举
│   ├── schemas.py                # Pydantic v2 请求响应与 VLM JSON Mode 规范
│   ├── services/
│   │   ├── image_processor.py    # Pillow 图像 EXIF 纠偏、等比自适应压缩、Base64
│   │   ├── storage.py            # 对象存储抽象 (本地磁盘 / 阿里云 OSS / 腾讯云 COS / 纯模拟)
│   │   ├── vlm_client.py         # 视觉大模型多模态客户端 (DashScope qwen-vl-max / OpenAI)
│   │   └── pod_processor.py      # 核心业务调度、ThreadPoolExecutor 并发、ZIP 解压、落库
│   ├── routers/
│   │   └── pod.py                # FastAPI 路由: 单图/多图批量/ZIP上传、记录列表、人工补录
│   └── main.py                   # FastAPI 应用启动入口与静态存证挂载
├── sql/
│   └── schema.sql                # 生产 MySQL 8.0 DDL 表结构定义
├── tests/
│   └── test_pod_ocr.py           # 自动化测试套件 (模型清洗、并发调度、内存隔离验证)
├── requirements.txt              # 核心依赖清单
├── .env.example                  # 环境变量模板
└── README.md
```

---

## 数据库 DDL 与数仓支撑

文件位置：`sql/schema.sql`

```sql
CREATE TABLE `t_receipt_ocr_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `delivery_no` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '送货单号',
  `sign_date` DATE NULL COMMENT '签收日期(数仓分区与统计核心字段)',
  `sign_time` DATETIME NULL COMMENT '水印完整签收时间',
  `image_url` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '对象存储访问地址',
  `image_oss_key` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '对象存储Key',
  `raw_file_name` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '上传原始文件名',
  `batch_id` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '批次号',
  `recognition_status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-识别成功 2-人工补录 3-待处理',
  `created_by` VARCHAR(64) NOT NULL DEFAULT 'system',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_delivery_no` (`delivery_no`),
  KEY `idx_sign_date` (`sign_date`),
  KEY `idx_updated_at` (`updated_at`),
  KEY `idx_batch_id` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 快速开始与配置

### 1. 安装依赖
```bash
cd pod_ocr_service
python -m pip install -r requirements.txt
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env` 并按需调整：
```ini
# MySQL 8.0
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ztobase_db

# 阿里 DashScope 或 OpenAI 兼容端点
VLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
VLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VLM_MODEL_NAME=qwen-vl-max

# 存储模式: local (本地持久化及存证静态访问), oss, cos, mock
STORAGE_TYPE=local
```

### 3. 启动服务
```bash
python -m app.main
```
启动后访问接口文档交互界面：`http://localhost:8000/docs`。

---

## API 接口规范

| 请求方式 | 路径 | 功能说明 |
|:---|:---|:---|
| `POST` | `/api/v1/pod/upload/single` | 单张回单照片上传、预处理、存证并识别入库 |
| `POST` | `/api/v1/pod/upload/batch` | 多张回单图片批量并发上传与识别 |
| `POST` | `/api/v1/pod/upload/zip` | **ZIP 压缩包**上传，自动解压图片并多线程并发识别入库 |
| `GET`  | `/api/v1/pod/records` | 记录查询与分页，供数仓调度系统（如 DataX/Flink/Spark）或管理后台抽取 |
| `PUT`  | `/api/v1/pod/records/{id}/manual-record` | 状态为 3 时的人工补录与复核修改接口（状态自动转为 2） |
| `GET`  | `/health` | 服务健康检查 |

---

## 自动化测试
运行包含图片等比缩放、VLM 提示词响应清洗、并发线程安全、事务状态流转的单元与集成测试：
```bash
python -m tests.test_pod_ocr
```
