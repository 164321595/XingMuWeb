# 票务系统 Docker 部署指南

本目录包含票务系统的 Docker 部署配置文件，可以通过 Docker Compose 一键部署整个系统。

## 包含的服务

- **web**: 前端应用 (Nginx + React)
- **backend**: 后端服务 (Go)
- **db**: MySQL 数据库
- **redis**: Redis 缓存服务

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

## 部署步骤

### 1. 进入项目根目录

```bash
cd d:\selfworks\Code\Server
```

### 2. 启动所有服务

使用 Docker Compose 一键启动所有服务：

```bash
docker-compose up -d
```

这个命令会：
- 构建所有服务的 Docker 镜像
- 创建并启动所有容器
- 设置网络和卷

### 3. 验证服务是否正常运行

查看所有容器的状态：

```bash
docker-compose ps
```

查看服务日志：

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs web
# 或实时查看日志
docker-compose logs -f backend
```

## 访问系统

- 前端应用: http://localhost:80
- 后端 API: http://localhost:8080
- MySQL 数据库: localhost:3306 (用户名: root, 密码: 123456)
- Redis: localhost:6379

## 环境配置

主要环境变量配置位于 `.env` 文件中，可以根据需要进行修改：

- 数据库连接信息
- Redis 连接信息
- 服务器端口和模式
- JWT 配置

## 数据持久化

以下数据会被持久化存储在 Docker 卷中：

- MySQL 数据库数据 (`mysql-data` 卷)
- Redis 数据 (`redis-data` 卷)
- 上传的文件 (`uploads` 卷)

## 常见操作

### 停止所有服务

```bash
docker-compose down
```

### 停止并删除所有服务（包括卷）

```bash
docker-compose down -v
```

### 重新构建特定服务

```bash
docker-compose build backend
```

### 更新代码后重启服务

```bash
docker-compose up -d --build
```

## 注意事项

1. 首次启动时，MySQL 容器会自动执行初始化 SQL 脚本，创建数据库和表结构。
2. 后端服务会等待 MySQL 和 Redis 服务完全启动后才启动。
3. 在生产环境中，请修改 `.env` 文件中的敏感信息，如密码等。
4. 如需自定义端口映射，请修改 `docker-compose.yml` 文件中的 `ports` 部分。

## 故障排查

- 如果服务启动失败，请查看容器日志以获取详细错误信息。
- 如果数据库连接问题，请检查 `DB_HOST` 是否正确设置为 `db`。
- 如果前端无法访问后端 API，请检查 Nginx 配置中的代理设置。