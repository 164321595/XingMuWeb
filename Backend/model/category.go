package model

import (
	"time"

	"ticket-system-backend/util"
)

// PerformanceCategory 演出分类模型
type PerformanceCategory struct {
	ID        int       `gorm:"primary_key" json:"id"`
	Name      string    `gorm:"size:50;not null" json:"name"`
	ParentID  int       `gorm:"not null;default:0" json:"parent_id"`
	Sort      int       `gorm:"not null;default:0" json:"sort"`
	CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

// 获取所有分类
func GetAllCategories() ([]*PerformanceCategory, error) {
	var categories []*PerformanceCategory
	err := util.DB.Order("sort asc").Find(&categories).Error
	return categories, err
}

// 根据ID获取分类
func GetCategoryByID(id int) (*PerformanceCategory, error) {
	var category PerformanceCategory
	err := util.DB.Where("id = ?", id).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}