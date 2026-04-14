# 星幕票务系统 (XingMu Ticket System)

一个现代化的在线票务预订平台，支持演出浏览、票务抢购、订单管理、用户管理等功能。采用前后端分离架构，使用 React + Go + MySQL + Redis 技术栈。

## 功能特性

### 用户端
- 🏠 首页 - 热门演出推荐、分类浏览
- 🎭 演出列表 - 按分类、状态筛选，支持搜索
- 🎫 演出详情 - 演出信息、座位选择、立即购买
- ⚡ 秒杀抢票 - 分布式锁保证抢票一致性
- 📋 订单管理 - 订单列表、订单详情、取消/支付/退款
- 👤 个人中心 - 账户设置、隐私设置、数据导出

### 管理端
- 📊 数据看板 - 今日/本周收入、订单统计、分类分布
- 👥 用户管理 - 用户列表、状态管理、删除
- 🎭 演出管理 - CRUD 演出信息、封面上传
- 🎫 票种管理 - 票种配置、库存管理
- 📦 订单管理 - 订单列表、退款处理、订单导出
- 🏷️ 分类管理 - 演出分类配置
- ⚙️ 系统设置 - 系统配置管理
- 📝 日志审计 - 管理员操作日志

## 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **路由**: React Router v6
- **状态管理**: React Context
- **HTTP 客户端**: Axios
- **图表**: Recharts
- **样式**: Tailwind CSS
- **UI 组件**: 自定义组件库

### 后端
- **语言**: Go 1.23
- **框架**: Gin Web Framework
- **数据库**: MySQL 8.0
- **缓存**: Redis 7
- **认证**: JWT
- **密码加密**: bcrypt

### 部署
- **容器化**: Docker + Docker Compose
- **Web 服务器**: Nginx

## 项目结构

```
XingMuWeb/
├── Backend/                 # Go 后端服务
│   ├── controller/          # 控制器层
│   ├── middleware/          # 中间件 (认证、日志)
│   ├── model/              # 数据模型层
│   ├── router/             # 路由配置
│   ├── service/            # 业务逻辑层
│   ├── util/               # 工具函数
│   ├── config/             # 配置文件
│   ├── main.go             # 程序入口
│   └── Dockerfile           # Docker 构建文件
│
├── Web/                     # React 前端应用
│   ├── src/
│   │   ├── api/           # API 请求封装
│   │   ├── components/    # 公共组件
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── pages/          # 页面组件
│   │   │   ├── admin/      # 管理端页面
│   │   │   ├── Home.tsx    # 首页
│   │   │   ├── Login.tsx   # 登录页
│   │   │   └── ...
│   │   └── types/          # TypeScript 类型定义
│   ├── Dockerfile          # Docker 构建文件
│   └── nginx.conf          # Nginx 配置
│
├── Database/                # 数据库脚本
│   ├── test_data_full.sql  # 完整测试数据
│   └── *.sql               # 其他数据库脚本
│
├── docker/                  # Docker 辅助文件
├── docker-compose.yml       # Docker Compose 配置
└── README.md               # 项目说明文档
```

## 快速开始

### 环境要求

- Docker Desktop (Windows) / Docker Engine (Linux/Mac)
- Node.js 20+ (本地开发前端)
- Go 1.21+ (本地开发后端)
- MySQL 8.0 (Docker 方式运行)
- Redis 7 (Docker 方式运行)

### Docker 部署 (推荐)

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd XingMuWeb
   ```

2. **启动服务**
   ```bash
   # Windows
   docker-compose up -d --build

   # Linux/Mac
   sudo docker-compose up -d --build
   ```

3. **访问应用**
   - 前端: http://localhost
   - 后端 API: http://localhost:8080
   - 健康检查: http://localhost:8080/health

### 本地开发

#### 1. 启动数据库服务

```bash
# 使用 Docker 启动 MySQL 和 Redis
docker run -d --name ticket-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=ticketdb \
  -p 3308:3306 \
  mysql:8.0

docker run -d --name ticket-redis \
  -p 6399:6379 \
  redis:7-alpine
```

#### 2. 初始化数据库

```bash
# 导入测试数据
docker exec -i ticket-mysql mysql -uroot -proot123 ticketdb < Database/test_data_full.sql
```

#### 3. 启动后端服务

```bash
cd Backend

# 设置环境变量
export JWT_SECRET=your-secure-secret-key
export DATABASE_HOST=localhost
export DATABASE_PORT=3306
export DATABASE_USERNAME=root
export DATABASE_PASSWORD=root123
export DATABASE_DBNAME=ticketdb

# 启动服务
go run main.go
```

#### 4. 启动前端服务

```bash
cd Web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 默认账户

### 管理员账户
- **用户名**: admin
- **密码**: 123456
- **登录地址**: http://localhost/admin/login

### 用户账户
- **用户名**: testuser
- **密码**: 123456
- **注册地址**: http://localhost/register

## API 文档

### 认证接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/admin/auth/login` | POST | 管理员登录 |

### 公开接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/performances` | GET | 演出列表 |
| `/api/performances/:id` | GET | 演出详情 |
| `/api/performances/categories` | GET | 分类列表 |
| `/health` | GET | 健康检查 |

### 用户接口 (需认证)

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/users/current` | GET | 获取当前用户信息 |
| `/api/orders` | GET | 用户订单列表 |
| `/api/orders/:id` | GET | 订单详情 |
| `/api/orders/:id/pay` | POST | 支付订单 |
| `/api/orders/:id/cancel` | POST | 取消订单 |

### 管理接口 (需管理员认证)

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/admin/dashboard/stats` | GET | 仪表盘统计 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/performances` | GET | 演出列表 |
| `/api/admin/performances` | POST | 创建演出 |
| `/api/admin/ticket-types` | GET | 票种列表 |
| `/api/admin/orders` | GET | 订单列表 |

## 配置说明

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `JWT_SECRET` | JWT 密钥 (必填) | - |
| `DATABASE_HOST` | 数据库地址 | localhost |
| `DATABASE_PORT` | 数据库端口 | 3306 |
| `DATABASE_USERNAME` | 数据库用户名 | root |
| `DATABASE_PASSWORD` | 数据库密码 | 123456 |
| `DATABASE_DBNAME` | 数据库名称 | ticketdb |
| `REDIS_HOST` | Redis 地址 | localhost |
| `REDIS_PORT` | Redis 端口 | 6379 |
| `GIN_MODE` | 运行环境 | debug |

### Docker 环境变量

在 `docker-compose.yml` 中已预配置，主要环境变量：

```yaml
environment:
  - JWT_SECRET=damai_ticket_system_jwt_secret_2024_xK9mP2vL8nQ3wZ5j
  - DATABASE_HOST=mysql
  - DATABASE_PORT=3306
  - DATABASE_USERNAME=root
  - DATABASE_PASSWORD=root123
  - DATABASE_DBNAME=ticketdb
  - REDIS_HOST=redis
  - REDIS_PORT=6379
```

## 安全特性

- ✅ JWT 令牌认证
- ✅ 密码 bcrypt 加密
- ✅ 强密码策略验证
- ✅ 文件类型上传限制
- ✅ SQL 注入防护
- ✅ XSS 防护
- ✅ CORS 跨域限制
- ✅ 操作日志审计
- ✅ 管理员权限控制

## 项目命令

```bash
# Docker
docker-compose up -d          # 启动所有服务
docker-compose down          # 停止所有服务
docker-compose logs -f      # 查看日志
docker-compose restart      # 重启服务

# 前端 (Web 目录)
pnpm install                 # 安装依赖
pnpm dev                     # 开发模式
pnpm build                   # 生产构建
pnpm preview                 # 预览构建结果

# 后端 (Backend 目录)
go mod tidy                 # 整理依赖
go build                    # 编译
go run main.go              # 运行
```

## 端口说明

| 服务 | 端口 | 描述 |
|------|------|------|
| 前端 (Nginx) | 80 | Web 应用入口 |
| 后端 (Go) | 8080 | API 服务 |
| MySQL | 3308 | 数据库 (外部访问) |
| Redis | 6399 | 缓存 (外部访问) |

## 开发指南

### 添加新页面

1. 在 `Web/src/pages/` 创建页面组件
2. 在 `Web/src/App.tsx` 添加路由
3. 如需权限控制，包裹在认证组件中

### 添加 API 接口

1. 后端: 在 `controller/` 添加处理函数
2. 后端: 在 `router/router.go` 注册路由
3. 前端: 在 `Web/src/api/` 添加请求函数
4. 前端: 在 `Web/src/types/index.ts` 添加类型定义

### 数据库迁移

```bash
# 连接到 MySQL 容器
docker exec -it ticket-mysql mysql -uroot -proot123 ticketdb

# 执行 SQL
source /docker-entrypoint-initdb.d/your_sql_file.sql
```

## 许可证

本项目仅供学习交流使用。

## 联系方式

如有问题，请提交 Issue。
