# 票务系统项目

这是一个完整的票务系统项目，包含前端、后端和数据库三个主要部分。该系统允许用户浏览演出信息、购买门票、管理订单和个人信息等功能。

## 项目结构

项目采用前后端分离的架构设计，包含以下主要目录：

这是一个构思后端，以后不会犯错了，也不想改动了，一股java味的go后端，知错了。

```
Server/
├── Web/             # 前端React应用
├── Backend/         # Go语言后端服务
├── Database/        # 数据库脚本和说明
├── DockerTest/      # Docker测试项目
├── docker/          # Docker部署相关配置
└── docker-compose.yml # Docker Compose配置文件
```

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router
- **状态管理**: React Context API
- **UI组件**: 自定义组件 + Framer Motion 动画
- **HTTP请求**: 自定义API封装

### 后端
- **语言**: Go 1.25.1
- **Web框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL
- **缓存**: Redis
- **认证**: JWT
- **配置管理**: Viper

### 数据库
- MySQL关系型数据库
- 包含用户、演出、票种、订单等核心数据表

## 功能特性

### 核心功能
- 用户注册、登录、个人信息管理
- 演出信息浏览、搜索、详情查看
- 门票购买、秒杀功能
- 订单管理、支付、取消、退款
- 用户隐私设置管理

### 系统特色
- 采用前后端分离架构，易于维护和扩展
- 完整的用户认证和授权机制
- 支持Docker容器化部署
- 响应式设计，适配不同设备

## 快速开始

### 前提条件
- 安装 Node.js (16+) 和 pnpm
- 安装 Go (1.20+)
- 安装 MySQL 和 Redis
- 安装 Docker 和 Docker Compose (可选)

### 本地开发流程

#### 1. 初始化数据库

```bash
# 进入Database目录
cd Database
# 执行SQL脚本创建数据库和表
mysql -u root -p < Createdb.sql
```

#### 2. 启动后端服务

```bash
# 进入Backend目录
cd Backend
# 安装依赖
go mod tidy
# 配置app.ini文件
# 启动服务
go run main.go
```

#### 3. 启动前端服务

```bash
# 进入Web目录
cd Web
# 安装依赖
pnpm install
# 启动开发服务器
pnpm dev
```

#### 4. 访问系统
打开浏览器，访问 http://localhost:3000

## Docker部署

使用Docker Compose可以快速部署整个系统：

```bash
# 在项目根目录执行
docker-compose up -d --build
```

## 文档说明

- [前端文档](Web/README.md)
- [后端文档](Backend/README.md)
- [数据库文档](Database/README.md)

## 注意事项
- 开发环境下，请确保MySQL和Redis服务正常运行
- 生产环境下，请修改配置文件中的敏感信息
- 系统包含用户数据隐私设置，请遵守相关数据保护法规

## 版权信息
© 2024 票务系统项目团队. 保留所有权利。
