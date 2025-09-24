package util

import (
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/spf13/viper"
)

var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() {
	var err error
	// 从配置中获取数据库信息
	dbType := viper.GetString("database.type")
	dsn := viper.GetString("database.dsn")

	// 连接数据库
	DB, err = gorm.Open(dbType, dsn)
	if err != nil {
		panic(fmt.Errorf("数据库连接失败: %v", err))
	}

	// 设置连接池参数
	DB.DB().SetMaxIdleConns(10)
	DB.DB().SetMaxOpenConns(100)
	DB.DB().SetConnMaxLifetime(time.Hour)

	// 禁用默认表名的复数形式
	DB.SingularTable(true)

	// 设置日志模式
	mode := viper.GetString("server.mode")
	if mode == "debug" {
		DB.LogMode(true)
	} else {
		DB.LogMode(false)
	}
}

// CloseDB 关闭数据库连接
func CloseDB() {
	if DB != nil {
		if err := DB.Close(); err != nil {
			fmt.Printf("关闭数据库连接失败: %v\n", err)
		}
	}
}