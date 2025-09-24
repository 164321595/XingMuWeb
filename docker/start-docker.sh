#!/bin/bash

# 检查Docker是否正在运行
docker info > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "错误: Docker未启动。请先启动Docker Desktop。"
    exit 1
fi

# 检查docker-compose是否可用
docker-compose --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "错误: docker-compose命令未找到。请确保已正确安装Docker Compose。"
    exit 1
fi

# 进入项目根目录
cd "$(dirname "$0")/.."

# 构建并启动所有服务
echo "正在构建并启动票务系统服务..."
docker-compose -f docker-compose.yml up -d --build

# 检查启动结果
if [ $? -eq 0 ]; then
    echo "
服务启动成功! 可以通过以下地址访问系统:
- 前端应用: http://localhost:80
- 后端API: http://localhost:8080

可以使用以下命令查看服务状态:
  docker-compose -f docker-compose.yml ps

可以使用以下命令查看服务日志:
  docker-compose -f docker-compose.yml logs -f
"
else
    echo "
错误: 服务启动失败。请查看上面的错误信息并尝试修复问题。"
    echo "常见问题排查:
1. 确保Docker Desktop正在运行
2. 确保80、8080、3306、6379端口未被占用
3. 检查Dockerfile中的文件路径是否正确"
fi