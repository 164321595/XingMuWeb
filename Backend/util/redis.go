package util

import (
	"context"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client
var ctx = context.Background()

func InitRedis() {
	cfg := GetConfig()

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
		PoolSize: cfg.Redis.PoolSize,
	})

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		panic(fmt.Errorf("Redis连接失败: %v", err))
	}
}

func CloseRedis() {
	if RedisClient != nil {
		if err := RedisClient.Close(); err != nil {
			fmt.Printf("关闭Redis连接失败: %v\n", err)
		}
	}
}

func GetRedisClient() *redis.Client {
	if RedisClient == nil {
		log.Fatal("Redis未初始化，请先调用 InitRedis()")
	}
	return RedisClient
}
