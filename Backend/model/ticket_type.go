package model

import (
	"time"

	"ticket-system-backend/util"
)

// TicketType 票种模型
type TicketType struct {
	ID            int       `gorm:"primary_key;auto_increment" json:"id"`
	PerformanceID int       `gorm:"index" json:"performance_id"`
	Name          string    `gorm:"size:50;not null" json:"name"`
	Price         float64   `gorm:"not null" json:"price"`
	Stock         int       `gorm:"default:0" json:"stock"`
	Total         int       `gorm:"default:0" json:"total"`
	SaleStartTime time.Time `json:"sale_start_time"`
	SaleEndTime   time.Time `json:"sale_end_time"`
	Status        int       `gorm:"default:0" json:"status"` // 0:未开售, 1:预售, 2:在售, 3:售罄, 4:已结束
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// GetTicketTypesByPerformanceID 根据演出ID获取票种列表
func GetTicketTypesByPerformanceID(performanceID int) ([]TicketType, error) {
	var ticketTypes []TicketType
	err := util.DB.Where("performance_id = ?", performanceID).Find(&ticketTypes).Error
	return ticketTypes, err
}

// GetTicketTypeByID 根据ID获取票种
func GetTicketTypeByID(id int) (*TicketType, error) {
	var ticketType TicketType
	err := util.DB.Where("id = ?", id).First(&ticketType).Error
	if err != nil {
		return nil, err
	}
	return &ticketType, nil
}

// DecreaseStock 减少库存
func DecreaseStock(ticketTypeID, quantity int) error {
	return util.DB.Exec("UPDATE ticket_type SET stock = stock - ? WHERE id = ? AND stock >= ?", quantity, ticketTypeID, quantity).Error
}

// IncreaseStock 增加库存
func IncreaseStock(ticketTypeID, quantity int) error {
	return util.DB.Exec("UPDATE ticket_type SET stock = stock + ? WHERE id = ?", quantity, ticketTypeID).Error
}