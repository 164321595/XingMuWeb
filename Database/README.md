# 票务系统数据库

这是票务系统的数据库相关文件，包含数据库结构定义、表设计说明和初始化脚本。

## 数据库信息

- **数据库名称**: ticketdb
- **数据库类型**: MySQL
- **字符集**: utf8mb4
- **存储引擎**: InnoDB

## 项目结构

```
Database/
├── Createdb.sql    # 数据库创建和表结构定义脚本
├── Order.sql       # 订单相关数据脚本
├── Performance.sql # 演出相关数据脚本
├── Userdb.sql      # 用户相关数据脚本
└── README.md       # 数据库说明文档
```

## 数据库结构

### 主要数据表

1. **用户表** (`user`)
   - 存储系统用户的基本信息
   - 包含用户ID、用户名、密码、手机号、邮箱、头像等字段
   - 支持用户认证和个人信息管理功能

2. **演出分类表** (`performance_category`)
   - 存储演出的分类信息
   - 支持多级分类结构
   - 包含分类ID、名称、父分类ID、排序权重等字段

3. **演出表** (`performance`)
   - 存储演出的详细信息
   - 包含演出ID、标题、分类、封面、描述、表演者、场馆、时间等字段
   - 与分类表建立外键关联

4. **票种表** (`ticket_type`)
   - 存储演出的票种信息
   - 包含票种ID、所属演出ID、名称、价格、库存、销售时间等字段
   - 与演出表建立外键关联

5. **订单表** (`order`)
   - 存储用户的订单信息
   - 包含订单ID、订单编号、用户ID、演出ID、票种ID、数量、金额、状态等字段
   - 与用户表、演出表、票种表建立外键关联

6. **用户隐私设置表** (`user_privacy_setting`)
   - 存储用户的隐私设置信息
   - 包含数据收集、个性化广告、第三方共享等设置选项
   - 与用户表建立一对一关联

7. **系统配置表** (`system_config`)
   - 存储系统的全局配置信息
   - 使用键值对的形式存储配置项

### 表结构详细说明

#### user表
```sql
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
```

#### performance_category表
```sql
CREATE TABLE `performance_category` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类 ID',
`name` VARCHAR(50) NOT NULL COMMENT '分类名称',
`parent_id` INT NOT NULL DEFAULT 0 COMMENT '父分类 ID(0 为顶级)',
`sort` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
INDEX idx_parent_id (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='演出分类表';
```

#### performance表
```sql
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
```

#### ticket_type表
```sql
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
```

#### order表
```sql
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
```

#### user_privacy_setting表
```sql
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
```

#### system_config表
```sql
CREATE TABLE `system_config` (
`id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置 ID',
`key` VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
`value` TEXT COMMENT '配置值',
`description` VARCHAR(255) DEFAULT '' COMMENT '配置描述',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';
```

## 初始化数据

系统初始化脚本会自动创建以下基础数据：

### 系统配置
```sql
INSERT INTO `system_config` (`key`, `value`, `description`) VALUES
('system_maintenance', 'false', '系统是否维护中(true/false)');
```

### 演出分类
```sql
INSERT INTO `performance_category` (`name`, `parent_id`, `sort`, `created_at`, `updated_at`) VALUES
('演唱会', 0, 1, NOW(), NOW()),
('话剧', 0, 2, NOW(), NOW()),
('音乐会', 0, 3, NOW(), NOW()),
('戏曲', 0, 4, NOW(), NOW()),
('舞蹈', 0, 5, NOW(), NOW());
```

## 数据库操作指南

### 初始化数据库

```bash
# 登录MySQL并执行初始化脚本
mysql -u root -p < Createdb.sql
```

### 数据备份

```bash
# 备份整个数据库
mysqldump -u root -p ticketdb > ticketdb_backup.sql

# 备份单个表
mysqldump -u root -p ticketdb user > user_backup.sql
```

### 数据恢复

```bash
# 恢复数据库
mysql -u root -p ticketdb < ticketdb_backup.sql
```

## 索引优化

系统在常用查询字段上创建了索引，以提高查询性能：
- `user`表: `idx_username`
- `performance_category`表: `idx_parent_id`
- `performance`表: `idx_category_id`, `idx_status`, `idx_start_time`
- `ticket_type`表: `idx_performance_id`, `idx_status`
- `order`表: `idx_user_id`, `idx_performance_id`, `idx_order_no`, `idx_status`, `idx_created_at`

## 数据安全

1. **密码加密**
   - 用户密码采用加密存储，禁止明文存储
   - 推荐使用bcrypt或Argon2等现代密码哈希算法

2. **访问控制**
   - 严格控制数据库用户权限
   - 生产环境避免使用root用户连接数据库
   - 配置合适的防火墙规则

3. **定期备份**
   - 建议定期备份数据库，防止数据丢失
   - 备份文件应存储在安全的位置

## 注意事项
- 确保MySQL服务版本兼容（推荐5.7+或8.0+）
- 生产环境下，修改数据库连接密码和权限设置
- 定期优化数据库表结构和查询性能
- 遵守数据保护法规，妥善处理用户隐私数据