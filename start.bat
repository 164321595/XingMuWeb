@echo off
chcp 65001 >nul

echo ========================================
echo        大麦抢票系统 - 一键启动
echo ========================================
echo.

echo [1/3] 正在初始化数据库...
set MYSQL_PWD=123456
mysql -h localhost -u root -e "CREATE DATABASE IF NOT EXISTS ticketdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
mysql -h localhost -u root ticketdb < "Database\admin_schema.sql" 2>nul
if %errorlevel% equ 0 (
    echo       数据库初始化完成!
) else (
    echo       数据库可能已存在或有问题，继续...
)

echo.
echo [2/3] 正在启动后端服务...
start "Backend" cmd /k "cd /d "%~dp0Backend" && go run main.go"

echo.
echo [3/3] 正在启动前端服务...
start "Frontend" cmd /k "cd /d "%~dp0Web" && npm run dev"

echo.
echo ========================================
echo        服务启动中，请耐心等待...
echo ========================================
echo.
echo 访问地址:
echo   前台:    http://localhost:3000
echo   后台:    http://localhost:3000/admin
echo.
echo 管理员账号:
echo   admin / 123456
echo   content_mgr / 123456
echo   ticket_mgr / 123456
echo.
pause
