-- 完整测试数据 - 用于系统测试
-- 包含：管理员、用户、演出、票种、订单等完整数据
-- 执行顺序：1. Createdb.sql  2. admin_schema.sql  3. 本文件

SET NAMES utf8mb4;

-- =====================================================
-- 注意: 管理员数据已在 admin_schema.sql 中插入
-- 如需重置管理员密码，使用以下SQL:
-- UPDATE admin SET password='$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO' WHERE username='admin';
-- 密码都是: 123456

-- =====================================================
-- 2. 用户数据
-- =====================================================
INSERT INTO user (username, password, phone, email, avatar, status, created_at, updated_at) VALUES
('user1', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', '13800001001', 'user1@example.com', '/uploads/avatars/default.png', 1, '2026-01-01 10:00:00', NOW()),
('user2', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', '13800001002', 'user2@example.com', '/uploads/avatars/default.png', 1, '2026-01-05 10:00:00', NOW()),
('user3', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', '13800001003', 'user3@example.com', '/uploads/avatars/default.png', 1, '2026-01-10 10:00:00', NOW()),
('user4', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', '13800001004', 'user4@example.com', '/uploads/avatars/default.png', 1, '2026-01-15 10:00:00', NOW()),
('user5', '$2b$12$T5eHggd93Bo9z.bX/9Tfs.EvnFx.ooVIXbrWzV9x9nZhpiWCBQDkO', '13800001005', 'user5@example.com', '/uploads/avatars/default.png', 1, '2026-01-20 10:00:00', NOW());

INSERT INTO user_privacy_setting (user_id, data_collection, personalized_ads, third_party_sharing, marketing_emails) VALUES
(1, 1, 1, 0, 1),
(2, 1, 1, 0, 1),
(3, 1, 1, 0, 1),
(4, 1, 1, 0, 1),
(5, 1, 1, 0, 1);

-- =====================================================
-- 3. 分类数据
-- =====================================================
INSERT INTO performance_category (name, parent_id, sort) VALUES
('演唱会', 0, 1),
('音乐会', 0, 2),
('话剧', 0, 3),
('舞蹈', 0, 4),
('儿童剧', 0, 5),
('戏曲', 0, 6),
('曲艺', 0, 7),
('体育', 0, 8);

-- =====================================================
-- 4. 演出数据 (2026年)
-- =====================================================
INSERT INTO performance (title, category_id, cover_image, description, performer, venue, start_time, end_time, status, created_at, updated_at) VALUES
('Miyazaki Animation Concert', 2, 'https://picsum.photos/id/1/800/450', '宫崎骏动画主题音乐会', 'Tokyo Symphony', 'Guangzhou Opera House', '2026-04-20 19:30:00', '2026-04-20 21:30:00', 1, NOW(), NOW()),
('Coldplay Music of the Spheres', 1, 'https://picsum.photos/id/2/800/450', 'Coldplay世界巡回演唱会北京站', 'Coldplay', 'Beijing National Stadium', '2026-05-01 19:30:00', '2026-05-01 22:30:00', 1, NOW(), NOW()),
('Taylor Swift Eras Tour', 1, 'https://picsum.photos/id/4/800/450', 'Taylor Swift时代世界巡回演唱会', 'Taylor Swift', 'Shanghai Stadium', '2026-05-15 19:30:00', '2026-05-15 23:00:00', 1, NOW(), NOW()),
('Hamlet Drama', 3, 'https://picsum.photos/id/7/800/450', '经典莎士比亚话剧《哈姆雷特》', 'Royal Shakespeare', 'Shanghai Drama Center', '2026-04-25 19:00:00', '2026-04-25 21:45:00', 1, NOW(), NOW()),
('Eason Chan World Tour', 1, 'https://picsum.photos/id/8/800/450', '陈奕迅世界巡回演唱会', 'Eason Chan', 'Hong Kong Coliseum', '2026-06-10 20:00:00', '2026-06-10 23:00:00', 1, NOW(), NOW()),
('Phantom of the Opera', 4, 'https://picsum.photos/id/10/800/450', '经典音乐剧《歌剧魅影》', 'Shanghai Opera House', 'Shanghai Grand Theatre', '2026-04-18 19:30:00', '2026-04-18 22:00:00', 1, NOW(), NOW()),
('Jay Chou Concert', 1, 'https://picsum.photos/id/11/800/450', '周杰伦2026世界巡回演唱会', 'Jay Chou', 'Beijing Olympic Stadium', '2026-07-20 19:30:00', '2026-07-20 22:00:00', 1, NOW(), NOW()),
('Peony Pavilion', 6, 'https://picsum.photos/id/12/800/450', '经典昆曲《牡丹亭》', 'Suzhou Kunqu', 'Suzhou Opera Museum', '2026-05-20 19:30:00', '2026-05-20 21:30:00', 1, NOW(), NOW()),
('Deyun Society Crosstalk', 7, 'https://picsum.photos/id/13/800/450', '德云社相声专场', 'Deyun Society', 'Beijing Bridge Theatre', '2026-04-28 19:30:00', '2026-04-28 22:00:00', 1, NOW(), NOW()),
('Frozen Kids Show', 5, 'https://picsum.photos/id/15/800/450', '冰雪奇缘儿童剧', 'Beijing Children Arts', 'Beijing Children Theatre', '2026-05-05 10:30:00', '2026-05-05 12:30:00', 1, NOW(), NOW()),
('Rock Night Livehouse', 1, 'https://picsum.photos/id/16/800/450', '摇滚之夜现场演出', 'Tong Yang', 'Shanghai ModernSky LAB', '2026-06-15 20:00:00', '2026-06-15 23:00:00', 1, NOW(), NOW()),
('National Street Dance Final', 8, 'https://picsum.photos/id/20/800/450', '全国街舞大赛总决赛', 'China Dancers Association', 'Guangzhou Gymnasium', '2026-06-20 14:00:00', '2026-06-20 18:00:00', 1, NOW(), NOW()),
('Mayday Concert', 1, 'https://picsum.photos/id/21/800/450', '五月天2026世界巡回演唱会', 'Mayday', 'Shenzhen Spring Cocoon', '2026-08-25 19:30:00', '2026-08-25 22:00:00', 1, NOW(), NOW()),
('Modern Dance Rite of Spring', 4, 'https://picsum.photos/id/24/800/450', '现代舞《春之祭》', 'Beijing Modern Dance', 'Beijing Bridge Art Center', '2026-05-10 19:30:00', '2026-05-10 21:00:00', 1, NOW(), NOW()),
('Crosstalk Masters Show', 7, 'https://picsum.photos/id/25/800/450', '相声大师精品专场', 'China Folk Art Association', 'Beijing Lao She Teahouse', '2026-05-15 19:30:00', '2026-05-15 22:00:00', 1, NOW(), NOW()),
('Jonathan Lee Concert', 1, 'https://picsum.photos/id/26/800/450', '李宗盛2026音乐会', 'Jonathan Lee', 'Shanghai Oriental Sports', '2026-11-15 19:30:00', '2026-11-15 22:00:00', 1, NOW(), NOW()),
('Dance Drama Confucius', 4, 'https://picsum.photos/id/28/800/450', '舞剧《孔子》', 'China National Opera', 'Xian Grand Theatre', '2026-06-10 19:30:00', '2026-06-10 21:30:00', 1, NOW(), NOW()),
('Dream of Red Chamber Yueju', 6, 'https://picsum.photos/id/29/800/450', '越剧《红楼梦》', 'Zhejiang Yueju Troupe', 'Hangzhou Grand Theatre', '2026-06-10 19:30:00', '2026-06-10 22:00:00', 1, NOW(), NOW()),
('Tom and Jerry Concert', 2, 'https://picsum.photos/id/9/800/450', '猫和老鼠交响乐儿童音乐会', 'China Philharmonic', 'Guangzhou Opera House', '2026-04-30 19:30:00', '2026-04-30 21:00:00', 1, NOW(), NOW()),
('Jazz Night Live', 2, 'https://picsum.photos/id/30/800/450', '上海爵士乐之夜', 'Shanghai Jazz Band', 'Shanghai Jazz Club', '2026-05-08 20:00:00', '2026-05-08 23:00:00', 1, NOW(), NOW()),
('Chopin Piano Concert', 2, 'https://picsum.photos/id/3/800/450', '肖邦钢琴独奏音乐会', 'Lang Lang', 'Beijing Concert Hall', '2026-05-12 19:30:00', '2026-05-12 21:30:00', 1, NOW(), NOW()),
('Shakespeare Hamlet', 3, 'https://picsum.photos/id/7/800/450', '莎士比亚经典话剧', 'Royal Shakespeare', "Beijing People's Art Theatre", '2026-04-22 19:00:00', '2026-04-22 21:30:00', 1, NOW(), NOW()),
('Ballet Swan Lake', 4, 'https://picsum.photos/id/6/800/450', '经典芭蕾舞《天鹅湖》', 'St Petersburg Ballet', 'Guangzhou Grand Theatre', '2026-05-18 19:00:00', '2026-05-18 21:45:00', 1, NOW(), NOW()),
('Classical Music Night', 2, 'https://picsum.photos/id/5/800/450', '古典音乐之夜', 'National Symphony', 'Beijing Concert Hall', '2026-05-22 19:30:00', '2026-05-22 22:00:00', 1, NOW(), NOW()),
('Rock Festival 2026', 1, 'https://picsum.photos/id/16/800/450', '2026摇滚音乐节', 'Various Bands', 'Shanghai ModernSky LAB', '2026-06-16 18:00:00', '2026-06-16 23:00:00', 1, NOW(), NOW());

-- =====================================================
-- 5. 票种数据 (每个演出4个票种)
-- =====================================================
-- 演出1: Miyazaki Animation Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(1, 'VIP Zone', 680.00, 50, '2026-03-01 10:00:00', '2026-04-20 18:00:00', 1, NOW(), NOW()),
(1, 'Zone A', 480.00, 100, '2026-03-01 10:00:00', '2026-04-20 18:00:00', 1, NOW(), NOW()),
(1, 'Zone B', 380.00, 150, '2026-03-01 10:00:00', '2026-04-20 18:00:00', 1, NOW(), NOW()),
(1, 'Zone C', 180.00, 200, '2026-03-01 10:00:00', '2026-04-20 18:00:00', 1, NOW(), NOW());

-- 演出2: Coldplay Music of the Spheres
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(2, 'Floor Standing', 1580.00, 300, '2026-03-01 10:00:00', '2026-05-01 18:00:00', 1, NOW(), NOW()),
(2, 'Lower Bowl', 980.00, 500, '2026-03-01 10:00:00', '2026-05-01 18:00:00', 1, NOW(), NOW()),
(2, 'Upper Bowl', 580.00, 800, '2026-03-01 10:00:00', '2026-05-01 18:00:00', 1, NOW(), NOW()),
(2, 'Standing', 380.00, 1000, '2026-03-01 10:00:00', '2026-05-01 18:00:00', 1, NOW(), NOW());

-- 演出3: Taylor Swift Eras Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(3, 'Catwalk Floor', 2580.00, 100, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW()),
(3, 'Floor Standing', 1880.00, 300, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW()),
(3, 'Lower Bowl', 1080.00, 500, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW()),
(3, 'Upper Bowl', 680.00, 800, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW());

-- 演出4: Hamlet Drama
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(4, 'Premium Orchestra', 580.00, 80, '2026-03-01 10:00:00', '2026-04-25 18:00:00', 1, NOW(), NOW()),
(4, 'Standard Orchestra', 380.00, 150, '2026-03-01 10:00:00', '2026-04-25 18:00:00', 1, NOW(), NOW()),
(4, 'Balcony A', 280.00, 200, '2026-03-01 10:00:00', '2026-04-25 18:00:00', 1, NOW(), NOW()),
(4, 'Balcony B', 180.00, 250, '2026-03-01 10:00:00', '2026-04-25 18:00:00', 1, NOW(), NOW());

-- 演出5: Eason Chan World Tour
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(5, 'VIP Floor', 1580.00, 100, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(5, 'Floor Standing', 1080.00, 300, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(5, 'Lower Bowl', 780.00, 400, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(5, 'Upper Bowl', 480.00, 600, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW());

-- 演出6: Phantom of the Opera
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(6, 'VIP Box', 880.00, 40, '2026-03-01 10:00:00', '2026-04-18 18:00:00', 1, NOW(), NOW()),
(6, 'Orchestra', 680.00, 100, '2026-03-01 10:00:00', '2026-04-18 18:00:00', 1, NOW(), NOW()),
(6, 'First Balcony', 480.00, 150, '2026-03-01 10:00:00', '2026-04-18 18:00:00', 1, NOW(), NOW()),
(6, 'Second Balcony', 280.00, 200, '2026-03-01 10:00:00', '2026-04-18 18:00:00', 1, NOW(), NOW());

-- 演出7: Jay Chou Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(7, 'VIP Floor', 1980.00, 100, '2026-03-01 10:00:00', '2026-07-20 18:00:00', 1, NOW(), NOW()),
(7, 'Floor Standing', 1380.00, 300, '2026-03-01 10:00:00', '2026-07-20 18:00:00', 1, NOW(), NOW()),
(7, 'Lower Bowl', 880.00, 500, '2026-03-01 10:00:00', '2026-07-20 18:00:00', 1, NOW(), NOW()),
(7, 'Upper Bowl', 580.00, 700, '2026-03-01 10:00:00', '2026-07-20 18:00:00', 1, NOW(), NOW());

-- 演出8: Peony Pavilion
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(8, 'VIP Box', 680.00, 40, '2026-03-01 10:00:00', '2026-05-20 18:00:00', 1, NOW(), NOW()),
(8, 'First Class', 480.00, 80, '2026-03-01 10:00:00', '2026-05-20 18:00:00', 1, NOW(), NOW()),
(8, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-05-20 18:00:00', 1, NOW(), NOW()),
(8, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-05-20 18:00:00', 1, NOW(), NOW());

-- 演出9: Deyun Society Crosstalk
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(9, 'VIP Table', 580.00, 40, '2026-03-01 10:00:00', '2026-04-28 18:00:00', 1, NOW(), NOW()),
(9, 'Front Row', 380.00, 80, '2026-03-01 10:00:00', '2026-04-28 18:00:00', 1, NOW(), NOW()),
(9, 'Standard', 280.00, 150, '2026-03-01 10:00:00', '2026-04-28 18:00:00', 1, NOW(), NOW()),
(9, 'Standing', 180.00, 200, '2026-03-01 10:00:00', '2026-04-28 18:00:00', 1, NOW(), NOW());

-- 演出10: Frozen Kids Show
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(10, 'VIP Zone', 480.00, 50, '2026-03-01 10:00:00', '2026-05-05 10:00:00', 1, NOW(), NOW()),
(10, 'Family Package', 380.00, 100, '2026-03-01 10:00:00', '2026-05-05 10:00:00', 1, NOW(), NOW()),
(10, 'Standard A', 280.00, 200, '2026-03-01 10:00:00', '2026-05-05 10:00:00', 1, NOW(), NOW()),
(10, 'Standard B', 180.00, 300, '2026-03-01 10:00:00', '2026-05-05 10:00:00', 1, NOW(), NOW());

-- 演出11: Rock Night Livehouse
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(11, 'VIP Access', 480.00, 50, '2026-03-01 10:00:00', '2026-06-15 18:00:00', 1, NOW(), NOW()),
(11, 'General Admission', 280.00, 150, '2026-03-01 10:00:00', '2026-06-15 18:00:00', 1, NOW(), NOW()),
(11, 'Standing', 180.00, 200, '2026-03-01 10:00:00', '2026-06-15 18:00:00', 1, NOW(), NOW()),
(11, 'Back Standing', 120.00, 250, '2026-03-01 10:00:00', '2026-06-15 18:00:00', 1, NOW(), NOW());

-- 演出12: National Street Dance Final
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(12, 'VIP Floor', 580.00, 60, '2026-03-01 10:00:00', '2026-06-20 12:00:00', 1, NOW(), NOW()),
(12, 'Standing', 380.00, 200, '2026-03-01 10:00:00', '2026-06-20 12:00:00', 1, NOW(), NOW()),
(12, 'Bleachers A', 280.00, 300, '2026-03-01 10:00:00', '2026-06-20 12:00:00', 1, NOW(), NOW()),
(12, 'Bleachers B', 180.00, 400, '2026-03-01 10:00:00', '2026-06-20 12:00:00', 1, NOW(), NOW());

-- 演出13: Mayday Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(13, 'VIP Floor', 1680.00, 80, '2026-03-01 10:00:00', '2026-08-25 18:00:00', 1, NOW(), NOW()),
(13, 'Floor Standing', 1180.00, 250, '2026-03-01 10:00:00', '2026-08-25 18:00:00', 1, NOW(), NOW()),
(13, 'Lower Bowl', 780.00, 400, '2026-03-01 10:00:00', '2026-08-25 18:00:00', 1, NOW(), NOW()),
(13, 'Upper Bowl', 480.00, 600, '2026-03-01 10:00:00', '2026-08-25 18:00:00', 1, NOW(), NOW());

-- 演出14: Modern Dance Rite of Spring
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(14, 'VIP Zone', 580.00, 40, '2026-03-01 10:00:00', '2026-05-10 18:00:00', 1, NOW(), NOW()),
(14, 'Premium', 480.00, 80, '2026-03-01 10:00:00', '2026-05-10 18:00:00', 1, NOW(), NOW()),
(14, 'Standard A', 380.00, 150, '2026-03-01 10:00:00', '2026-05-10 18:00:00', 1, NOW(), NOW()),
(14, 'Standard B', 280.00, 200, '2026-03-01 10:00:00', '2026-05-10 18:00:00', 1, NOW(), NOW());

-- 演出15: Crosstalk Masters Show
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(15, 'VIP Table', 580.00, 40, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW()),
(15, 'Front Row', 380.00, 80, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW()),
(15, 'Standard', 280.00, 150, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW()),
(15, 'Standing', 180.00, 200, '2026-03-01 10:00:00', '2026-05-15 18:00:00', 1, NOW(), NOW());

-- 演出16: Jonathan Lee Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(16, 'VIP Floor', 1680.00, 80, '2026-03-01 10:00:00', '2026-11-15 18:00:00', 1, NOW(), NOW()),
(16, 'Floor Standing', 1180.00, 200, '2026-03-01 10:00:00', '2026-11-15 18:00:00', 1, NOW(), NOW()),
(16, 'Lower Bowl', 780.00, 300, '2026-03-01 10:00:00', '2026-11-15 18:00:00', 1, NOW(), NOW()),
(16, 'Upper Bowl', 480.00, 400, '2026-03-01 10:00:00', '2026-11-15 18:00:00', 1, NOW(), NOW());

-- 演出17: Dance Drama Confucius
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(17, 'VIP Box', 680.00, 30, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(17, 'First Class', 480.00, 80, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(17, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(17, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW());

-- 演出18: Dream of Red Chamber Yueju
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(18, 'VIP Box', 680.00, 30, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(18, 'First Class', 480.00, 80, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(18, 'Second Class', 380.00, 150, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW()),
(18, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-06-10 18:00:00', 1, NOW(), NOW());

-- 演出19: Tom and Jerry Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(19, 'VIP Table', 580.00, 40, '2026-03-01 10:00:00', '2026-04-30 18:00:00', 1, NOW(), NOW()),
(19, 'Front Row', 380.00, 80, '2026-03-01 10:00:00', '2026-04-30 18:00:00', 1, NOW(), NOW()),
(19, 'Standard', 280.00, 150, '2026-03-01 10:00:00', '2026-04-30 18:00:00', 1, NOW(), NOW()),
(19, 'Standing', 180.00, 200, '2026-03-01 10:00:00', '2026-04-30 18:00:00', 1, NOW(), NOW());

-- 演出20: Jazz Night Live
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(20, 'VIP Table', 880.00, 30, '2026-03-01 10:00:00', '2026-05-08 18:00:00', 1, NOW(), NOW()),
(20, 'Front Row', 580.00, 50, '2026-03-01 10:00:00', '2026-05-08 18:00:00', 1, NOW(), NOW()),
(20, 'Standard', 380.00, 100, '2026-03-01 10:00:00', '2026-05-08 18:00:00', 1, NOW(), NOW()),
(20, 'Standing', 280.00, 150, '2026-03-01 10:00:00', '2026-05-08 18:00:00', 1, NOW(), NOW());

-- 演出21: Chopin Piano Concert
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(21, 'VIP Zone', 880.00, 40, '2026-03-01 10:00:00', '2026-05-12 18:00:00', 1, NOW(), NOW()),
(21, 'First Class', 680.00, 80, '2026-03-01 10:00:00', '2026-05-12 18:00:00', 1, NOW(), NOW()),
(21, 'Second Class', 480.00, 150, '2026-03-01 10:00:00', '2026-05-12 18:00:00', 1, NOW(), NOW()),
(21, 'Third Class', 280.00, 200, '2026-03-01 10:00:00', '2026-05-12 18:00:00', 1, NOW(), NOW());

-- 演出22: Shakespeare Hamlet
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(22, 'Premium Orchestra', 580.00, 60, '2026-03-01 10:00:00', '2026-04-22 18:00:00', 1, NOW(), NOW()),
(22, 'Standard Orchestra', 380.00, 100, '2026-03-01 10:00:00', '2026-04-22 18:00:00', 1, NOW(), NOW()),
(22, 'Balcony A', 280.00, 150, '2026-03-01 10:00:00', '2026-04-22 18:00:00', 1, NOW(), NOW()),
(22, 'Balcony B', 180.00, 200, '2026-03-01 10:00:00', '2026-04-22 18:00:00', 1, NOW(), NOW());

-- 演出23: Ballet Swan Lake
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(23, 'VIP Box', 980.00, 30, '2026-03-01 10:00:00', '2026-05-18 18:00:00', 1, NOW(), NOW()),
(23, 'Orchestra', 680.00, 100, '2026-03-01 10:00:00', '2026-05-18 18:00:00', 1, NOW(), NOW()),
(23, 'First Balcony', 480.00, 150, '2026-03-01 10:00:00', '2026-05-18 18:00:00', 1, NOW(), NOW()),
(23, 'Second Balcony', 280.00, 200, '2026-03-01 10:00:00', '2026-05-18 18:00:00', 1, NOW(), NOW());

-- 演出24: Classical Music Night
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(24, 'VIP Suite', 880.00, 30, '2026-03-01 10:00:00', '2026-05-22 18:00:00', 1, NOW(), NOW()),
(24, 'Premium', 680.00, 80, '2026-03-01 10:00:00', '2026-05-22 18:00:00', 1, NOW(), NOW()),
(24, 'Standard A', 480.00, 150, '2026-03-01 10:00:00', '2026-05-22 18:00:00', 1, NOW(), NOW()),
(24, 'Standard B', 280.00, 200, '2026-03-01 10:00:00', '2026-05-22 18:00:00', 1, NOW(), NOW());

-- 演出25: Rock Festival 2026
INSERT INTO ticket_type (performance_id, name, price, stock, sale_start_time, sale_end_time, status, created_at, updated_at) VALUES
(25, 'VIP Access', 680.00, 100, '2026-03-01 10:00:00', '2026-06-16 16:00:00', 1, NOW(), NOW()),
(25, 'General Admission', 480.00, 300, '2026-03-01 10:00:00', '2026-06-16 16:00:00', 1, NOW(), NOW()),
(25, 'Standing', 280.00, 500, '2026-03-01 10:00:00', '2026-06-16 16:00:00', 1, NOW(), NOW()),
(25, 'Back Standing', 180.00, 700, '2026-03-01 10:00:00', '2026-06-16 16:00:00', 1, NOW(), NOW());

-- =====================================================
-- 6. 订单数据 (近7天) - 今日是2026-04-13
-- =====================================================

-- 今日订单 (2026-04-13)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260413080112345671', 1, 2, 6, 2, 1960.00, 1, '2026-04-13 21:00:00', '2026-04-13 16:30:00', '2026-04-13 08:00:00', '2026-04-13 16:30:00'),
('20260413090223456782', 2, 3, 10, 1, 1080.00, 1, '2026-04-13 21:30:00', '2026-04-13 17:00:00', '2026-04-13 09:00:00', '2026-04-13 17:00:00'),
('20260413100334567893', 3, 6, 21, 2, 960.00, 1, '2026-04-13 22:30:00', '2026-04-13 18:00:00', '2026-04-13 10:00:00', '2026-04-13 18:00:00'),
('20260413110445678904', 4, 7, 25, 1, 1380.00, 1, '2026-04-13 22:00:00', '2026-04-13 18:30:00', '2026-04-13 11:00:00', '2026-04-13 18:30:00'),
('20260413120556789015', 5, 9, 33, 2, 760.00, 1, '2026-04-13 21:00:00', '2026-04-13 19:00:00', '2026-04-13 12:00:00', '2026-04-13 19:00:00');

-- 待支付订单
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260413140778901237', 2, 12, 45, 2, 760.00, 0, '2026-04-13 23:00:00', NULL, '2026-04-13 14:00:00', '2026-04-13 14:00:00'),
('20260413150889012348', 3, 13, 49, 1, 780.00, 0, '2026-04-13 23:30:00', NULL, '2026-04-13 15:00:00', '2026-04-13 15:00:00');

-- 昨日订单 (2026-04-12)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260412090123456789', 4, 2, 7, 2, 1960.00, 1, '2026-04-12 21:00:00', '2026-04-12 17:30:00', '2026-04-12 09:00:00', '2026-04-12 17:30:00'),
('20260412100234567890', 5, 4, 14, 1, 380.00, 1, '2026-04-12 22:00:00', '2026-04-12 18:00:00', '2026-04-12 10:00:00', '2026-04-12 18:00:00'),
('20260412110345678901', 1, 5, 17, 1, 780.00, 1, '2026-04-12 21:30:00', '2026-04-12 19:00:00', '2026-04-12 11:00:00', '2026-04-12 19:00:00'),
('20260412120456789012', 2, 8, 29, 2, 760.00, 1, '2026-04-12 23:00:00', '2026-04-12 19:30:00', '2026-04-12 12:00:00', '2026-04-12 19:30:00');

-- 2天前订单 (2026-04-11)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260411090123456788', 3, 3, 11, 2, 2160.00, 1, '2026-04-11 21:00:00', '2026-04-11 17:00:00', '2026-04-11 09:00:00', '2026-04-11 17:00:00'),
('20260411100234567899', 4, 6, 22, 1, 480.00, 1, '2026-04-11 22:00:00', '2026-04-11 18:00:00', '2026-04-11 10:00:00', '2026-04-11 18:00:00'),
('20260411110345678900', 5, 9, 34, 1, 280.00, 1, '2026-04-11 21:30:00', '2026-04-11 19:00:00', '2026-04-11 11:00:00', '2026-04-11 19:00:00');

-- 3天前订单 (2026-04-10)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260410090123456787', 1, 2, 8, 1, 580.00, 1, '2026-04-10 21:00:00', '2026-04-10 17:30:00', '2026-04-10 09:00:00', '2026-04-10 17:30:00'),
('20260410100234567888', 2, 7, 26, 1, 1380.00, 1, '2026-04-10 22:00:00', '2026-04-10 18:00:00', '2026-04-10 10:00:00', '2026-04-10 18:00:00'),
('20260410110345678989', 3, 10, 37, 2, 560.00, 1, '2026-04-10 21:30:00', '2026-04-10 19:00:00', '2026-04-10 11:00:00', '2026-04-10 19:00:00');

-- 4天前订单 (2026-04-09)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260409090123456786', 4, 4, 13, 2, 760.00, 1, '2026-04-09 21:00:00', '2026-04-09 17:00:00', '2026-04-09 09:00:00', '2026-04-09 17:00:00'),
('20260409100234567887', 5, 5, 18, 1, 1080.00, 1, '2026-04-09 22:00:00', '2026-04-09 18:00:00', '2026-04-09 10:00:00', '2026-04-09 18:00:00');

-- 5天前订单 (2026-04-08)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260408090123456785', 1, 8, 30, 1, 380.00, 1, '2026-04-08 21:00:00', '2026-04-08 17:00:00', '2026-04-08 09:00:00', '2026-04-08 17:00:00'),
('20260408100234567886', 2, 11, 41, 2, 360.00, 1, '2026-04-08 21:30:00', '2026-04-08 18:00:00', '2026-04-08 10:00:00', '2026-04-08 18:00:00');

-- 6天前订单 (2026-04-07)
INSERT INTO `order` (order_no, user_id, performance_id, ticket_type_id, quantity, amount, status, expire_time, payment_time, created_at, updated_at) VALUES
('20260407090123456784', 3, 2, 5, 2, 1960.00, 1, '2026-04-07 21:00:00', '2026-04-07 17:00:00', '2026-04-07 09:00:00', '2026-04-07 17:00:00'),
('20260407100234567885', 4, 6, 23, 1, 680.00, 1, '2026-04-07 22:00:00', '2026-04-07 18:00:00', '2026-04-07 10:00:00', '2026-04-07 18:00:00');

-- =====================================================
-- 7. 系统配置
-- =====================================================
INSERT INTO system_config (`key`, `value`, description) VALUES
('site_name', '星幕票务系统', '网站名称'),
('site_logo', '/uploads/logo.png', '网站Logo'),
('contact_phone', '400-123-4567', '联系电话'),
('contact_email', 'support@xingmu.com', '联系邮箱'),
('min_password_length', '6', '最小密码长度'),
('max_ticket_per_order', '5', '每单最大票数'),
('order_expire_minutes', '30', '订单过期时间(分钟)'),
('enable_register', 'true', '是否允许注册');

-- =====================================================
-- 8. 验证查询
-- =====================================================
SELECT '==================== 数据验证 ====================' AS info;

SELECT '管理员数量:' AS info, COUNT(*) AS count FROM admin;
SELECT '用户数量:' AS info, COUNT(*) AS count FROM user;
SELECT '分类数量:' AS info, COUNT(*) AS count FROM performance_category;
SELECT '演出数量:' AS info, COUNT(*) AS count FROM performance WHERE status = 1;
SELECT '票种数量:' AS info, COUNT(*) AS count FROM ticket_type;
SELECT '订单数量:' AS info, COUNT(*) AS count FROM `order`;

SELECT '今日收入验证:' AS info, COALESCE(SUM(amount), 0) AS today_revenue FROM `order` WHERE DATE(created_at) = CURDATE() AND status = 1;
SELECT '本周收入验证:' AS info, COALESCE(SUM(amount), 0) AS week_revenue FROM `order` WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 1;
