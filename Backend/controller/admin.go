package controller

import (
	"net/http"
	"strconv"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AdminController struct{}

func (ac *AdminController) Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"real_name" binding:"required"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	existAdmin, _ := model.GetAdminByUsername(req.Username)
	if existAdmin != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "密码加密失败"})
		return
	}

	role := req.Role
	if role == "" {
		role = "admin"
	}

	admin := &model.Admin{
		Username: req.Username,
		Password: string(hashedPassword),
		RealName: req.RealName,
		Email:    req.Email,
		Phone:    req.Phone,
		Role:     role,
		Status:   1,
	}

	if err := model.CreateAdmin(admin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建管理员失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": admin})
}

func (ac *AdminController) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	admin, err := model.GetAdminByUsername(req.Username)
	if err != nil {
		history := &model.AdminLoginHistory{
			AdminID:    0,
			IP:         c.ClientIP(),
			UserAgent:  c.Request.UserAgent(),
			Status:     0,
			FailReason: "登录失败",
		}
		model.CreateLoginHistory(history)

		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		history := &model.AdminLoginHistory{
			AdminID:    admin.ID,
			IP:         c.ClientIP(),
			UserAgent:  c.Request.UserAgent(),
			Status:     0,
			FailReason: "登录失败",
		}
		model.CreateLoginHistory(history)

		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	if admin.Status == 0 {
		c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "账号已被禁用"})
		return
	}

	model.UpdateAdminLoginInfo(admin.ID, c.ClientIP())

	history := &model.AdminLoginHistory{
		AdminID:   admin.ID,
		IP:        c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		Status:    1,
	}
	model.CreateLoginHistory(history)

	token, err := util.GenerateAdminToken(admin.ID, admin.Username, admin.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成token失败"})
		return
	}

	log := &model.AdminLog{
		AdminID:    admin.ID,
		Action:     "login",
		TargetType: "admin",
		TargetID:   admin.ID,
		Detail:     `{"username":"` + admin.Username + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "登录成功",
		"data": gin.H{
			"token": token,
			"admin": gin.H{
				"id":        admin.ID,
				"username":  admin.Username,
				"real_name": admin.RealName,
				"role":      admin.Role,
				"email":     admin.Email,
			},
		},
	})
}

func (ac *AdminController) GetAdminInfo(c *gin.Context) {
	adminID, _ := c.Get("admin_id")

	admin, err := model.GetAdminByID(adminID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "管理员不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"id":         admin.ID,
			"username":   admin.Username,
			"real_name":  admin.RealName,
			"email":      admin.Email,
			"phone":      admin.Phone,
			"role":       admin.Role,
			"status":     admin.Status,
			"created_at": admin.CreatedAt,
		},
	})
}

func (ac *AdminController) GetAdminList(c *gin.Context) {
	keyword := c.Query("keyword")
	role := c.Query("role")
	statusStr := c.Query("status")
	pageStr := c.Query("page")
	sizeStr := c.Query("size")

	query := model.AdminQuery{
		Keyword: keyword,
		Role:    role,
		Status:  -1,
		Page:    1,
		Size:    10,
	}

	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		query.Status = status
	}

	if pageStr != "" {
		page, _ := strconv.Atoi(pageStr)
		query.Page = page
	}

	if sizeStr != "" {
		size, _ := strconv.Atoi(sizeStr)
		query.Size = size
	}

	admins, total, err := model.GetAdmins(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  admins,
			"total": total,
			"page":  query.Page,
			"size":  query.Size,
		},
	})
}

func (ac *AdminController) UpdateAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		RealName string `json:"real_name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
		Status   int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	admin, err := model.GetAdminByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "管理员不存在"})
		return
	}

	if req.RealName != "" {
		admin.RealName = req.RealName
	}
	if req.Email != "" {
		admin.Email = req.Email
	}
	if req.Phone != "" {
		admin.Phone = req.Phone
	}
	if req.Role != "" {
		admin.Role = req.Role
	}
	if req.Status >= 0 {
		admin.Status = req.Status
	}

	if err := model.UpdateAdmin(admin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	log := &model.AdminLog{
		AdminID:    admin.ID,
		Action:     "update_admin",
		TargetType: "admin",
		TargetID:   admin.ID,
		Detail:     `{"updated_id":` + idStr + `}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (ac *AdminController) ChangePassword(c *gin.Context) {
	adminID, _ := c.Get("admin_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8,max=20"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if valid, msg := util.ValidatePasswordStrength(req.NewPassword); !valid {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": msg})
		return
	}

	admin, err := model.GetAdminByID(adminID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "管理员不存在"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "密码加密失败"})
		return
	}

	admin.Password = string(hashedPassword)
	if err := model.UpdateAdmin(admin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "修改密码失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "修改成功"})
}

func (ac *AdminController) GetAdminLogs(c *gin.Context) {
	adminIDStr := c.Query("admin_id")
	action := c.Query("action")
	keyword := c.Query("keyword")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	pageStr := c.Query("page")
	sizeStr := c.Query("size")

	query := model.AdminLogQuery{
		Page: 1,
		Size: 20,
	}

	if adminIDStr != "" {
		adminID, _ := strconv.Atoi(adminIDStr)
		query.AdminID = adminID
	}

	if action != "" {
		query.Action = action
	}

	if keyword != "" {
		query.Keyword = keyword
	}

	if startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			query.StartDate = startDate
		}
	}

	if endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			query.EndDate = endDate.Add(24*time.Hour - time.Second)
		}
	}

	if pageStr != "" {
		page, _ := strconv.Atoi(pageStr)
		query.Page = page
	}

	if sizeStr != "" {
		size, _ := strconv.Atoi(sizeStr)
		query.Size = size
	}

	logs, total, err := model.GetAdminLogs(0, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取日志失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  logs,
			"total": total,
			"page":  query.Page,
			"size":  query.Size,
		},
	})
}

func (ac *AdminController) GetDashboardStats(c *gin.Context) {
	stats, err := model.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取统计数据失败"})
		return
	}

	salesData, err := model.GetSalesData(7)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取销售数据失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"stats":      stats,
			"sales_data": salesData,
		},
	})
}

func (ac *AdminController) GetCategoryDistribution(c *gin.Context) {
	distributionType := c.Query("type")
	if distributionType == "" {
		distributionType = "category"
	}

	data, err := model.GetCategoryDistribution(distributionType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取分布数据失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": data,
	})
}
