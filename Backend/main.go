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

	"ticket-system-backend/router"
	"ticket-system-backend/util"
)

func main() {
	if err := util.InitConfig(); err != nil {
		log.Fatalf("初始化配置失败: %v", err)
	}

	util.InitDB()
	defer util.CloseDB()

	util.InitRedis()
	defer util.CloseRedis()

	r := router.SetupRouter()

	router.ServeStaticFiles(r)

	cfg := util.GetConfig()
	port := cfg.Server.Port
	if port == "" {
		port = "8080"
	}

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

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("正在关闭服务器...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("服务器关闭失败: %v", err)
	}

	fmt.Println("服务器已关闭")
}
