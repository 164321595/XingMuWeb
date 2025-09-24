@echo off

REM 检查Docker是否正在运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker未启动。请先启动Docker Desktop。
    pause
    exit /b 1
)

REM 检查docker-compose是否可用
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: docker-compose命令未找到。请确保已正确安装Docker Compose。
    pause
    exit /b 1
)

REM 进入项目根目录
cd /d "%~dp0\.."

REM 构建并启动所有服务
echo 正在构建并启动票务系统服务...
docker-compose -f docker-compose.yml up -d --build

REM 检查启动结果
if %errorlevel% equ 0 (
    echo.
    echo 服务启动成功! 可以通过以下地址访问系统:
    echo - 前端应用: http://localhost:80
    echo - 后端API: http://localhost:8080
    echo.
    echo 可以使用以下命令查看服务状态:
    echo   docker-compose -f docker-compose.yml ps
    echo.
    echo 可以使用以下命令查看服务日志:
    echo   docker-compose -f docker-compose.yml logs -f
) else (
    echo.
    echo 错误: 服务启动失败。请查看上面的错误信息并尝试修复问题。
    echo 常见问题排查:
    echo 1. 确保Docker Desktop正在运行
    echo 2. 确保80、8080、3306、6379端口未被占用
    echo 3. 检查Dockerfile中的文件路径是否正确
)

pause