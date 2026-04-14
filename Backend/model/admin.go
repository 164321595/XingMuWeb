package model

import (
	"time"

	"ticket-system-backend/util"
)

type Admin struct {
	ID          int        `gorm:"primary_key;auto_increment" json:"id"`
	Username    string     `gorm:"size:50;not null;unique" json:"username"`
	Password    string     `gorm:"size:255;not null" json:"-"`
	RealName    string     `gorm:"size:50;not null" json:"real_name"`
	Email       string     `gorm:"size:100" json:"email"`
	Phone       string     `gorm:"size:20" json:"phone"`
	Role        string     `gorm:"size:20;not null;default:'admin'" json:"role"`
	Status      int        `gorm:"default:1" json:"status"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	LastLoginIP string     `gorm:"size:50" json:"last_login_ip,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (Admin) TableName() string {
	return "admin"
}

type AdminLog struct {
	ID         int64     `gorm:"primary_key;auto_increment" json:"id"`
	AdminID    int       `gorm:"not null" json:"admin_id"`
	Action     string    `gorm:"size:50;not null" json:"action"`
	TargetType string    `gorm:"size:50" json:"target_type,omitempty"`
	TargetID   int       `gorm:"size:11" json:"target_id,omitempty"`
	Detail     string    `gorm:"type:text" json:"detail,omitempty"`
	IP         string    `gorm:"size:50" json:"ip,omitempty"`
	UserAgent  string    `gorm:"size:255" json:"user_agent,omitempty"`
	CreatedAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (AdminLog) TableName() string {
	return "admin_log"
}

type AdminLoginHistory struct {
	ID         int64     `gorm:"primary_key;auto_increment" json:"id"`
	AdminID    int       `gorm:"not null" json:"admin_id"`
	IP         string    `gorm:"size:50" json:"ip"`
	UserAgent  string    `gorm:"size:255" json:"user_agent"`
	Status     int       `gorm:"default:1" json:"status"`
	FailReason string    `gorm:"size:100" json:"fail_reason,omitempty"`
	CreatedAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (AdminLoginHistory) TableName() string {
	return "admin_login_history"
}

type AdminQuery struct {
	Keyword string
	Role    string
	Status  int
	Page    int
	Size    int
}

func GetAdmins(query AdminQuery) ([]*Admin, int, error) {
	var admins []*Admin
	var total int

	tx := util.DB.Model(&Admin{})

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		tx = tx.Where("username LIKE ? OR real_name LIKE ? OR email LIKE ?", keyword, keyword, keyword)
	}

	if query.Role != "" {
		tx = tx.Where("role = ?", query.Role)
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

	err := tx.Offset(offset).Limit(size).Order("created_at desc").Find(&admins).Error

	return admins, total, err
}

func GetAdminByID(id int) (*Admin, error) {
	var admin Admin
	err := util.DB.Where("id = ?", id).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func GetAdminByUsername(username string) (*Admin, error) {
	var admin Admin
	err := util.DB.Where("username = ?", username).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func CreateAdmin(admin *Admin) error {
	return util.DB.Create(admin).Error
}

func UpdateAdmin(admin *Admin) error {
	return util.DB.Model(admin).Updates(admin).Error
}

func UpdateAdminLoginInfo(adminID int, ip string) error {
	now := time.Now()
	return util.DB.Model(&Admin{}).Where("id = ?", adminID).Updates(map[string]interface{}{
		"last_login_at": now,
		"last_login_ip": ip,
	}).Error
}

func GetAdminLogs(adminID int, query AdminLogQuery) ([]*AdminLog, int, error) {
	var logs []*AdminLog
	var total int

	tx := util.DB.Model(&AdminLog{})

	if adminID > 0 {
		tx = tx.Where("admin_id = ?", adminID)
	}

	if query.Action != "" {
		tx = tx.Where("action = ?", query.Action)
	}

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		tx = tx.Where("detail LIKE ?", keyword)
	}

	if !query.StartDate.IsZero() {
		tx = tx.Where("created_at >= ?", query.StartDate)
	}

	if !query.EndDate.IsZero() {
		tx = tx.Where("created_at <= ?", query.EndDate)
	}

	tx.Count(&total)

	page := query.Page
	if page < 1 {
		page = 1
	}
	size := query.Size
	if size < 1 {
		size = 20
	}
	offset := (page - 1) * size

	err := tx.Offset(offset).Limit(size).Order("created_at desc").Find(&logs).Error

	return logs, total, err
}

type AdminLogQuery struct {
	AdminID   int
	Action    string
	Keyword   string
	StartDate time.Time
	EndDate   time.Time
	Page      int
	Size      int
}

func CreateAdminLog(log *AdminLog) error {
	return util.DB.Create(log).Error
}

func CreateLoginHistory(history *AdminLoginHistory) error {
	return util.DB.Create(history).Error
}

type DashboardStats struct {
	TodayOrders        int64   `json:"today_orders"`
	TodayRevenue       float64 `json:"today_revenue"`
	PendingOrders      int64   `json:"pending_orders"`
	ActivePerformances int64   `json:"active_performances"`
	TotalUsers         int64   `json:"total_users"`
	WeekOrders         int64   `json:"week_orders"`
	WeekRevenue        float64 `json:"week_revenue"`
}

func GetDashboardStats() (*DashboardStats, error) {
	var stats DashboardStats

	util.DB.Model(&Order{}).Where("DATE(created_at) = CURDATE() AND status = 1").Count(&stats.TodayOrders)
	util.DB.Model(&Order{}).Where("status = 0").Count(&stats.PendingOrders)
	util.DB.Model(&Performance{}).Where("status IN (1, 2)").Count(&stats.ActivePerformances)
	util.DB.Model(&User{}).Count(&stats.TotalUsers)
	util.DB.Model(&Order{}).Where("created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 1").Count(&stats.WeekOrders)

	row1 := util.DB.Raw("SELECT COALESCE(SUM(amount), 0) FROM `order` WHERE DATE(created_at) = CURDATE() AND status = 1").Row()
	row1.Scan(&stats.TodayRevenue)

	row2 := util.DB.Raw("SELECT COALESCE(SUM(amount), 0) FROM `order` WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 1").Row()
	row2.Scan(&stats.WeekRevenue)

	return &stats, nil
}

type SalesData struct {
	Date    string  `json:"date"`
	Orders  int     `json:"orders"`
	Revenue float64 `json:"revenue"`
	Tickets int     `json:"tickets"`
}

func GetSalesData(days int) ([]*SalesData, error) {
	var data []*SalesData

	query := `
		SELECT
			DATE(o.created_at) AS date,
			COUNT(*) AS orders,
			SUM(CASE WHEN o.status = 1 THEN o.amount ELSE 0 END) AS revenue,
			SUM(CASE WHEN o.status = 1 THEN o.quantity ELSE 0 END) AS tickets
		FROM ` + "`order`" + ` o
		WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
		GROUP BY DATE(o.created_at)
		ORDER BY date ASC
	`

	err := util.DB.Raw(query, days).Scan(&data).Error
	if err != nil {
		return nil, err
	}

	return data, nil
}

type CategoryDistribution struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

func GetCategoryDistribution(distributionType string) ([]*CategoryDistribution, error) {
	var results []*CategoryDistribution

	if distributionType == "ticket" {
		rows, err := util.DB.Table("ticket_type").
			Select("ticket_type.performance_id, COUNT(*) as cnt").
			Joins("INNER JOIN performance ON ticket_type.performance_id = performance.id").
			Where("ticket_type.status = 1").
			Group("ticket_type.performance_id").
			Rows()

		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var performanceID int
			var count int
			if err := rows.Scan(&performanceID, &count); err != nil {
				continue
			}

			name := "未知演出"
			if performanceID > 0 {
				var perf Performance
				if err := util.DB.First(&perf, performanceID).Error; err == nil {
					name = perf.Title
					if len(name) > 15 {
						name = name[:15] + "..."
					}
				}
			}

			results = append(results, &CategoryDistribution{
				Name:  name,
				Value: count,
			})
		}
	} else {
		rows, err := util.DB.Table("performance").
			Select("category_id, COUNT(*) as cnt").
			Where("status IN (1, 2)").
			Group("category_id").
			Rows()

		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var categoryID int
			var count int
			if err := rows.Scan(&categoryID, &count); err != nil {
				continue
			}

			name := "未分类"
			if categoryID > 0 {
				var cat Category
				if err := util.DB.First(&cat, categoryID).Error; err == nil {
					name = cat.Name
				}
			}

			results = append(results, &CategoryDistribution{
				Name:  name,
				Value: count,
			})
		}
	}

	if len(results) == 0 {
		results = []*CategoryDistribution{
			{Name: "暂无数据", Value: 0},
		}
	}

	return results, nil
}
