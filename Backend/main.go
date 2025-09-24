package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/spf13/viper"
	"ticket-system-backend/router"
	"ticket-system-backend/util"
)

func main() {
	// 1. 初始化配置
	util.InitConfig()

	// 2. 初始化MySQL数据库
	util.InitDB()
	defer util.CloseDB()

	// 3. 初始化Redis
	util.InitRedis()
	defer util.CloseRedis()

	// 设置路由
	r := router.SetupRouter()

	// 设置静态文件服务
	router.ServeStaticFiles(r)

	// 5. 启动HTTP服务器
	port := viper.GetString("server.port")
	if port == "" {
		port = "8080"
	}

	// 启动服务器在一个goroutine中
	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("启动服务器失败: %v", err)
		}
	}()

	fmt.Printf("服务器已启动，监听端口: %s\n", port)

	// 等待中断信号以优雅地关闭服务器
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("正在关闭服务器...")

	// 优雅关闭服务器，等待活跃连接完成
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("服务器关闭失败: %v", err)
	}

	fmt.Println("服务器已关闭")
}