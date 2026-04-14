SELECT COUNT(*) as order_count FROM `order`;
SELECT COALESCE(SUM(amount), 0) as today_revenue FROM `order` WHERE DATE(created_at) = CURDATE() AND status = 1;
SELECT COALESCE(SUM(amount), 0) as week_revenue FROM `order` WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 1;
SELECT * FROM `order` LIMIT 3;
