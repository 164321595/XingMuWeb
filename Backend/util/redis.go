package util

import (
	"context"
	"fmt"

	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
)

var RedisClient *redis.Client
var ctx = context.Background()

// InitRedis 初始化Redis连接
func InitRedis() {
	addr := viper.GetString("redis.Addr")
	password := viper.GetString("redis.Password")
	db := viper.GetInt("redis.DB")

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	// 测试连接
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		panic(fmt.Errorf("Redis连接失败: %v", err))
	}
}

// CloseRedis 关闭Redis连接
func CloseRedis() {
	if RedisClient != nil {
		if err := RedisClient.Close(); err != nil {
			fmt.Printf("关闭Redis连接失败: %v\n", err)
		}
	}
}