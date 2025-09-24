USE ticketdb;
-- 初始化系统配置数据
INSERT INTO `system_config` (`key`, `value`, `description`) VALUES
('system_maintenance', 'false', '系统是否维护中(true/false)');
-- 初始化演出分类数据（对应 performance.ts 中的 categories）
INSERT INTO `performance_category` (`name`, `parent_id`, `sort`, `created_at`, `updated_at`) VALUES
('演唱会', 0, 1, NOW(), NOW()),
('话剧', 0, 2, NOW(), NOW()),
('音乐会', 0, 3, NOW(), NOW()),
('戏曲', 0, 4, NOW(), NOW()),
('舞蹈', 0, 5, NOW(), NOW());

-- 插入用户数据（10 个测试用户）
INSERT INTO `user` (`username`, `password`, `phone`, `email`, `avatar`, `status`, `created_at`, `updated_at`) VALUES
-- 密码均为 '123456' 的加密值
('user01', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138001', 'user01@example.com', 'https://picsum.photos/id/1001/200/200', 1, '2023-01-15 08:30:00', '2023-01-15 08:30:00'),
('user02', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138002', 'user02@example.com', 'https://picsum.photos/id/1002/200/200', 1, '2023-02-20 10:15:00', '2023-02-20 10:15:00'),
('user03', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138003', 'user03@example.com', 'https://picsum.photos/id/1003/200/200', 1, '2023-03-05 14:40:00', '2023-03-05 14:40:00'),
('user04', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138004', 'user04@example.com', 'https://picsum.photos/id/1004/200/200', 1, '2023-04-12 16:20:00', '2023-04-12 16:20:00'),
('user05', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138005', 'user05@example.com', 'https://picsum.photos/id/1005/200/200', 1, '2023-05-28 09:10:00', '2023-05-28 09:10:00'),
('user06', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138006', 'user06@example.com', 'https://picsum.photos/id/1006/200/200', 0, '2023-06-30 11:50:00', '2023-07-15 15:30:00'), -- 禁用状态
('user07', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138007', 'user07@example.com', 'https://picsum.photos/id/1007/200/200', 1, '2023-07-08 13:25:00', '2023-07-08 13:25:00'),
('user08', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138008', 'user08@example.com', 'https://picsum.photos/id/1008/200/200', 1, '2023-08-15 15:45:00', '2023-08-15 15:45:00'),
('user09', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138009', 'user09@example.com', 'https://picsum.photos/id/1009/200/200', 1, '2023-09-22 10:05:00', '2023-09-22 10:05:00'),
('user10', 'hashed_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92ccf732d595a9b', '13800138010', 'user10@example.com', 'https://picsum.photos/id/1010/200/200', 1, '2023-10-01 09:30:00', '2023-10-01 09:30:00');

-- 插入用户隐私设置（与上述用户一一对应）
INSERT INTO `user_privacy_setting` (`user_id`, `data_collection`, `personalized_ads`, `third_party_sharing`, `marketing_emails`) VALUES
(1, 1, 1, 0, 1), -- user01: 默认设置
(2, 1, 0, 0, 1), -- user02: 关闭个性化广告
(3, 0, 0, 0, 0), -- user03: 完全关闭所有选项
(4, 1, 1, 1, 1), -- user04: 允许所有选项
(5, 1, 1, 0, 0), -- user05: 关闭营销邮件
(6, 1, 1, 0, 1), -- user06: 禁用用户的默认设置
(7, 1, 0, 0, 1), -- user07: 关闭个性化广告
(8, 1, 1, 0, 1), -- user08: 默认设置
(9, 1, 1, 0, 0), -- user09: 关闭营销邮件
(10, 0, 0, 0, 1); -- user10: 仅保留营销邮件


-- 所有演出及票种数据（状态已调整）

-- 1. 周杰伦演唱会（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('周杰伦演唱会', 1, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=concert%20poster%2C%20singer%2C%20bright%20lights&sign=884036232d0be65fca90028defa04476', '周杰伦 2023 巡回演唱会，带来经典歌曲与全新创作，不容错过的音乐盛宴！', '周杰伦', '国家体育场', '2023-12-01 19:30:00', '2023-12-01 22:00:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(1, '内场 VIP', 2800.00, 0, '2023-11-01 10:00:00', '2023-11-10 23:59:59', 3, NOW(), NOW()),
(1, '内场普通', 1800.00, 0, '2023-11-01 10:00:00', '2023-11-10 23:59:59', 3, NOW(), NOW()),
(1, '看台 A 区', 1200.00, 0, '2023-11-01 10:00:00', '2023-11-10 23:59:59', 3, NOW(), NOW()),
(1, '看台 B 区', 800.00, 0, '2023-11-01 10:00:00', '2023-11-10 23:59:59', 3, NOW(), NOW());

-- 2. 经典话剧《茶馆》（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('经典话剧《茶馆》', 2, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=drama%20poster%2C%20traditional%20Chinese%20style&sign=195ecf93572a3ad5ab2739e75a4e9ae0', '老舍经典话剧《茶馆》再现，讲述清末民初的社会变迁，见证百年沧桑。', '北京人民艺术剧院', '国家大剧院', '2024-11-15 19:00:00', '2024-11-15 21:30:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(2, '一楼前排', 680.00, 40, '2024-10-20 10:00:00', '2024-11-14 23:59:59', 1, NOW(), NOW()),
(2, '一楼后排', 480.00, 80, '2024-10-20 10:00:00', '2024-11-14 23:59:59', 1, NOW(), NOW()),
(2, '二楼前排', 380.00, 100, '2024-10-20 10:00:00', '2024-11-14 23:59:59', 1, NOW(), NOW()),
(2, '二楼后排', 280.00, 150, '2024-10-20 10:00:00', '2024-11-14 23:59:59', 1, NOW(), NOW());

-- 3. 贝多芬交响乐之夜（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('贝多芬交响乐之夜', 3, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=orchestra%20concert%20poster%2C%20classical%20music&sign=6176e030ee622dbe8f0f0f157e782bf5', '贝多芬经典交响乐专场，包括《命运交响曲》《田园交响曲》等经典作品。', '中国交响乐团', '上海音乐厅', '2023-12-10 19:30:00', '2023-12-10 21:30:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(3, 'VIP 区', 1280.00, 0, '2023-11-05 10:00:00', '2023-12-09 23:59:59', 3, NOW(), NOW()),
(3, 'A 区', 880.00, 0, '2023-11-05 10:00:00', '2023-12-09 23:59:59', 3, NOW(), NOW()),
(3, 'B 区', 580.00, 0, '2023-11-05 10:00:00', '2023-12-09 23:59:59', 3, NOW(), NOW()),
(3, 'C 区', 380.00, 0, '2023-11-05 10:00:00', '2023-12-09 23:59:59', 3, NOW(), NOW());

-- 4. Taylor Swift The Eras Tour（预售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('Taylor Swift The Eras Tour', 1, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Taylor%20Swift%20concert%20poster%2C%20pop%20music%2C%20colorful%20stage&sign=36508f1dc5a1408b9a63beae84a11179', '泰勒·斯威夫特"The Eras Tour"世界巡演中国站，带来职业生涯各时期经典作品。', 'Taylor Swift', '上海体育场', '2024-12-15 19:30:00', '2024-12-15 22:30:00', 1, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(4, 'VIP 区', 3200.00, 50, '2024-10-01 10:00:00', '2024-12-14 23:59:59', 1, NOW(), NOW()),
(4, '内场 A 区', 2200.00, 150, '2024-10-01 10:00:00', '2024-12-14 23:59:59', 1, NOW(), NOW()),
(4, '内场 B 区', 1600.00, 200, '2024-10-01 10:00:00', '2024-12-14 23:59:59', 1, NOW(), NOW()),
(4, '看台 A 区', 1200.00, 300, '2024-10-01 10:00:00', '2024-12-14 23:59:59', 1, NOW(), NOW());

-- 5. 2024 国际舞蹈节（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('2024 国际舞蹈节', 5, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=dance%20performance%20poster%2C%20modern%20dance%2C%20graceful%20movements&sign=d732ab641672ca865015353064fe5278', '汇集全球顶级舞蹈团体，展示现代舞、芭蕾舞等多种舞蹈形式的艺术盛宴。', '国际舞蹈团', '北京舞蹈学院剧场', '2024-07-20 19:00:00', '2024-07-20 21:30:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(5, 'VIP 区', 1680.00, 30, '2024-05-15 10:00:00', '2024-07-19 23:59:59', 1, NOW(), NOW()),
(5, 'A 区', 980.00, 80, '2024-05-15 10:00:00', '2024-07-19 23:59:59', 1, NOW(), NOW()),
(5, 'B 区', 680.00, 120, '2024-05-15 10:00:00', '2024-07-19 23:59:59', 1, NOW(), NOW());

-- 6. 2025 新年音乐会（未开售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('2025 新年音乐会', 3, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=new%20year%20concert%20poster%2C%20orchestra%2C%20celebration&sign=f3c6bc8b4f0d17b70e167e281344ec32', '新年特别音乐会，演奏经典新年曲目，与观众一起迎接 2025 新年的到来。', '国家交响乐团', '北京音乐厅', '2025-01-01 19:30:00', '2025-01-01 22:00:00', 0, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(6, 'VIP 区', 1880.00, 50, '2024-11-15 10:00:00', '2024-12-31 23:59:59', 0, NOW(), NOW()),
(6, 'A 区', 1280.00, 100, '2024-11-15 10:00:00', '2024-12-31 23:59:59', 0, NOW(), NOW()),
(6, 'B 区', 880.00, 150, '2024-11-15 10:00:00', '2024-12-31 23:59:59', 0, NOW(), NOW());

-- 7. 2025 戏剧节：哈姆雷特（预售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('2025 戏剧节：哈姆雷特', 2, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Hamlet%20drama%20poster%2C%20shakespearean%20theater&sign=8a7b3c2d1e5f6g7h8i9j0k', '莎士比亚经典悲剧《哈姆雷特》，由皇家莎士比亚剧团原版呈现。', '皇家莎士比亚剧团', '上海话剧艺术中心', '2025-03-10 19:00:00', '2025-03-10 21:45:00', 1, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(7, 'VIP 区', 1680.00, 60, '2024-12-01 10:00:00', '2025-03-09 23:59:59', 1, NOW(), NOW()),
(7, '一层前排', 980.00, 120, '2024-12-01 10:00:00', '2025-03-09 23:59:59', 1, NOW(), NOW()),
(7, '一层后排', 680.00, 180, '2024-12-01 10:00:00', '2025-03-09 23:59:59', 1, NOW(), NOW()),
(7, '二层看台', 480.00, 240, '2024-12-01 10:00:00', '2025-03-09 23:59:59', 1, NOW(), NOW());

-- 8. 德云社相声专场（售罄）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('德云社相声专场', 4, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=crosstalk%20performance%20poster%2C%20traditional%20Chinese%20comedy&sign=1b2c3d4e5f6a7b8c9d0e', '郭德纲、于谦领衔德云社主力阵容，带来爆笑相声专场。', '德云社', '北京展览馆剧场', '2024-05-01 19:30:00', '2024-05-01 22:00:00', 3, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(8, 'VIP 区', 1580.00, 0, '2024-03-15 10:00:00', '2024-04-30 23:59:59', 3, NOW(), NOW()),
(8, 'A 区', 980.00, 0, '2024-03-15 10:00:00', '2024-04-30 23:59:59', 3, NOW(), NOW()),
(8, 'B 区', 680.00, 0, '2024-03-15 10:00:00', '2024-04-30 23:59:59', 3, NOW(), NOW()),
(8, 'C 区', 380.00, 0, '2024-03-15 10:00:00', '2024-04-30 23:59:59', 3, NOW(), NOW());

-- 9. Coldplay Music of the Spheres Tour（预售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('Coldplay Music of the Spheres Tour', 1, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Coldplay%20concert%20poster%2C%20british%20rock%20band%2C%20colorful%20stage%20lights&sign=2eedc46bf1cfa9c25fefde7fc1712d5b', '酷玩乐队"音乐星球"世界巡演，带来经典与新歌的震撼现场。', 'Coldplay', '北京国家体育场', '2025-11-20 19:30:00', '2025-11-20 22:30:00', 1, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(9, 'VIP 区', 3680.00, 100, '2025-08-01 10:00:00', '2025-11-19 23:59:59', 1, NOW(), NOW()),
(9, '内场 A 区', 2680.00, 200, '2025-08-01 10:00:00', '2025-11-19 23:59:59', 1, NOW(), NOW()),
(9, '内场 B 区', 1880.00, 300, '2025-08-01 10:00:00', '2025-11-19 23:59:59', 1, NOW(), NOW()),
(9, '看台 A 区', 1280.00, 500, '2025-08-01 10:00:00', '2025-11-19 23:59:59', 1, NOW(), NOW());

-- 10. 宫崎骏动画电影交响音乐会（预售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('宫崎骏动画电影交响音乐会', 3, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Studio%20Ghibli%20concert%20poster%2C%20animated%20characters%2C%20orchestra%20on%20stage&sign=2a9186b4fdf8707a1fb1dcf15878a491', '久石让作品专场，演奏《龙猫》《千与千寻》等经典动画配乐。', '东京交响乐团', '广州大剧院', '2025-12-12 19:30:00', '2025-12-12 21:30:00', 1, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(10, 'VIP 区', 1280.00, 50, '2025-09-15 10:00:00', '2025-12-11 23:59:59', 1, NOW(), NOW()),
(10, 'A 区', 880.00, 100, '2025-09-15 10:00:00', '2025-12-11 23:59:59', 1, NOW(), NOW()),
(10, 'B 区', 580.00, 150, '2025-09-15 10:00:00', '2025-12-11 23:59:59', 1, NOW(), NOW()),
(10, 'C 区', 380.00, 200, '2025-09-15 10:00:00', '2025-12-11 23:59:59', 1, NOW(), NOW());

-- 11. 昆曲《牡丹亭》（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('昆曲《牡丹亭》', 4, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Kunqu%20opera%20poster%2C%20Peony%20Pavilion%2C%20traditional%20Chinese%20style&sign=3c4d5e6f7a8b9c0d1e2f', '经典昆曲《牡丹亭》全本演出，国家一级演员主演。', '江苏省昆剧院', '苏州昆剧院', '2024-06-10 19:00:00', '2024-06-10 22:00:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(11, 'VIP 区', 980.00, 0, '2024-04-15 10:00:00', '2024-06-09 23:59:59', 3, NOW(), NOW()),
(11, 'A 区', 680.00, 0, '2024-04-15 10:00:00', '2024-06-09 23:59:59', 3, NOW(), NOW()),
(11, 'B 区', 480.00, 0, '2024-04-15 10:00:00', '2024-06-09 23:59:59', 3, NOW(), NOW()),
(11, 'C 区', 280.00, 0, '2024-04-15 10:00:00', '2024-06-09 23:59:59', 3, NOW(), NOW());

-- 12. 杨丽萍现代舞《孔雀》（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('杨丽萍现代舞《孔雀》', 5, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=modern%20dance%20peacock%20poster%2C%20Yang%20Liping&sign=4d5e6f7a8b9c0d1e2f3a', '杨丽萍代表作《孔雀》，展现生命与自然的和谐之美。', '杨丽萍舞蹈团', '杭州大剧院', '2024-09-05 19:30:00', '2024-09-05 21:30:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(12, 'VIP 区', 1580.00, 20, '2024-07-01 10:00:00', '2024-09-04 23:59:59', 1, NOW(), NOW()),
(12, 'A 区', 980.00, 50, '2024-07-01 10:00:00', '2024-09-04 23:59:59', 1, NOW(), NOW()),
(12, 'B 区', 680.00, 90, '2024-07-01 10:00:00', '2024-09-04 23:59:59', 1, NOW(), NOW()),
(12, 'C 区', 380.00, 150, '2024-07-01 10:00:00', '2024-09-04 23:59:59', 1, NOW(), NOW());

-- 13. 莫扎特歌剧《费加罗的婚礼》（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('莫扎特歌剧《费加罗的婚礼》', 3, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Mozart%20opera%20poster%2C%20The%20Marriage%20of%20Figaro&sign=5e6f7a8b9c0d1e2f3a4b', '莫扎特经典歌剧，意大利原文演唱配中文字幕。', '中央歌剧院', '国家大剧院', '2024-10-20 19:00:00', '2024-10-20 22:00:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(13, 'VIP 区', 1680.00, 15, '2024-08-15 10:00:00', '2024-10-19 23:59:59', 1, NOW(), NOW()),
(13, '一层前排', 1280.00, 40, '2024-08-15 10:00:00', '2024-10-19 23:59:59', 1, NOW(), NOW()),
(13, '一层后排', 880.00, 80, '2024-08-15 10:00:00', '2024-10-19 23:59:59', 1, NOW(), NOW()),
(13, '二层看台', 580.00, 120, '2024-08-15 10:00:00', '2024-10-19 23:59:59', 1, NOW(), NOW());

-- 14. 开心麻花《乌龙山伯爵》（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('开心麻花《乌龙山伯爵》', 2, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=comedy%20play%20poster%2C%20Chinese%20humor&sign=6f7a8b9c0d1e2f3a4b5c', '开心麻花经典喜剧，爆笑剧情与巧妙构思的完美结合。', '开心麻花团队', '深圳保利剧院', '2024-07-15 20:00:00', '2024-07-15 22:00:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(14, 'VIP 区', 880.00, 0, '2024-05-15 10:00:00', '2024-07-14 23:59:59', 3, NOW(), NOW()),
(14, 'A 区', 580.00, 0, '2024-05-15 10:00:00', '2024-07-14 23:59:59', 3, NOW(), NOW()),
(14, 'B 区', 380.00, 0, '2024-05-15 10:00:00', '2024-07-14 23:59:59', 3, NOW(), NOW()),
(14, 'C 区', 180.00, 0, '2024-05-15 10:00:00', '2024-07-14 23:59:59', 3, NOW(), NOW());

-- 15. 五月天 2024 巡回演唱会（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('五月天 2024 巡回演唱会', 1, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Mayday%20concert%20poster%2C%20Taiwanese%20band%2C%20rock%20music&sign=7a8b9c0d1e2f3a4b5c6d', '五月天"好好好想见到你"巡回演唱会，全场大合唱经典曲目。', '五月天', '成都凤凰山体育公园', '2024-08-24 19:30:00', '2024-08-24 22:30:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(15, '内场 VIP', 2555.00, 0, '2024-06-10 10:00:00', '2024-08-23 23:59:59', 3, NOW(), NOW()),
(15, '内场 A 区', 1855.00, 0, '2024-06-10 10:00:00', '2024-08-23 23:59:59', 3, NOW(), NOW()),
(15, '看台前排', 1255.00, 0, '2024-06-10 10:00:00', '2024-08-23 23:59:59', 3, NOW(), NOW()),
(15, '看台后排', 855.00, 0, '2024-06-10 10:00:00', '2024-08-23 23:59:59', 3, NOW(), NOW());

-- 16. 京剧《霸王别姬》（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('京剧《霸王别姬》', 4, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Peking%20opera%20poster%2C%20Farewell%20My%20Concubine&sign=8b9c0d1e2f3a4b5c6d7e', '经典京剧《霸王别姬》，国家京剧院名家演绎。', '国家京剧院', '梅兰芳大剧院', '2024-11-05 19:00:00', '2024-11-05 21:30:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(16, 'VIP 区', 1280.00, 20, '2024-09-15 10:00:00', '2024-11-04 23:59:59', 1, NOW(), NOW()),
(16, 'A 区', 880.00, 50, '2024-09-15 10:00:00', '2024-11-04 23:59:59', 1, NOW(), NOW()),
(16, 'B 区', 580.00, 80, '2024-09-15 10:00:00', '2024-11-04 23:59:59', 1, NOW(), NOW()),
(16, 'C 区', 380.00, 120, '2024-09-15 10:00:00', '2024-11-04 23:59:59', 1, NOW(), NOW());

-- 17. 天鹅湖芭蕾舞剧（未开售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('天鹅湖芭蕾舞剧', 5, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Swan%20Lake%20ballet%20poster%2C%20classical%20dance&sign=9c0d1e2f3a4b5c6d7e8f', '俄罗斯圣彼得堡芭蕾舞团经典《天鹅湖》全剧演出。', '圣彼得堡芭蕾舞团', '上海大剧院', '2025-01-15 19:00:00', '2025-01-15 21:45:00', 0, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(17, 'VIP 区', 1880.00, 60, '2024-11-01 10:00:00', '2025-01-14 23:59:59', 0, NOW(), NOW()),
(17, 'A 区', 1280.00, 120, '2024-11-01 10:00:00', '2025-01-14 23:59:59', 0, NOW(), NOW()),
(17, 'B 区', 880.00, 180, '2024-11-01 10:00:00', '2025-01-14 23:59:59', 0, NOW(), NOW()),
(17, 'C 区', 580.00, 240, '2024-11-01 10:00:00', '2025-01-14 23:59:59', 0, NOW(), NOW());

-- 18. 陈奕迅 Fear and Dreams 世界巡演（预售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('陈奕迅 Fear and Dreams 世界巡演', 1, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Eason%20Chan%20concert%20poster%2C%20Hong%20Kong%20singer&sign=0d1e2f3a4b5c6d7e8f9a', '陈奕迅"Fear and Dreams"世界巡演，带来多首经典金曲。', '陈奕迅', '香港红磡体育馆', '2024-12-24 20:00:00', '2024-12-24 22:30:00', 1, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(18, '内场 VIP', 2680.00, 40, '2024-10-15 10:00:00', '2024-12-23 23:59:59', 1, NOW(), NOW()),
(18, '内场 A 区', 1880.00, 80, '2024-10-15 10:00:00', '2024-12-23 23:59:59', 1, NOW(), NOW()),
(18, '看台前排', 1280.00, 120, '2024-10-15 10:00:00', '2024-12-23 23:59:59', 1, NOW(), NOW()),
(18, '看台后排', 880.00, 180, '2024-10-15 10:00:00', '2024-12-23 23:59:59', 1, NOW(), NOW());

-- 19. 老舍《四世同堂》话剧（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('老舍《四世同堂》话剧', 2, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Four%20Generations%20under%20One%20Roof%20drama%20poster&sign=1e2f3a4b5c6d7e8f9a0b', '老舍经典《四世同堂》话剧版，展现抗日战争时期的北平生活。', '北京人民艺术剧院', '首都剧场', '2024-09-30 19:00:00', '2024-09-30 22:00:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(19, 'VIP 区', 880.00, 0, '2024-07-30 10:00:00', '2024-09-29 23:59:59', 3, NOW(), NOW()),
(19, 'A 区', 580.00, 0, '2024-07-30 10:00:00', '2024-09-29 23:59:59', 3, NOW(), NOW()),
(19, 'B 区', 380.00, 0, '2024-07-30 10:00:00', '2024-09-29 23:59:59', 3, NOW(), NOW()),
(19, 'C 区', 180.00, 0, '2024-07-30 10:00:00', '2024-09-29 23:59:59', 3, NOW(), NOW());

-- 20. 肖邦钢琴协奏曲专场（未开售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('肖邦钢琴协奏曲专场', 3, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Chopin%20piano%20concerto%20poster%2C%20classical%20music&sign=2f3a4b5c6d7e8f9a0b1c', '钢琴家郎朗演绎肖邦第一、第二钢琴协奏曲。', '郎朗、中国爱乐乐团', '北京音乐厅', '2025-02-14 19:30:00', '2025-02-14 21:30:00', 0, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(20, 'VIP 区', 2280.00, 40, '2024-12-15 10:00:00', '2025-02-13 23:59:59', 0, NOW(), NOW()),
(20, 'A 区', 1680.00, 80, '2024-12-15 10:00:00', '2025-02-13 23:59:59', 0, NOW(), NOW()),
(20, 'B 区', 980.00, 120, '2024-12-15 10:00:00', '2025-02-13 23:59:59', 0, NOW(), NOW()),
(20, 'C 区', 580.00, 160, '2024-12-15 10:00:00', '2025-02-13 23:59:59', 0, NOW(), NOW());

-- 21. 舞剧《永不消逝的电波》（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('舞剧《永不消逝的电波》', 5, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=dance%20drama%20poster%2C%20Chinese%20revolutionary%20theme&sign=3a4b5c6d7e8f9a0b1c2d', '红色主题舞剧，展现革命年代的情报工作者故事。', '上海歌舞团', '武汉琴台大剧院', '2024-12-05 19:30:00', '2024-12-05 21:30:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(21, 'VIP 区', 980.00, 30, '2024-10-05 10:00:00', '2024-12-04 23:59:59', 1, NOW(), NOW()),
(21, 'A 区', 680.00, 60, '2024-10-05 10:00:00', '2024-12-04 23:59:59', 1, NOW(), NOW()),
(21, 'B 区', 480.00, 90, '2024-10-05 10:00:00', '2024-12-04 23:59:59', 1, NOW(), NOW()),
(21, 'C 区', 280.00, 150, '2024-10-05 10:00:00', '2024-12-04 23:59:59', 1, NOW(), NOW());

-- 22. 刘老根大舞台二人转专场（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('刘老根大舞台二人转专场', 4, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Errenzhuan%20performance%20poster%2C%20Chinese%20folk%20comedy&sign=4b5c6d7e8f9a0b1c2d3e', '赵本山弟子带来正宗东北二人转，搞笑与绝活并存。', '刘老根大舞台演员', '沈阳刘老根大舞台', '2024-06-20 19:30:00', '2024-06-20 21:30:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(22, 'VIP 区', 680.00, 0, '2024-04-20 10:00:00', '2024-06-19 23:59:59', 3, NOW(), NOW()),
(22, 'A 区', 480.00, 0, '2024-04-20 10:00:00', '2024-06-19 23:59:59', 3, NOW(), NOW()),
(22, 'B 区', 280.00, 0, '2024-04-20 10:00:00', '2024-06-19 23:59:59', 3, NOW(), NOW()),
(22, 'C 区', 180.00, 0, '2024-04-20 10:00:00', '2024-06-19 23:59:59', 3, NOW(), NOW());

-- 23. 后街男孩 2025 世界巡演（未开售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('后街男孩 2025 世界巡演', 1, 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Backstreet%20Boys%20concert%20poster%2C%2090s%20boy%20band&sign=5c6d7e8f9a0b1c2d3e4f', '后街男孩"DNA"世界巡演，重温 90 年代经典流行音乐。', '后街男孩', '广州体育馆', '2025-05-10 19:30:00', '2025-05-10 22:00:00', 0, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(23, 'VIP 区', 2880.00, 80, '2025-02-10 10:00:00', '2025-05-09 23:59:59', 0, NOW(), NOW()),
(23, '内场 A 区', 1880.00, 150, '2025-02-10 10:00:00', '2025-05-09 23:59:59', 0, NOW(), NOW()),
(23, '内场 B 区', 1280.00, 200, '2025-02-10 10:00:00', '2025-05-09 23:59:59', 0, NOW(), NOW()),
(23, '看台 A 区', 880.00, 300, '2025-02-10 10:00:00', '2025-05-09 23:59:59', 0, NOW(), NOW());

-- 24. 莫文蔚「绝色」世界巡回演唱会（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('莫文蔚「绝色」世界巡回演唱会', 1, 'https://picsum.photos/id/1025/800/450', '莫文蔚携经典金曲展开的世界巡演，展现独特音乐魅力与舞台风格。', '莫文蔚', '成都体育中心', '2023-09-10 19:30:00', '2023-09-10 22:00:00', 4, '2023-07-01 00:00:00', NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(24, '内场 VIP', 2580.00, 0, '2023-07-10 10:00:00', '2023-09-09 23:59:59', 3, '2023-07-01 00:00:00', NOW()),
(24, '内场普通', 1680.00, 0, '2023-07-10 10:00:00', '2023-09-09 23:59:59', 3, '2023-07-01 00:00:00', NOW()),
(24, '看台 A 区', 1080.00, 0, '2023-07-10 10:00:00', '2023-09-09 23:59:59', 3, '2023-07-01 00:00:00', NOW());

-- 25. 话剧《暗恋桃花源》（在售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('话剧《暗恋桃花源》', 2, 'https://picsum.photos/id/1026/800/450', '赖声川经典话剧，讲述两个剧团在同一舞台排练的奇妙故事。', '何炅、黄磊等', '北京保利剧院', '2024-06-20 19:30:00', '2024-06-20 22:00:00', 2, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(25, 'VIP 区', 1280.00, 30, '2024-04-15 10:00:00', '2024-06-19 23:59:59', 1, NOW(), NOW()),
(25, 'A 区', 880.00, 50, '2024-04-15 10:00:00', '2024-06-19 23:59:59', 1, NOW(), NOW()),
(25, 'B 区', 580.00, 100, '2024-04-15 10:00:00', '2024-06-19 23:59:59', 1, NOW(), NOW()),
(25, 'C 区', 380.00, 0, '2024-04-15 10:00:00', '2024-06-19 23:59:59', 3, NOW(), NOW());

-- 26. 郎朗钢琴独奏音乐会（预售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('郎朗钢琴独奏音乐会', 3, 'https://picsum.photos/id/1027/800/450', '国际钢琴大师郎朗带来的独奏音乐会，演绎巴赫、贝多芬经典作品。', '郎朗', '上海音乐厅', '2024-10-01 19:30:00', '2024-10-01 21:30:00', 1, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(26, 'VIP 区', 2680.00, 100, '2024-06-15 10:00:00', '2024-09-30 23:59:59', 1, NOW(), NOW()),
(26, 'A 区', 1680.00, 200, '2024-06-15 10:00:00', '2024-09-30 23:59:59', 1, NOW(), NOW()),
(26, 'B 区', 980.00, 300, '2024-06-15 10:00:00', '2024-09-30 23:59:59', 1, NOW(), NOW());

-- 27. 2024 郭德纲相声专场（售罄）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('2024 郭德纲相声专场', 4, 'https://picsum.photos/id/1028/800/450', '郭德纲携德云社核心成员带来的相声盛宴，爆笑全场。', '郭德纲、于谦', '天津体育中心', '2024-05-01 19:30:00', '2024-05-01 22:00:00', 3, '2024-02-01 00:00:00', NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(27, 'VIP 区', 1880.00, 0, '2024-02-10 10:00:00', '2024-04-30 23:59:59', 3, '2024-02-01 00:00:00', NOW()),
(27, 'A 区', 1280.00, 0, '2024-02-10 10:00:00', '2024-04-30 23:59:59', 3, '2024-02-01 00:00:00', NOW()),
(27, 'B 区', 880.00, 0, '2024-02-10 10:00:00', '2024-04-30 23:59:59', 3, '2024-02-01 00:00:00', NOW());

-- 28. 舞剧《杜甫》（未开售）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('舞剧《杜甫》', 5, 'https://picsum.photos/id/1029/800/450', '以唐代诗人杜甫生平为蓝本创作的舞剧，展现盛唐气象与诗人情怀。', '重庆歌舞团', '西安大剧院', '2024-12-15 19:30:00', '2024-12-15 21:30:00', 0, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(28, 'VIP 区', 980.00, 100, '2024-09-15 10:00:00', '2024-12-14 23:59:59', 0, NOW(), NOW()),
(28, 'A 区', 680.00, 200, '2024-09-15 10:00:00', '2024-12-14 23:59:59', 0, NOW(), NOW()),
(28, 'B 区', 480.00, 300, '2024-09-15 10:00:00', '2024-12-14 23:59:59', 0, NOW(), NOW());

-- 29. 罗大佑「当年离家的年轻人」巡回演唱会（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('罗大佑「当年离家的年轻人」巡回演唱会', 1, 'https://picsum.photos/id/1030/800/450', '罗大佑经典作品回顾，带你重温华语流行音乐黄金时代。', '罗大佑', '深圳湾体育中心', '2023-12-24 19:30:00', '2023-12-24 22:30:00', 4, '2023-10-01 00:00:00', NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(29, '内场 VIP', 2280.00, 0, '2023-10-15 10:00:00', '2023-12-23 23:59:59', 3, '2023-10-01 00:00:00', NOW()),
(29, '内场普通', 1580.00, 0, '2023-10-15 10:00:00', '2023-12-23 23:59:59', 3, '2023-10-01 00:00:00', NOW()),
(29, '看台 A 区', 980.00, 0, '2023-10-15 10:00:00', '2023-12-23 23:59:59', 3, '2023-10-01 00:00:00', NOW());

-- 30. 民族舞剧《红楼梦》（已结束）
INSERT INTO `performance` (`title`, `category_id`, `cover_image`, `description`, `performer`, `venue`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
('民族舞剧《红楼梦》', 5, 'https://picsum.photos/id/1031/800/450', '以曹雪芹经典名著为蓝本创作的民族舞剧，再现大观园的繁华与哀愁。', '江苏大剧院歌剧舞剧院', '南京保利大剧院', '2024-07-10 19:30:00', '2024-07-10 22:00:00', 4, NOW(), NOW());

INSERT INTO `ticket_type` (`performance_id`, `name`, `price`, `stock`, `sale_start_time`, `sale_end_time`, `status`, `created_at`, `updated_at`) VALUES
(30, 'VIP 区', 1280.00, 0, '2024-05-01 10:00:00', '2024-07-09 23:59:59', 3, NOW(), NOW()),
(30, 'A 区', 880.00, 0, '2024-05-01 10:00:00', '2024-07-09 23:59:59', 3, NOW(), NOW()),
(30, 'B 区', 580.00, 0, '2024-05-01 10:00:00', '2024-07-09 23:59:59', 3, NOW(), NOW()),
(30, 'C 区', 380.00, 0, '2024-05-01 10:00:00', '2024-07-09 23:59:59', 3, NOW(), NOW());

-- 插入所有订单数据（1-30条）
INSERT INTO `order` (`order_no`, `user_id`, `performance_id`, `ticket_type_id`, `quantity`, `amount`, `status`, `expire_time`, `payment_time`, `created_at`, `updated_at`) VALUES
-- 已支付订单
('ORD20231101001', 1, 1, 1, 2, 5600.00, 1, '2023-11-01 20:30:00', '2023-11-01 15:45:30', '2023-11-01 15:30:00', '2023-11-01 15:45:30'),
('ORD20231102002', 2, 3, 10, 1, 880.00, 1, '2023-11-02 11:30:00', '2023-11-02 10:50:15', '2023-11-02 10:30:00', '2023-11-02 10:50:15'),
('ORD20231103003', 3, 2, 5, 2, 1360.00, 1, '2023-11-03 16:30:00', '2023-11-03 15:20:40', '2023-11-03 15:00:00', '2023-11-03 15:20:40'),
('ORD20231105004', 4, 1, 3, 3, 3600.00, 1, '2023-11-05 21:30:00', '2023-11-05 20:10:25', '2023-11-05 20:00:00', '2023-11-05 20:10:25'),
('ORD20231107005', 5, 8, 17, 2, 1360.00, 1, '2023-11-07 18:30:00', '2023-11-07 17:45:10', '2023-11-07 17:30:00', '2023-11-07 17:45:10'),

-- 待支付订单
('ORD20231110006', 6, 1, 2, 1, 1800.00, 0, '2023-11-10 22:30:00', NULL, '2023-11-10 21:30:00', '2023-11-10 21:30:00'),
('ORD20231110007', 7, 3, 11, 2, 1160.00, 0, '2023-11-10 16:30:00', NULL, '2023-11-10 15:30:00', '2023-11-10 15:30:00'),
('ORD20231110008', 8, 2, 6, 1, 480.00, 0, '2023-11-10 19:30:00', NULL, '2023-11-10 18:30:00', '2023-11-10 18:30:00'),

-- 已取消订单
('ORD20231101009', 9, 1, 4, 4, 3200.00, 2, '2023-11-01 17:30:00', NULL, '2023-11-01 16:30:00', '2023-11-01 17:00:20'),
('ORD20231103010', 10, 3, 12, 2, 760.00, 2, '2023-11-03 11:30:00', NULL, '2023-11-03 10:30:00', '2023-11-03 10:45:10'),
('ORD20231105011', 1, 2, 7, 3, 1140.00, 2, '2023-11-05 14:30:00', NULL, '2023-11-05 13:30:00', '2023-11-05 14:00:35'),

-- 过期未支付订单
('ORD20231102012', 2, 1, 1, 1, 2800.00, 2, '2023-11-02 13:30:00', NULL, '2023-11-02 12:30:00', '2023-11-02 13:30:00'),
('ORD20231104013', 3, 3, 9, 1, 1280.00, 2, '2023-11-04 10:30:00', NULL, '2023-11-04 09:30:00', '2023-11-04 10:30:00'),

-- 高价值订单
('ORD20231106014', 4, 4, 13, 2, 6400.00, 1, '2023-11-06 20:30:00', '2023-11-06 19:15:40', '2023-11-06 19:00:00', '2023-11-06 19:15:40'),
('ORD20231108015', 5, 9, 28, 1, 3680.00, 1, '2023-11-08 16:30:00', '2023-11-08 15:50:20', '2023-11-08 15:30:00', '2023-11-08 15:50:20'),

-- 补充订单数据（16-30条）

-- 已支付订单（新增演出）
('ORD20240101016', 1, 24, 70, 2, 5160.00, 1, '2024-01-01 20:30:00', '2024-01-01 19:15:30', '2024-01-01 19:00:00', '2024-01-01 19:15:30'),
('ORD20240215017', 2, 25, 74, 1, 880.00, 1, '2024-02-15 16:30:00', '2024-02-15 15:45:20', '2024-02-15 15:30:00', '2024-02-15 15:45:20'),
('ORD20240320018', 3, 26, 77, 2, 3360.00, 1, '2024-03-20 21:30:00', '2024-03-20 20:10:45', '2024-03-20 20:00:00', '2024-03-20 20:10:45'),
('ORD20240410019', 4, 27, 79, 1, 1280.00, 1, '2024-04-10 17:30:00', '2024-04-10 16:50:10', '2024-04-10 16:30:00', '2024-04-10 16:50:10'),
('ORD20240505020', 5, 30, 93, 2, 1160.00, 1, '2024-05-05 19:30:00', '2024-05-05 18:45:30', '2024-05-05 18:30:00', '2024-05-05 18:45:30'),

-- 待支付订单（新增演出）
('ORD20240615021', 6, 25, 75, 2, 1160.00, 0, '2024-06-15 20:30:00', NULL, '2024-06-15 19:30:00', '2024-06-15 19:30:00'),
('ORD20240720022', 7, 26, 78, 1, 980.00, 0, '2024-07-20 17:30:00', NULL, '2024-07-20 16:30:00', '2024-07-20 16:30:00'),
('ORD20240810023', 8, 30, 94, 3, 1740.00, 0, '2024-08-10 21:30:00', NULL, '2024-08-10 20:30:00', '2024-08-10 20:30:00'),

-- 已取消订单（新增演出）
('ORD20240120024', 9, 24, 71, 2, 3360.00, 2, '2024-01-20 16:30:00', NULL, '2024-01-20 15:30:00', '2024-01-20 16:00:25'),
('ORD20240205025', 10, 25, 76, 1, 380.00, 2, '2024-02-05 11:30:00', NULL, '2024-02-05 10:30:00', '2024-02-05 10:50:10'),
('ORD20240310026', 1, 29, 88, 2, 3160.00, 2, '2024-03-10 14:30:00', NULL, '2024-03-10 13:30:00', '2024-03-10 14:05:30'),

-- 过期未支付订单（新增演出）
('ORD20240401027', 2, 27, 80, 2, 1760.00, 2, '2024-04-01 13:30:00', NULL, '2024-04-01 12:30:00', '2024-04-01 13:30:00'),
('ORD20240515028', 3, 29, 87, 1, 2280.00, 2, '2024-05-15 10:30:00', NULL, '2024-05-15 09:30:00', '2024-05-15 10:30:00'),

-- 高价值订单（新增演出）
('ORD20240601029', 4, 26, 76, 2, 5360.00, 1, '2024-06-01 20:30:00', '2024-06-01 19:20:45', '2024-06-01 19:00:00', '2024-06-01 19:20:45'),
('ORD20240705030', 5, 25, 73, 2, 2560.00, 1, '2024-07-05 16:30:00', '2024-07-05 15:55:20', '2024-07-05 15:30:00', '2024-07-05 15:55:20');
