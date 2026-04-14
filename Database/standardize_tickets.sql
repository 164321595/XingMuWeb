-- 清理并标准化所有演出票种数据
-- 每个演出(status=1)必须有4个票种

SET NAMES utf8mb4;

-- 临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 先删除所有现有票种
DELETE FROM ticket_type;

-- 2. 查看status=1的所有演出
SELECT '需要添加票种的演出:' AS info;
SELECT id, title, venue, start_time FROM performance WHERE status = 1 ORDER BY id;

-- 3. 为每个status=1的演出添加4个票种
-- 票种命名规则: VIP/Zone A/Zone B/Zone C 或 类似的分级

-- 演出1: Miyazaki Animation Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(1, 'VIP Zone', 2280.00, 50, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(1, 'Zone A', 1680.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(1, 'Zone B', 1080.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(1, 'Zone C', 680.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出2: Coldplay Music of the Spheres Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(2, 'Floor Standing', 2580.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(2, 'Lower Bowl', 1580.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(2, 'Upper Bowl', 980.00, 500, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(2, 'Standing', 580.00, 800, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出4: Taylor Swift The Eras Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(4, 'Catwalk Floor', 4580.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(4, 'Floor Standing', 3280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(4, 'Lower Bowl', 1880.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(4, 'Upper Bowl', 880.00, 600, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出7: Hamlet Drama
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(7, 'Premium Orchestra', 680.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(7, 'Standard Orchestra', 480.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(7, 'Balcony A', 380.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(7, 'Balcony B', 280.00, 250, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出8: Eason Chan World Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(8, 'VIP Floor', 2580.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(8, 'Floor Standing', 1680.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(8, 'Lower Bowl', 1080.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(8, 'Upper Bowl', 680.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出9: Tom and Jerry Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(9, 'VIP Table', 880.00, 40, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(9, 'Front Row', 580.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(9, 'Standard', 380.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(9, 'Standing', 180.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出10: Phantom of the Opera
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(10, 'VIP Box', 1280.00, 30, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(10, 'Orchestra', 880.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(10, 'First Balcony', 580.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(10, 'Second Balcony', 380.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出11: Jay Chou 2025 World Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(11, 'VIP Floor', 3380.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(11, 'Floor A', 2380.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(11, 'Floor B', 1880.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(11, 'Standing', 1380.00, 500, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出12: Peony Pavilion
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(12, 'VIP Box', 880.00, 30, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(12, 'First Class', 580.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(12, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(12, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出13: Deyun Society Crosstalk
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(13, 'VIP Table', 680.00, 40, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(13, 'Front Row', 480.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(13, 'Standard', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(13, 'Standing', 180.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出15: Frozen Kids Show
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(15, 'VIP Zone', 480.00, 50, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(15, 'Family Package', 380.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(15, 'Standard A', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(15, 'Standard B', 180.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出16: Rock Night Livehouse
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(16, 'VIP Access', 580.00, 50, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(16, 'General Admission', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(16, 'Standing', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(16, 'Back Standing', 180.00, 250, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出18: Jay Chou Shanghai Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(18, 'VIP Floor', 3080.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(18, 'Floor Standing', 2080.00, 250, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(18, 'Lower Bowl', 1380.00, 350, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(18, 'Upper Bowl', 880.00, 500, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出20: National Street Dance Final
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(20, 'VIP Floor', 680.00, 60, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(20, 'Standing', 480.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(20, 'Bleachers A', 280.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(20, 'Bleachers B', 180.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出21: Mayday 2025 Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(21, 'VIP Floor', 2880.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(21, 'Floor Standing', 1880.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(21, 'Lower Bowl', 1280.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(21, 'Upper Bowl', 880.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出24: Modern Dance Rite of Spring
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(24, 'VIP Zone', 680.00, 40, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(24, 'Premium', 480.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(24, 'Standard A', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(24, 'Standard B', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出25: Crosstalk Masters Show
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(25, 'VIP Table', 680.00, 40, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(25, 'Front Row', 480.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(25, 'Standard', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(25, 'Standing', 180.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出26: Jonathan Lee Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(26, 'VIP Floor', 2880.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(26, 'Floor Standing', 1880.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(26, 'Lower Bowl', 1280.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(26, 'Upper Bowl', 880.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出27: Kaixin Mahua Drama
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(27, 'VIP Box', 680.00, 30, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(27, 'First Class', 480.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(27, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(27, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出29: Dream of Red Chamber Yueju
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(29, 'VIP Box', 880.00, 30, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(29, 'First Class', 580.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(29, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(29, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出30: Mayday Beijing Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(30, 'VIP Floor', 3080.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(30, 'Floor Standing', 2080.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(30, 'Lower Bowl', 1380.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(30, 'Upper Bowl', 880.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出66: Mayday 2026 World Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(66, 'VIP Floor', 3580.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(66, 'Floor Standing', 2380.00, 250, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(66, 'Lower Bowl', 1580.00, 350, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(66, 'Upper Bowl', 980.00, 500, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出67: Opera Carmen
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(67, 'VIP Box', 1280.00, 30, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(67, 'Orchestra', 880.00, 100, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(67, 'First Balcony', 580.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(67, 'Second Balcony', 380.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出68: Traditional Peking Opera
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(68, 'VIP Box', 880.00, 30, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(68, 'First Class', 580.00, 80, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(68, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(68, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 演出69: Street Dance Competition
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(69, 'VIP Floor', 680.00, 60, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(69, 'Standing', 480.00, 200, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(69, 'Bleachers A', 280.00, 300, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
(69, 'Bleachers B', 180.00, 400, '2026-03-01 10:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW());

-- 4. 验证结果
SELECT '最终票种统计:' AS info;
SELECT COUNT(*) AS total_tickets FROM ticket_type;

SELECT '各演出票种数量:' AS info;
SELECT p.id, p.title, COUNT(t.id) as ticket_count
FROM performance p
LEFT JOIN ticket_type t ON p.id = t.performance_id
WHERE p.status = 1
GROUP BY p.id, p.title
ORDER BY p.id;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;