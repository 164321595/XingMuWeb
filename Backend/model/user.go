package model

import (
	"time"

	"ticket-system-backend/util"
)

// User 用户模型
type User struct {
	ID        int       `gorm:"primary_key;auto_increment" json:"id"`
	Username  string    `gorm:"size:50;not null;unique" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"password"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Email     string    `gorm:"size:100" json:"email"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	Status    int       `gorm:"default:1" json:"status"` // 1: 正常, 2: 禁用
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "user"
}

// CreateUser 创建用户
func CreateUser(user *User) error {
	return util.DB.Create(user).Error
}

// GetUserByUsername 根据用户名获取用户
func GetUserByUsername(username string) (*User, error) {
	var user User
	err := util.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByID 根据ID获取用户
func GetUserByID(id int) (*User, error) {
	var user User
	err := util.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser 更新用户信息
func UpdateUser(user *User) error {
	return util.DB.Model(user).Updates(user).Error
}

// DeleteUser 删除用户
func DeleteUser(id int) error {
	return util.DB.Delete(&User{}, "id = ?", id).Error
}

// GetUsers 获取用户列表
func GetUsers(query UserQuery) ([]*User, int, error) {
	var users []*User
	var total int

	tx := util.DB.Model(&User{})

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		tx = tx.Where("username LIKE ? OR phone LIKE ? OR email LIKE ?", keyword, keyword, keyword)
	}

	if query.Status >= 0 {
		tx = tx.Where("status = ?", query.Status)
	}

	tx.Count(&total)

	page := query.Page
	if page < 1 {
		page = 1
	}
	size := query.Size
	if size < 1 {
		size = 10
	}
	offset := (page - 1) * size

	err := tx.Offset(offset).Limit(size).Order("created_at desc").Find(&users).Error

	return users, total, err
}

// HasActiveOrders 检查用户是否有活跃订单
func HasActiveOrders(userID int) bool {
	var count int
	util.DB.Model(&Order{}).Where("user_id = ? AND status IN (0, 1)", userID).Count(&count)
	return count > 0
}

// UserQuery 用户查询条件
type UserQuery struct {
	Keyword string
	Status  int
	Page    int
	Size    int
}

// OrderAdminQuery 后台订单查询条件
type OrderAdminQuery struct {
	Keyword   string
	Status    int
	StartDate time.Time
	EndDate   time.Time
	Page      int
	Size      int
}

// GetOrdersForAdmin 获取后台订单列表
func GetOrdersForAdmin(query OrderAdminQuery) ([]*Order, int, error) {
	var orders []*Order
	var total int

	tx := util.DB.Model(&Order{})

	if query.Status >= 0 {
		tx = tx.Where("status = ?", query.Status)
	}

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		tx = tx.Joins("JOIN user ON order.user_id = user.id").
			Joins("JOIN performance ON order.performance_id = performance.id").
			Where("order.order_no LIKE ? OR user.username LIKE ? OR performance.title LIKE ?", keyword, keyword, keyword)
	}

	if !query.StartDate.IsZero() {
		tx = tx.Where("order.created_at >= ?", query.StartDate)
	}

	if !query.EndDate.IsZero() {
		tx = tx.Where("order.created_at <= ?", query.EndDate)
	}

	tx.Count(&total)

	page := query.Page
	if page < 1 {
		page = 1
	}
	size := query.Size
	if size < 1 {
		size = 10
	}
	offset := (page - 1) * size

	err := tx.Preload("Performance").Preload("TicketType").
		Offset(offset).Limit(size).Order("order.created_at desc").
		Find(&orders).Error

	return orders, total, err
}

// HasPerformanceOrders 检查演出是否有订单
func HasPerformanceOrders(performanceID int) bool {
	var count int
	util.DB.Model(&Order{}).Where("performance_id = ?", performanceID).Count(&count)
	return count > 0
}

// HasTicketTypeOrders 检查票种是否有订单
func HasTicketTypeOrders(ticketTypeID int) bool {
	var count int
	util.DB.Model(&Order{}).Where("ticket_type_id = ?", ticketTypeID).Count(&count)
	return count > 0
}

// RefundOrder 退款订单
func RefundOrder(orderID int) error {
	return util.DB.Model(&Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
		"status":     2,
		"updated_at": time.Now(),
	}).Error
}

// CreatePerformance 创建演出
func CreatePerformance(performance *Performance) error {
	return util.DB.Create(performance).Error
}

// DeletePerformance 删除演出
func DeletePerformance(id int) error {
	return util.DB.Delete(&Performance{}, "id = ?", id).Error
}