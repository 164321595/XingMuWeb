package controller

import (
	"net/http"
	"strconv"
	"time"

	"ticket-system-backend/model"

	"github.com/gin-gonic/gin"
)

type AdminUserController struct{}

func (uc *AdminUserController) GetUserList(c *gin.Context) {
	keyword := c.Query("keyword")
	statusStr := c.Query("status")
	pageStr := c.Query("page")
	sizeStr := c.Query("size")

	query := model.UserQuery{
		Keyword: keyword,
		Status:  -1,
		Page:    1,
		Size:    10,
	}

	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		if status >= 0 {
			query.Status = status
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

	users, total, err := model.GetUsers(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取用户列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  users,
			"total": total,
			"page":  query.Page,
			"size":  query.Size,
		},
	})
}

func (uc *AdminUserController) GetUserDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	user, err := model.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	orders, _, err := model.GetUserOrders(model.OrderQuery{UserID: id, Page: 1, Size: 10})
	if err != nil {
		orders = []*model.Order{}
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"user":   user,
			"orders": orders,
		},
	})
}

func (uc *AdminUserController) UpdateUserStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		Status int `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	user, err := model.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	user.Status = req.Status
	if err := model.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "update_user_status",
		TargetType: "user",
		TargetID:   id,
		Detail:     `{"username":"` + user.Username + `","status":` + strconv.Itoa(req.Status) + `}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (uc *AdminUserController) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	user, err := model.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	hasActiveOrders := model.HasActiveOrders(id)
	if hasActiveOrders {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "该用户存在未完成的订单，无法删除"})
		return
	}

	if err := model.DeleteUser(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "delete_user",
		TargetType: "user",
		TargetID:   id,
		Detail:     `{"username":"` + user.Username + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

type AdminOrderController struct{}

func (oc *AdminOrderController) GetOrderList(c *gin.Context) {
	statusStr := c.Query("status")
	keyword := c.Query("keyword")
	pageStr := c.Query("page")
	sizeStr := c.Query("size")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := model.OrderAdminQuery{
		Status: -1,
		Page:   1,
		Size:   10,
	}

	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		if status >= 0 {
			query.Status = status
		}
	}

	if keyword != "" {
		query.Keyword = keyword
	}

	if pageStr != "" {
		page, _ := strconv.Atoi(pageStr)
		query.Page = page
	}

	if sizeStr != "" {
		size, _ := strconv.Atoi(sizeStr)
		query.Size = size
	}

	if startDate != "" {
		if t, err := time.Parse("2006-01-02", startDate); err == nil {
			query.StartDate = t
		}
	}

	if endDate != "" {
		if t, err := time.Parse("2006-01-02", endDate); err == nil {
			query.EndDate = t.Add(24*time.Hour - time.Second)
		}
	}

	orders, total, err := model.GetOrdersForAdmin(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取订单列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  orders,
			"total": total,
			"page":  query.Page,
			"size":  query.Size,
		},
	})
}

func (oc *AdminOrderController) GetOrderDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": order,
	})
}

func (oc *AdminOrderController) ProcessRefund(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		Reason string `json:"reason"`
	}

	c.ShouldBindJSON(&req)

	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	if order.Status != 1 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "只能退款已支付的订单"})
		return
	}

	if err := model.RefundOrder(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "退款处理失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "order_refund",
		TargetType: "order",
		TargetID:   id,
		Detail:     `{"order_no":"` + order.OrderNo + `","reason":"` + req.Reason + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "退款处理成功"})
}

func (oc *AdminOrderController) ExportOrders(c *gin.Context) {
	statusStr := c.Query("status")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := model.OrderAdminQuery{
		Status: -1,
		Page:   1,
		Size:   10000,
	}

	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		if status >= 0 {
			query.Status = status
		}
	}

	if startDate != "" {
		if t, err := time.Parse("2006-01-02", startDate); err == nil {
			query.StartDate = t
		}
	}

	if endDate != "" {
		if t, err := time.Parse("2006-01-02", endDate); err == nil {
			query.EndDate = t.Add(24*time.Hour - time.Second)
		}
	}

	orders, _, err := model.GetOrdersForAdmin(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "导出失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": orders,
	})
}

type AdminPerformanceController struct{}

func (pc *AdminPerformanceController) GetPerformanceList(c *gin.Context) {
	categoryIDStr := c.Query("category_id")
	statusStr := c.Query("status")
	keyword := c.Query("keyword")
	pageStr := c.Query("page")
	sizeStr := c.Query("size")

	query := model.PerformanceQuery{
		Page: 1,
		Size: 10,
	}

	if categoryIDStr != "" {
		categoryID, _ := strconv.Atoi(categoryIDStr)
		query.CategoryID = categoryID
	}

	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		if status >= 0 {
			query.Status = status
		}
	}

	if keyword != "" {
		query.Keyword = keyword
	}

	if pageStr != "" {
		page, _ := strconv.Atoi(pageStr)
		query.Page = page
	}

	if sizeStr != "" {
		size, _ := strconv.Atoi(sizeStr)
		query.Size = size
	}

	performances, total, err := model.GetPerformances(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  performances,
			"total": total,
			"page":  query.Page,
			"size":  query.Size,
		},
	})
}

func (pc *AdminPerformanceController) GetPerformanceDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	performance, err := model.GetPerformanceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "演出不存在"})
		return
	}

	ticketTypes, err := model.GetTicketTypesByPerformanceID(id)
	if err != nil {
		ticketTypes = []model.TicketType{}
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"performance":  performance,
			"ticket_types": ticketTypes,
		},
	})
}

func (pc *AdminPerformanceController) CreatePerformance(c *gin.Context) {
	var req struct {
		Title       string `json:"title" binding:"required"`
		CategoryID  int    `json:"category_id" binding:"required"`
		CoverImage  string `json:"cover_image"`
		Description string `json:"description"`
		Performer   string `json:"performer" binding:"required"`
		Venue       string `json:"venue" binding:"required"`
		StartTime   string `json:"start_time" binding:"required"`
		EndTime     string `json:"end_time" binding:"required"`
		Status      int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	startTime, _ := time.Parse("2006-01-02 15:04:05", req.StartTime)
	endTime, _ := time.Parse("2006-01-02 15:04:05", req.EndTime)

	status := req.Status
	if status == 0 {
		status = 0
	}

	performance := &model.Performance{
		Title:       req.Title,
		CategoryID:  req.CategoryID,
		CoverImage:  req.CoverImage,
		Description: req.Description,
		Performer:   req.Performer,
		Venue:       req.Venue,
		StartTime:   startTime,
		EndTime:     endTime,
		Status:      status,
	}

	if err := model.CreatePerformance(performance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "create_performance",
		TargetType: "performance",
		TargetID:   performance.ID,
		Detail:     `{"title":"` + req.Title + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": performance})
}

func (pc *AdminPerformanceController) UpdatePerformance(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		Title       string `json:"title"`
		CategoryID  int    `json:"category_id"`
		CoverImage  string `json:"cover_image"`
		Description string `json:"description"`
		Performer   string `json:"performer"`
		Venue       string `json:"venue"`
		StartTime   string `json:"start_time"`
		EndTime     string `json:"end_time"`
		Status      int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	performance, err := model.GetPerformanceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "演出不存在"})
		return
	}

	if req.Title != "" {
		performance.Title = req.Title
	}
	if req.CategoryID > 0 {
		performance.CategoryID = req.CategoryID
	}
	if req.CoverImage != "" {
		performance.CoverImage = req.CoverImage
	}
	if req.Description != "" {
		performance.Description = req.Description
	}
	if req.Performer != "" {
		performance.Performer = req.Performer
	}
	if req.Venue != "" {
		performance.Venue = req.Venue
	}
	if req.StartTime != "" {
		startTime, _ := time.Parse("2006-01-02 15:04:05", req.StartTime)
		performance.StartTime = startTime
	}
	if req.EndTime != "" {
		endTime, _ := time.Parse("2006-01-02 15:04:05", req.EndTime)
		performance.EndTime = endTime
	}
	if req.Status >= 0 {
		performance.Status = req.Status
	}

	if err := model.UpdatePerformance(performance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "update_performance",
		TargetType: "performance",
		TargetID:   id,
		Detail:     `{"title":"` + performance.Title + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (pc *AdminPerformanceController) DeletePerformance(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	performance, err := model.GetPerformanceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "演出不存在"})
		return
	}

	hasOrders := model.HasPerformanceOrders(id)
	if hasOrders {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "该演出存在订单记录，无法删除"})
		return
	}

	if err := model.DeletePerformance(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "delete_performance",
		TargetType: "performance",
		TargetID:   id,
		Detail:     `{"title":"` + performance.Title + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

type AdminTicketTypeController struct{}

func (ttc *AdminTicketTypeController) GetTicketTypeList(c *gin.Context) {
	performanceIDStr := c.Query("performance_id")

	var ticketTypes []model.TicketType
	var err error

	if performanceIDStr != "" {
		performanceID, _ := strconv.Atoi(performanceIDStr)
		ticketTypes, err = model.GetTicketTypesByPerformanceID(performanceID)
	} else {
		ticketTypes, _, err = model.GetAllTicketTypes(1, 100)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": ticketTypes,
	})
}

func (ttc *AdminTicketTypeController) CreateTicketType(c *gin.Context) {
	var req struct {
		PerformanceID int     `json:"performance_id" binding:"required"`
		Name          string  `json:"name" binding:"required"`
		Price         float64 `json:"price" binding:"required"`
		Stock         int     `json:"stock" binding:"required"`
		SaleStartTime string  `json:"sale_start_time" binding:"required"`
		SaleEndTime   string  `json:"sale_end_time" binding:"required"`
		Status        int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	saleStartTime, _ := time.Parse("2006-01-02 15:04:05", req.SaleStartTime)
	saleEndTime, _ := time.Parse("2006-01-02 15:04:05", req.SaleEndTime)

	ticketType := &model.TicketType{
		PerformanceID: req.PerformanceID,
		Name:          req.Name,
		Price:         req.Price,
		Stock:         req.Stock,
		SaleStartTime: saleStartTime,
		SaleEndTime:   saleEndTime,
		Status:        req.Status,
	}

	if err := model.CreateTicketType(ticketType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "create_ticket_type",
		TargetType: "ticket_type",
		TargetID:   ticketType.ID,
		Detail:     `{"name":"` + req.Name + `","performance_id":` + strconv.Itoa(req.PerformanceID) + `}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": ticketType})
}

func (ttc *AdminTicketTypeController) UpdateTicketType(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		Name          string  `json:"name"`
		Price         float64 `json:"price"`
		Stock         int     `json:"stock"`
		SaleStartTime string  `json:"sale_start_time"`
		SaleEndTime   string  `json:"sale_end_time"`
		Status        int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	ticketType, err := model.GetTicketTypeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "票种不存在"})
		return
	}

	if req.Name != "" {
		ticketType.Name = req.Name
	}
	if req.Price > 0 {
		ticketType.Price = req.Price
	}
	if req.Stock >= 0 {
		ticketType.Stock = req.Stock
	}
	if req.SaleStartTime != "" {
		saleStartTime, _ := time.Parse("2006-01-02 15:04:05", req.SaleStartTime)
		ticketType.SaleStartTime = saleStartTime
	}
	if req.SaleEndTime != "" {
		saleEndTime, _ := time.Parse("2006-01-02 15:04:05", req.SaleEndTime)
		ticketType.SaleEndTime = saleEndTime
	}
	if req.Status >= 0 {
		ticketType.Status = req.Status
	}

	if err := model.UpdateTicketType(ticketType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "update_ticket_type",
		TargetType: "ticket_type",
		TargetID:   id,
		Detail:     `{"name":"` + ticketType.Name + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (ttc *AdminTicketTypeController) DeleteTicketType(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	ticketType, err := model.GetTicketTypeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "票种不存在"})
		return
	}

	hasOrders := model.HasTicketTypeOrders(id)
	if hasOrders {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "该票种存在订单记录，无法删除"})
		return
	}

	if err := model.DeleteTicketType(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "delete_ticket_type",
		TargetType: "ticket_type",
		TargetID:   id,
		Detail:     `{"name":"` + ticketType.Name + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func (ttc *AdminTicketTypeController) UpdateTicketStock(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		Stock int `json:"stock" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if req.Stock < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "库存不能为负数"})
		return
	}

	ticketType, err := model.GetTicketTypeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "票种不存在"})
		return
	}

	oldStock := ticketType.Stock
	ticketType.Stock = req.Stock

	if err := model.UpdateTicketType(ticketType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新库存失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "update_ticket_stock",
		TargetType: "ticket_type",
		TargetID:   id,
		Detail:     `{"name":"` + ticketType.Name + `","old_stock":` + strconv.Itoa(oldStock) + `,"new_stock":` + strconv.Itoa(req.Stock) + `}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新库存成功", "data": gin.H{
		"id":         ticketType.ID,
		"name":      ticketType.Name,
		"old_stock": oldStock,
		"new_stock": req.Stock,
	}})
}

type AdminCategoryController struct{}

func (cc *AdminCategoryController) GetCategoryList(c *gin.Context) {
	categories, err := model.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取分类列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": categories,
	})
}

func (cc *AdminCategoryController) CreateCategory(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		ParentID int    `json:"parent_id"`
		Sort     int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	category := &model.Category{
		Name:     req.Name,
		ParentID: req.ParentID,
		Sort:     req.Sort,
	}

	if err := model.CreateCategory(category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": category})
}

func (cc *AdminCategoryController) UpdateCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req struct {
		Name string `json:"name"`
		Sort int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	category, err := model.GetCategoryByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "分类不存在"})
		return
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Sort >= 0 {
		category.Sort = req.Sort
	}

	if err := model.UpdateCategory(category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (cc *AdminCategoryController) DeleteCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	category, err := model.GetCategoryByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "分类不存在"})
		return
	}

	hasPerformances := model.HasCategoryPerformances(id)
	if hasPerformances {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "该分类下存在演出，无法删除"})
		return
	}

	if err := model.DeleteCategory(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "delete_category",
		TargetType: "category",
		TargetID:   id,
		Detail:     `{"name":"` + category.Name + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

type AdminSystemController struct{}

func (sc *AdminSystemController) GetConfig(c *gin.Context) {
	configs, err := model.GetAllSystemConfigs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取配置失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": configs,
	})
}

func (sc *AdminSystemController) UpdateConfig(c *gin.Context) {
	var req struct {
		Key   string `json:"key" binding:"required"`
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := model.UpdateSystemConfig(req.Key, req.Value); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	adminID, _ := c.Get("admin_id")
	log := &model.AdminLog{
		AdminID:    adminID.(int),
		Action:     "update_system_config",
		TargetType: "system_config",
		Detail:     `{"key":"` + req.Key + `","value":"` + req.Value + `"}`,
		IP:         c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}
	model.CreateAdminLog(log)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}
