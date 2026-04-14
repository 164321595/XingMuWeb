package util

import (
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var DB *gorm.DB

func InitDB() {
	cfg := GetConfig()

	var err error
	DB, err = gorm.Open(cfg.Database.Type, cfg.Database.Dsn)
	if err != nil {
		panic(fmt.Errorf("数据库连接失败: %v", err))
	}

	DB.DB().SetMaxIdleConns(cfg.Database.MaxIdleConns)
	DB.DB().SetMaxOpenConns(cfg.Database.MaxOpenConns)
	DB.DB().SetConnMaxLifetime(time.Duration(cfg.Database.ConnMaxLifetime) * time.Second)

	DB.SingularTable(true)

	if cfg.Server.Mode == "debug" {
		DB.LogMode(true)
	} else {
		DB.LogMode(false)
	}
}

func CloseDB() {
	if DB != nil {
		if err := DB.Close(); err != nil {
			fmt.Printf("关闭数据库连接失败: %v\n", err)
		}
	}
}
