# 票务系统后端

这是票务系统的后端Go服务，负责处理业务逻辑、数据存储和API接口提供。

## 项目信息

- **项目名称**: ticket-system-backend
- **开发语言**: Go 1.25.1
- **项目结构**: 采用经典的MVC架构设计

## 技术栈详情

### 核心框架与库
- **Gin**: 1.11.0 - Web框架
- **GORM**: 1.9.16 - ORM框架
- **MySQL Driver**: 1.9.3 - MySQL数据库驱动
- **Redis Client**: 8.11.5 - Redis客户端
- **JWT**: 4.5.2 - JSON Web Token认证
- **Viper**: 1.21.0 - 配置管理
- **INI**: 1.67.0 - INI配置文件解析

## 项目结构

```
Backend/
├── config/                # 配置文件
│   └── app.ini            # 应用配置
├── controller/            # 控制器层，处理HTTP请求
│   ├── order.go           # 订单相关控制器
│   ├── performance.go     # 演出相关控制器
│   ├── ticket.go          # 票务相关控制器
│   └── user.go            # 用户相关控制器
├── middleware/            # 中间件
│   └── auth.go            # 认证中间件
├── model/                 # 数据模型层
│   ├── category.go        # 分类模型
│   ├── order.go           # 订单模型
│   ├── performance.go     # 演出模型
│   ├── ticket_type.go     # 票种模型
│   ├── user.go            # 用户模型
│   └── user_privacy_setting.go # 用户隐私设置模型
├── router/                # 路由配置
│   └── router.go          # 路由定义
├── service/               # 业务逻辑层（待实现）
├── uploads/               # 上传文件存储目录
│   ├── avatars/           # 用户头像
│   └── covers/            # 演出封面
├── util/                  # 工具函数
│   ├── config.go          # 配置加载
│   ├── jwt.go             # JWT工具
│   ├── mysql.go           # MySQL数据库连接
│   ├── redis.go           # Redis连接
│   └── response.go        # 响应格式化
├── go.mod                 # Go模块定义
├── go.sum                 # 依赖版本锁定
├── main.go                # 程序入口
└── ticket-system-backend.exe # 编译后的可执行文件
```

## 快速开始

### 环境准备
- 安装 [Go](https://golang.org/) (1.20+)
- 安装并配置 [MySQL](https://www.mysql.com/)
- 安装并配置 [Redis](https://redis.io/)

### 开发流程

1. **配置数据库**

   确保MySQL和Redis服务正常运行，并在`config/app.ini`中配置正确的连接信息。

2. **初始化依赖**

```bash
# 进入Backend目录
cd Backend
# 安装依赖
go mod tidy
```

3. **启动服务**

```bash
# 直接运行
go run main.go

# 或编译后运行
go build -o ticket-system-backend
ticket-system-backend.exe  # Windows系统
./ticket-system-backend    # Linux/Mac系统
```

后端服务默认运行在 http://localhost:8080

## API接口

### 认证接口
- **POST /api/auth/register** - 用户注册
- **POST /api/auth/login** - 用户登录

### 用户接口
- **GET /api/users/current** - 获取当前用户信息
- **PUT /api/users/current** - 更新用户信息
- **POST /api/users/current/change-password** - 修改密码
- **GET /api/users/current/privacy-settings** - 获取隐私设置
- **PUT /api/users/current/privacy-settings** - 更新隐私设置
- **POST /api/users/current/export-data** - 导出用户数据
- **POST /api/users/current/delete-data** - 删除用户数据
- **POST /api/users/current/avatar** - 上传头像

### 演出接口
- **GET /api/performances** - 获取演出列表
- **GET /api/performances/:id** - 获取演出详情
- **GET /api/performances/categories** - 获取演出分类
- **POST /api/performances/:id/cover** - 上传演出封面（需要认证）

### 票务接口
- **GET /api/tickets/seckill** - 获取秒杀信息
- **POST /api/tickets/seckill** - 参与票务秒杀（需要认证）

### 订单接口
- **POST /api/orders/from-seckill** - 从秒杀创建订单
- **GET /api/orders** - 获取用户订单列表
- **GET /api/orders/:id** - 获取订单详情
- **POST /api/orders/:id/cancel** - 取消订单
- **POST /api/orders/:id/pay** - 支付订单
- **POST /api/orders/:id/refund** - 申请退款

### 健康检查接口
- **GET /health** - 服务健康检查

## 数据模型

### 主要数据实体
- **User**: 用户信息实体
- **Performance**: 演出信息实体
- **PerformanceCategory**: 演出分类实体
- **TicketType**: 票种信息实体
- **Order**: 订单信息实体
- **UserPrivacySetting**: 用户隐私设置实体

## 中间件

- **JWTAuthMiddleware**: JWT认证中间件，用于保护需要认证的API接口
- **CORS Middleware**: 跨域资源共享中间件
- **API Prefix Middleware**: API前缀重定向中间件

## 配置说明

配置文件位于`config/app.ini`，包含以下主要配置项：

- **Server**: 服务器配置（端口等）
- **MySQL**: 数据库连接配置
- **Redis**: 缓存连接配置
- **JWT**: JWT认证配置
- **Upload**: 文件上传配置

## 开发规范

1. **代码规范**
   - 遵循Go语言标准编码规范
   - 函数和变量命名清晰明了
   - 添加适当的注释说明

2. **目录结构**
   - 保持现有MVC架构
   - 新增功能按照模块划分

3. **错误处理**
   - 使用错误返回值而非panic
   - 错误信息应包含足够的上下文

4. **日志记录**
   - 关键操作和错误应记录日志
   - 日志格式应统一规范

## 部署说明

### 本地部署
1. 编译项目: `go build -o ticket-system-backend`
2. 确保配置文件正确
3. 运行可执行文件

### Docker部署
项目根目录提供了Docker Compose配置，可以一键部署整个系统：

```bash
# 在项目根目录执行
docker-compose up -d --build
```

## 注意事项
- 确保MySQL和Redis服务正常运行
- 生产环境下，请修改配置文件中的敏感信息
- 定期备份数据库以防止数据丢失
- 注意监控系统性能和安全