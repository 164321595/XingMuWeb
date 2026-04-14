package util

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	CORS     CORSConfig
	Upload   UploadConfig
	Seckill  SeckillConfig
}

type ServerConfig struct {
	Port string
	Mode string
	Host string
}

type DatabaseConfig struct {
	Type            string
	Host            string
	Port            string
	Username        string
	Password        string
	DBName          string
	Charset         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime int
	Dsn             string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
	PoolSize int
	Addr     string
}

type JWTConfig struct {
	Secret string
	Expire int64
}

type CORSConfig struct {
	AllowedOrigins []string
}

type UploadConfig struct {
	Path         string
	MaxSize      int64
	AllowedTypes []string
}

type SeckillConfig struct {
	OrderExpireMinutes int
	MaxQuantityPerUser int
}

var AppConfig *Config

func InitConfig() error {
	workDir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("获取工作目录失败: %w", err)
	}

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(workDir + "/config")
	viper.AddConfigPath(workDir)

	viper.SetEnvPrefix("")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("配置文件读取结果: %v", err)
	} else {
		log.Printf("配置文件已找到: %s", viper.ConfigFileUsed())
	}

	cfg := &Config{}

	cfg.Server.Port = viperGetString("server.port", "8080")
	cfg.Server.Mode = viperGetString("server.mode", "debug")
	cfg.Server.Host = viperGetString("server.host", "0.0.0.0")

	cfg.Database.Type = viperGetString("database.type", "mysql")
	cfg.Database.Host = viperGetString("database.host", "localhost")
	cfg.Database.Port = viperGetString("database.port", "3306")
	cfg.Database.Username = viperGetString("database.username", "root")
	cfg.Database.Password = viperGetString("database.password", "123456")
	cfg.Database.DBName = viperGetString("database.dbname", "ticketdb")
	cfg.Database.Charset = viperGetString("database.charset", "utf8mb4")

	cfg.Database.MaxOpenConns = viper.GetInt("database.max_open_conns")
	if cfg.Database.MaxOpenConns == 0 {
		cfg.Database.MaxOpenConns = 100
	}
	cfg.Database.MaxIdleConns = viper.GetInt("database.max_idle_conns")
	if cfg.Database.MaxIdleConns == 0 {
		cfg.Database.MaxIdleConns = 20
	}
	cfg.Database.ConnMaxLifetime = viper.GetInt("database.conn_max_lifetime")
	if cfg.Database.ConnMaxLifetime == 0 {
		cfg.Database.ConnMaxLifetime = 3600
	}
	cfg.Database.Dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
		cfg.Database.Username, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port, cfg.Database.DBName, cfg.Database.Charset)

	cfg.Redis.Host = viperGetString("redis.host", "localhost")
	cfg.Redis.Port = viperGetString("redis.port", "6379")
	cfg.Redis.Password = viperGetString("redis.password", "")
	cfg.Redis.DB = viper.GetInt("redis.db")
	cfg.Redis.PoolSize = viper.GetInt("redis.pool_size")
	if cfg.Redis.PoolSize == 0 {
		cfg.Redis.PoolSize = 100
	}
	cfg.Redis.Addr = fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port)

	cfg.JWT.Secret = os.Getenv("JWT_SECRET")
	if cfg.JWT.Secret == "" {
		log.Fatal("JWT_SECRET 环境变量未设置，请设置 JWT_SECRET 环境变量")
	}
	cfg.JWT.Expire = int64(viperGetInt("jwt.expire", 7200))

	corsOrigins := viperGetString("cors.allowed_origins", "http://localhost:3000,http://localhost")
	cfg.CORS.AllowedOrigins = strings.Split(corsOrigins, ",")

	cfg.Upload.Path = viperGetString("upload.path", "./uploads")
	cfg.Upload.MaxSize = int64(viperGetInt("upload.max_size", 5242880))

	cfg.Seckill.OrderExpireMinutes = viperGetInt("seckill.order_expire_minutes", 30)
	cfg.Seckill.MaxQuantityPerUser = viperGetInt("seckill.max_quantity_per_user", 5)

	AppConfig = cfg
	log.Println("配置加载成功")
	log.Printf("数据库: %s:%s/%s", cfg.Database.Host, cfg.Database.Port, cfg.Database.DBName)
	return nil
}

func viperGetString(key, defaultValue string) string {
	if value := os.Getenv(strings.ReplaceAll(key, ".", "_")); value != "" {
		return value
	}
	if value := viper.GetString(key); value != "" {
		return value
	}
	return defaultValue
}

func viperGetInt(key string, defaultValue int) int {
	if value := os.Getenv(strings.ReplaceAll(key, ".", "_")); value != "" {
		if v, err := fmt.Sscanf(value, "%d", &defaultValue); err == nil && v > 0 {
			return v
		}
	}
	if viper.IsSet(key) {
		return viper.GetInt(key)
	}
	return defaultValue
}

func GetConfig() *Config {
	if AppConfig == nil {
		log.Fatal("配置未初始化，请先调用 InitConfig()")
	}
	return AppConfig
}
