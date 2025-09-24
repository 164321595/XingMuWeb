package util

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/go-ini/ini"
	"github.com/spf13/viper"
)

// InitConfig 初始化配置文件
func InitConfig() {
	// 设置viper支持从环境变量读取配置
	viper.AutomaticEnv()
	viper.SetEnvPrefix("") // 不添加前缀
	viper.AllowEmptyEnv(true)

	// 获取当前工作目录
	workDir, _ := os.Getwd()
	configPath := filepath.Join(workDir, "config", "app.ini")

	// 读取配置文件（如果存在）
	var cfg *ini.File
	if _, err := os.Stat(configPath); err == nil {
		// 使用go-ini包读取配置文件
		cfg, err = ini.Load(configPath)
		if err != nil {
			log.Printf("警告: 读取配置文件失败，但将继续使用环境变量: %v", err)
		}
	} else {
		log.Printf("警告: 配置文件不存在，但将继续使用环境变量: %s", configPath)
	}

	// 服务器配置
	serverPort := getEnv("SERVER_PORT", "")
	if serverPort == "" && cfg != nil {
		serverPort = cfg.Section("").Key("Port").MustString("8080")
	}
	viper.Set("server.port", serverPort)

	serverMode := getEnv("SERVER_MODE", "")
	if serverMode == "" && cfg != nil {
		serverMode = cfg.Section("").Key("Mode").MustString("debug")
	}
	viper.Set("server.mode", serverMode)

	// 数据库配置
	dbHost := getEnv("DB_HOST", "")
	dbPort := getEnv("DB_PORT", "")
	dbUser := getEnv("DB_USER", "")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "")

	// 默认值
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	if dbPort == "" {
		dbPort = "3306"
	}
	if dbUser == "" {
		dbUser = "root"
	}
	if dbPassword == "" {
		dbPassword = "123456"
	}
	if dbName == "" {
		dbName = "ticketdb"
	}

	// 从配置文件获取默认值（如果环境变量未设置）
	if cfg != nil {
		if dbHost == "127.0.0.1" {
			dbHost = "127.0.0.1"
		}
		if dbPassword == "123456" && cfg.Section("database").HasKey("Dsn") {
			// 从DSN解析密码（如果需要）
		}
	}

	// 构建DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)
	viper.Set("database.type", "mysql")
	viper.Set("database.username", dbUser)
	viper.Set("database.dsn", dsn)
	viper.Set("database.host", dbHost)
	viper.Set("database.port", dbPort)
	viper.Set("database.dbname", dbName)
	viper.Set("database.charset", "utf8mb4")
	viper.Set("database.parseTime", true)

	// Redis配置
	redisHost := getEnv("REDIS_HOST", "")
	redisPort := getEnv("REDIS_PORT", "")
	redisPassword := getEnv("REDIS_PASSWORD", "")
	redisDB := getEnv("REDIS_DB", "")

	if redisHost == "" {
		redisHost = "127.0.0.1"
	}
	if redisPort == "" {
		redisPort = "6379"
	}

	redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)
	viper.Set("redis.Addr", redisAddr)
	viper.Set("redis.Password", redisPassword)

	redisDBInt := 0
	if redisDB != "" {
		// 转换为整数
	}
	viper.Set("redis.DB", redisDBInt)

	// JWT配置
	jwtSecret := getEnv("JWT_SECRET", "")
	jwtExpire := getEnv("JWT_EXPIRE", "")

	if jwtSecret == "" && cfg != nil {
		jwtSecret = cfg.Section("jwt").Key("Secret").MustString("")
	}
	viper.Set("jwt.Secret", jwtSecret)

	jwtExpireInt := 7200
	if jwtExpire != "" {
		// 转换为整数
	} else if cfg != nil {
		jwtExpireInt = cfg.Section("jwt").Key("Expire").MustInt(7200)
	}
	viper.Set("jwt.Expire", jwtExpireInt)

	log.Println("配置加载成功")
}

// getEnv 从环境变量获取值，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}