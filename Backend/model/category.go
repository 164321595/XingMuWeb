package model

import (
	"time"

	"ticket-system-backend/util"
)

type Category = PerformanceCategory

// PerformanceCategory 演出分类模型
type PerformanceCategory struct {
	ID        int       `gorm:"primary_key" json:"id"`
	Name      string    `gorm:"size:50;not null" json:"name"`
	ParentID  int       `gorm:"not null;default:0" json:"parent_id"`
	Sort      int       `gorm:"not null;default:0" json:"sort"`
	CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

// SystemConfig 系统配置模型
type SystemConfig struct {
	ID          int       `gorm:"primary_key" json:"id"`
	Key         string    `gorm:"size:50;not null;unique" json:"key"`
	Value       string    `gorm:"type:text" json:"value"`
	Description string    `gorm:"size:255" json:"description"`
	UpdatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

// GetAllCategories 获取所有分类
func GetAllCategories() ([]*Category, error) {
	var categories []*Category
	err := util.DB.Order("sort ASC, id ASC").Find(&categories).Error
	return categories, err
}

// GetCategoryByID 获取分类详情
func GetCategoryByID(id int) (*Category, error) {
	var category Category
	err := util.DB.Where("id = ?", id).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// CreateCategory 创建分类
func CreateCategory(category *Category) error {
	return util.DB.Create(category).Error
}

// UpdateCategory 更新分类
func UpdateCategory(category *Category) error {
	return util.DB.Model(category).Updates(category).Error
}

// DeleteCategory 删除分类
func DeleteCategory(id int) error {
	return util.DB.Delete(&Category{}, "id = ?", id).Error
}

// HasCategoryPerformances 检查分类是否有演出
func HasCategoryPerformances(categoryID int) bool {
	var count int
	util.DB.Model(&Performance{}).Where("category_id = ?", categoryID).Count(&count)
	return count > 0
}

// GetAllSystemConfigs 获取所有系统配置
func GetAllSystemConfigs() ([]*SystemConfig, error) {
	var configs []*SystemConfig
	err := util.DB.Find(&configs).Error
	return configs, err
}

// UpdateSystemConfig 更新系统配置
func UpdateSystemConfig(key, value string) error {
	return util.DB.Model(&SystemConfig{}).Where("`key` = ?", key).Update("value", value).Error
}