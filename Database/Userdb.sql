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