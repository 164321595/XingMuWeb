-- 创建数据库
CREATE DATABASE IF NOT EXISTS ticketdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticketdb;

-- 1. 用户表
CREATE TABLE `user` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户 ID',
`username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
`password` VARCHAR(100) NOT NULL COMMENT '加密后的密码',
`phone` VARCHAR(20) DEFAULT '' COMMENT '手机号',
`email` VARCHAR(100) DEFAULT '' COMMENT '邮箱',
`avatar` VARCHAR(255) DEFAULT '' COMMENT '头像 URL',
`status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态(1:正常,0:禁用)',
`created_at` DATETIME NOT NULL COMMENT '创建时间',
`updated_at` DATETIME NOT NULL COMMENT '更新时间',
INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 演出分类表
CREATE TABLE `performance_category` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类 ID',
`name` VARCHAR(50) NOT NULL COMMENT '分类名称',
`parent_id` INT NOT NULL DEFAULT 0 COMMENT '父分类 ID(0 为顶级)',
`sort` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_parent_id (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='演出分类表';

-- 3. 演出表
CREATE TABLE `performance` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '演出 ID',
`title` VARCHAR(100) NOT NULL COMMENT '演出标题',
`category_id` INT NOT NULL COMMENT '所属分类 ID',
`cover_image` VARCHAR(255) NOT NULL COMMENT '封面图片 URL',
`description` TEXT COMMENT '演出描述',
`performer` VARCHAR(100) NOT NULL COMMENT '表演者/团体',
`venue` VARCHAR(100) NOT NULL COMMENT '演出场馆',
`start_time` DATETIME NOT NULL COMMENT '开始时间',
`end_time` DATETIME NOT NULL COMMENT '结束时间',
`status` TINYINT NOT NULL COMMENT '状态(0:未开售,1:预售,2:在售)',
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_category_id (`category_id`),
INDEX idx_status (`status`),
INDEX idx_start_time (`start_time`),
CONSTRAINT fk_performance_category FOREIGN KEY (`category_id`) REFERENCES `performance_category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='演出表';

-- 4. 票种表
CREATE TABLE `ticket_type` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '票种 ID',
`performance_id` INT NOT NULL COMMENT '所属演出 ID',
`name` VARCHAR(50) NOT NULL COMMENT '票种名称',
`price` DECIMAL(10,2) NOT NULL COMMENT '票价',
`stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量',
`sale_start_time` DATETIME NOT NULL COMMENT '销售开始时间',
`sale_end_time` DATETIME NOT NULL COMMENT '销售结束时间',
`status` TINYINT NOT NULL COMMENT '状态(0:未开售,1:在售)',
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_performance_id (`performance_id`),
INDEX idx_status (`status`),
CONSTRAINT fk_ticket_performance FOREIGN KEY (`performance_id`) REFERENCES `performance` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票种表';

-- 5. 订单表
CREATE TABLE `order` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单 ID',
`order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
`user_id` INT NOT NULL COMMENT '用户 ID',
`performance_id` INT NOT NULL COMMENT '演出 ID',
`ticket_type_id` INT NOT NULL COMMENT '票种 ID',
`quantity` INT NOT NULL COMMENT '购票数量',
`amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
`status` TINYINT NOT NULL COMMENT '状态(0:待支付,1:已支付,2:已取消)',
`expire_time` DATETIME COMMENT '过期时间',
`payment_time` DATETIME COMMENT '支付时间',
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_user_id (`user_id`),
INDEX idx_performance_id (`performance_id`),
INDEX idx_order_no (`order_no`),
INDEX idx_status (`status`),
INDEX idx_created_at (`created_at`),
CONSTRAINT fk_order_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
CONSTRAINT fk_order_performance FOREIGN KEY (`performance_id`) REFERENCES `performance` (`id`),
CONSTRAINT fk_order_ticket_type FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 6. 用户隐私设置表
CREATE TABLE `user_privacy_setting` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '设置 ID',
`user_id` INT NOT NULL UNIQUE COMMENT '用户 ID',
`data_collection` TINYINT NOT NULL DEFAULT 1 COMMENT '是否允许数据收集(1:允许,0:禁止)',
`personalized_ads` TINYINT NOT NULL DEFAULT 1 COMMENT '是否允许个性化广告(1:允许,0:禁止)',
`third_party_sharing` TINYINT NOT NULL DEFAULT 0 COMMENT '是否允许第三方共享(1:允许,0:禁止)',
`marketing_emails` TINYINT NOT NULL DEFAULT 1 COMMENT '是否接收营销邮件(1:允许,0:禁止)',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
CONSTRAINT fk_privacy_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户隐私设置表';

-- 7. 系统配置表
CREATE TABLE `system_config` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置 ID',
`key` VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
`value` TEXT COMMENT '配置值',
`description` VARCHAR(255) DEFAULT '' COMMENT '配置描述',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';



