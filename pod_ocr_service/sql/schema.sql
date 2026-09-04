CREATE TABLE IF NOT EXISTS `t_receipt_ocr_record` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='送货单回单OCR识别记录表';
