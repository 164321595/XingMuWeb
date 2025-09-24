package model

import (
	"time"

	"ticket-system-backend/util"
)

// Order 订单模型
type Order struct {
	ID            int        `gorm:"primary_key" json:"id"`
	OrderNo       string     `gorm:"size:50;not null;unique_index" json:"order_no"`
	UserID        int        `gorm:"not null" json:"user_id"`
	PerformanceID int        `gorm:"not null" json:"performance_id"`
	TicketTypeID  int        `gorm:"not null" json:"ticket_type_id"`
	Quantity      int        `gorm:"not null" json:"quantity"`
	Amount        float64    `gorm:"type:decimal(10,2);not null" json:"amount"`
	Status        int        `gorm:"type:tinyint;not null" json:"status"` // 0:待支付,1:已支付,2:已取消
	ExpireTime    time.Time  `json:"expire_time"`
	PaymentTime   *time.Time `json:"payment_time,omitempty"` // 改为指针类型，可存储NULL
	CreatedAt     time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`

	// 关联数据，不直接映射到数据库
	Performance *Performance `gorm:"foreignkey:PerformanceID" json:"performance,omitempty"`
	TicketType  *TicketType  `gorm:"foreignkey:TicketTypeID" json:"ticket_type,omitempty"`
}

// OrderQuery 订单查询条件
type OrderQuery struct {
	UserID     int
	Status     int
	Page       int
	Size       int
}

// 创建订单
func CreateOrder(order *Order) error {
	return util.DB.Create(order).Error
}

// 获取用户订单列表
func GetUserOrders(query OrderQuery) ([]*Order, int, error) {
	var orders []*Order
	var total int

	tx := util.DB.Model(&Order{}).Where("user_id = ?", query.UserID)

	// 按状态筛选
	if query.Status >= 0 {
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
	tx = tx.Order("created_at desc")

	// 查询数据并预加载关联信息
	err := tx.Preload("Performance").Preload("TicketType").Find(&orders).Error

	return orders, total, err
}

// 根据ID获取订单详情
func GetOrderByID(id int) (*Order, error) {
	var order Order
	err := util.DB.Where("id = ?", id).Preload("Performance").Preload("TicketType").First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

// 根据订单号获取订单
func GetOrderByOrderNo(orderNo string) (*Order, error) {
	var order Order
	err := util.DB.Where("order_no = ?", orderNo).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

// 更新订单状态
func UpdateOrderStatus(orderID int, status int) error {
	return util.DB.Model(&Order{}).Where("id = ?", orderID).Update("status", status).Error
}

// 支付订单
func PayOrder(orderID int) error {
	now := time.Now()
	return util.DB.Model(&Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
		"status":       1,
		"payment_time": &now,
	}).Error
}