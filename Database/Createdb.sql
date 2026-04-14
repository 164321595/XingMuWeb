-- Create database
CREATE DATABASE IF NOT EXISTS ticketdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticketdb;

CREATE TABLE `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT '',
  `email` VARCHAR(100) DEFAULT '',
  `avatar` VARCHAR(255) DEFAULT '',
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `performance_category` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `parent_id` INT NOT NULL DEFAULT 0,
  `sort` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_id (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `performance` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL,
  `cover_image` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `performer` VARCHAR(100) NOT NULL,
  `venue` VARCHAR(100) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` TINYINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_id (`category_id`),
  INDEX idx_status (`status`),
  INDEX idx_start_time (`start_time`),
  CONSTRAINT fk_performance_category FOREIGN KEY (`category_id`) REFERENCES `performance_category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ticket_type` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `performance_id` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `sale_start_time` DATETIME NOT NULL,
  `sale_end_time` DATETIME NOT NULL,
  `status` TINYINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_performance_id (`performance_id`),
  INDEX idx_status (`status`),
  CONSTRAINT fk_ticket_performance FOREIGN KEY (`performance_id`) REFERENCES `performance` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `order` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `performance_id` INT NOT NULL,
  `ticket_type_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` TINYINT NOT NULL,
  `expire_time` DATETIME,
  `payment_time` DATETIME,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (`user_id`),
  INDEX idx_performance_id (`performance_id`),
  INDEX idx_order_no (`order_no`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`),
  CONSTRAINT fk_order_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT fk_order_performance FOREIGN KEY (`performance_id`) REFERENCES `performance` (`id`),
  CONSTRAINT fk_order_ticket_type FOREIGN KEY (`ticket_type_id`) REFERENCES `ticket_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_privacy_setting` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL UNIQUE,
  `data_collection` TINYINT NOT NULL DEFAULT 1,
  `personalized_ads` TINYINT NOT NULL DEFAULT 1,
  `third_party_sharing` TINYINT NOT NULL DEFAULT 0,
  `marketing_emails` TINYINT NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_privacy_user FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `system_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL UNIQUE,
  `value` TEXT,
  `description` VARCHAR(255) DEFAULT '',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
