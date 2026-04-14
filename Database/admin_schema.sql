-- Damai Ticket System Admin Database Script

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `admin` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `real_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100),
  `phone` VARCHAR(20),
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
  `status` TINYINT NOT NULL DEFAULT 1,
  `last_login_at` DATETIME,
  `last_login_ip` VARCHAR(50),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (`username`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `admin_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `target_type` VARCHAR(50),
  `target_id` INT,
  `detail` TEXT,
  `ip` VARCHAR(50),
  `user_agent` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (`admin_id`),
  INDEX idx_action (`action`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `admin_login_history` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `ip` VARCHAR(50),
  `user_agent` VARCHAR(255),
  `status` TINYINT NOT NULL DEFAULT 1,
  `fail_reason` VARCHAR(100),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (`admin_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Views

DROP VIEW IF EXISTS v_performance_sales;
CREATE VIEW v_performance_sales AS
SELECT
  p.id, p.title, pc.name AS category_name, p.performer, p.venue,
  p.start_time, p.end_time, p.status, p.cover_image,
  COUNT(DISTINCT o.id) AS order_count,
  COALESCE(SUM(CASE WHEN o.status = 1 THEN o.quantity ELSE 0 END), 0) AS sold_quantity,
  COALESCE(SUM(CASE WHEN o.status = 1 THEN o.amount ELSE 0 END), 0) AS revenue
FROM performance p
LEFT JOIN performance_category pc ON p.category_id = pc.id
LEFT JOIN `order` o ON p.id = o.performance_id
GROUP BY p.id, p.title, pc.name, p.performer, p.venue, p.start_time, p.end_time, p.status, p.cover_image;

DROP VIEW IF EXISTS v_user_consumption;
CREATE VIEW v_user_consumption AS
SELECT
  u.id, u.username, u.phone, u.email, u.status AS user_status, u.created_at AS register_time,
  COUNT(DISTINCT o.id) AS order_count,
  COALESCE(SUM(CASE WHEN o.status = 1 THEN o.quantity ELSE 0 END), 0) AS total_tickets,
  COALESCE(SUM(CASE WHEN o.status = 1 THEN o.amount ELSE 0 END), 0) AS total_consumption
FROM `user` u
LEFT JOIN `order` o ON u.id = o.user_id
GROUP BY u.id, u.username, u.phone, u.email, u.status, u.created_at;

DROP VIEW IF EXISTS v_order_details;
CREATE VIEW v_order_details AS
SELECT
  o.id, o.order_no, o.user_id, u.username, u.phone AS user_phone,
  o.performance_id, p.title AS performance_title, p.performer, p.venue,
  p.start_time AS performance_time, o.ticket_type_id, tt.name AS ticket_name,
  tt.price AS unit_price, o.quantity, o.amount, o.status AS order_status,
  o.expire_time, o.payment_time, o.created_at AS order_time, o.updated_at
FROM `order` o
JOIN `user` u ON o.user_id = u.id
JOIN performance p ON o.performance_id = p.id
JOIN ticket_type tt ON o.ticket_type_id = tt.id;

DROP VIEW IF EXISTS v_daily_sales;
CREATE VIEW v_daily_sales AS
SELECT
  DATE(o.created_at) AS sale_date,
  COUNT(DISTINCT o.user_id) AS buyer_count,
  COUNT(*) AS order_count,
  SUM(CASE WHEN o.status = 1 THEN 1 ELSE 0 END) AS paid_count,
  SUM(CASE WHEN o.status = 1 THEN o.amount ELSE 0 END) AS daily_revenue
FROM `order` o
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- Stored Procedures

DELIMITER //

DROP PROCEDURE IF EXISTS p_close_expired_orders//
CREATE PROCEDURE p_close_expired_orders()
BEGIN
  START TRANSACTION;
  UPDATE `order` SET status = 2, updated_at = NOW() WHERE status = 0 AND expire_time < NOW();
  UPDATE ticket_type tt JOIN `order` o ON tt.id = o.ticket_type_id SET tt.stock = tt.stock + o.quantity WHERE o.status = 2 AND o.expire_time < NOW();
  COMMIT;
END//

DROP PROCEDURE IF EXISTS p_dashboard_stats//
CREATE PROCEDURE p_dashboard_stats()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM `order` WHERE DATE(created_at) = CURDATE() AND status = 1) AS today_orders,
    (SELECT COALESCE(SUM(amount), 0) FROM `order` WHERE DATE(created_at) = CURDATE() AND status = 1) AS today_revenue,
    (SELECT COUNT(*) FROM `order` WHERE status = 0) AS pending_orders,
    (SELECT COUNT(*) FROM performance WHERE status IN (1, 2)) AS active_performances,
    (SELECT COUNT(*) FROM `user`) AS total_users;
END//

DELIMITER ;

-- Triggers

DELIMITER //

DROP TRIGGER IF EXISTS tr_after_order_create//
CREATE TRIGGER tr_after_order_create AFTER INSERT ON `order` FOR EACH ROW
BEGIN
  INSERT INTO admin_log (admin_id, action, target_type, target_id, detail, created_at)
  VALUES (0, 'order_create', 'order', NEW.id, JSON_OBJECT('order_no', NEW.order_no), NOW());
END//

DROP TRIGGER IF EXISTS tr_after_order_status_change//
CREATE TRIGGER tr_after_order_status_change AFTER UPDATE ON `order` FOR EACH ROW
BEGIN
  IF NEW.status = 1 AND OLD.status = 0 THEN
    INSERT INTO admin_log (admin_id, action, target_type, target_id, detail, created_at)
    VALUES (0, 'order_paid', 'order', NEW.id, JSON_OBJECT('order_no', NEW.order_no), NOW());
  ELSEIF NEW.status = 2 AND OLD.status != 2 THEN
    INSERT INTO admin_log (admin_id, action, target_type, target_id, detail, created_at)
    VALUES (0, 'order_cancelled', 'order', NEW.id, JSON_OBJECT('order_no', NEW.order_no), NOW());
  END IF;
END//

DELIMITER ;

-- Init admin data (password: 123456)
INSERT INTO admin (username, password, real_name, email, phone, role, status, created_at, updated_at) VALUES
('admin', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', 'System Admin', 'admin@damai.com', '13800138000', 'super_admin', 1, NOW(), NOW()),
('content_mgr', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', 'Content Manager', 'content@damai.com', '13800138001', 'content_admin', 1, NOW(), NOW()),
('ticket_mgr', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', 'Ticket Manager', 'ticket@damai.com', '13800138002', 'ticket_admin', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
