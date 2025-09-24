package model

import (
	"time"

	"ticket-system-backend/util"
)

// Performance 演出模型
type Performance struct {
	ID          int       `gorm:"primary_key" json:"id"`
	Title       string    `gorm:"size:100;not null" json:"title"`
	CategoryID  int       `gorm:"not null" json:"category_id"`
	CoverImage  string    `gorm:"size:255;not null" json:"cover_image"`
	Description string    `gorm:"type:text" json:"description"`
	Performer   string    `gorm:"size:100;not null" json:"performer"`
	Venue       string    `gorm:"size:100;not null" json:"venue"`
	StartTime   time.Time `gorm:"not null" json:"start_time"`
	EndTime     time.Time `gorm:"not null" json:"end_time"`
	Status      int       `gorm:"type:tinyint;not null" json:"status"` // 0:未开售,1:预售,2:在售,3:售罄,4:已结束
	CreatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

// PerformanceQuery 演出查询条件
type PerformanceQuery struct {
	CategoryID int
	Keyword    string
	Status     int // 0:未开售,1:预售,2:在售,3:售罄,4:已结束
	Page       int
	Size       int
}

// 获取演出列表
func GetPerformances(query PerformanceQuery) ([]*Performance, int, error) {
	var performances []*Performance
	var total int

	tx := util.DB.Model(&Performance{})

	// 按分类筛选
	if query.CategoryID > 0 {
		tx = tx.Where("category_id = ?", query.CategoryID)
	}

	// 按关键词搜索
	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		tx = tx.Where("title LIKE ? OR description LIKE ?", keyword, keyword)
	}
	
	// 按状态筛选
	if query.Status >= 0 && query.Status <= 4 {
		tx = tx.Where("status = ?", query.Status)
	}

	// 获取总数
	tx.Count(&total)

	// 分页
	page := query.Page
	if page < 1 {
		page = 1
	}
	size := query.Size
	if size < 1 {
		size = 10
	}
	offset := (page - 1) * size
	tx = tx.Offset(offset).Limit(size)

	// 排序
	tx = tx.Order("start_time desc")

	// 查询数据
	err := tx.Find(&performances).Error

	return performances, total, err
}

// 根据ID获取演出详情
func GetPerformanceByID(id int) (*Performance, error) {
	var performance Performance
	err := util.DB.Where("id = ?", id).First(&performance).Error
	if err != nil {
		return nil, err
	}
	return &performance, nil
}

// 更新演出信息
func UpdatePerformance(performance *Performance) error {
	performance.UpdatedAt = time.Now()
	return util.DB.Model(&Performance{}).Where("id = ?", performance.ID).Updates(performance).Error
}
