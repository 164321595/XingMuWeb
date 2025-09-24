-- 重置数据库脚本 - 只清空数据，保留表结构
USE ticketdb;

-- 关闭外键约束检查，确保数据删除顺利进行
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 先清空有外键依赖的表（顺序很重要）
-- 订单表依赖用户表、演出表、票种表
TRUNCATE TABLE `order`;

-- 票种表依赖演出表
TRUNCATE TABLE `ticket_type`;

-- 2. 清空其他表
-- 演出表依赖演出分类表
TRUNCATE TABLE `performance`;

-- 用户隐私设置表依赖用户表
TRUNCATE TABLE `user_privacy_setting`;

-- 3. 清空基础表
TRUNCATE TABLE `user`;
TRUNCATE TABLE `performance_category`;
TRUNCATE TABLE `system_config`;

-- 重新开启外键约束检查
SET FOREIGN_KEY_CHECKS = 1;

-- 重置自增ID（可选，根据需要）
ALTER TABLE `user` AUTO_INCREMENT = 1;
ALTER TABLE `performance_category` AUTO_INCREMENT = 1;
ALTER TABLE `performance` AUTO_INCREMENT = 1;
ALTER TABLE `ticket_type` AUTO_INCREMENT = 1;
ALTER TABLE `order` AUTO_INCREMENT = 1;
ALTER TABLE `user_privacy_setting` AUTO_INCREMENT = 1;
ALTER TABLE `system_config` AUTO_INCREMENT = 1;