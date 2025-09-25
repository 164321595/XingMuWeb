package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"ticket-system-backend/model"
	"ticket-system-backend/util"
)

// OrderController 订单控制器
type OrderController struct {}

// CreateOrderFromSeckill 从抢票结果创建订单
func (oc *OrderController) CreateOrderFromSeckill(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		OrderId int `json:"orderId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 查询订单
	order, err := model.GetOrderByID(request.OrderId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	// 检查订单所属权
	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	// 检查订单是否已过期
	if time.Now().After(order.ExpireTime) {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderExpired, "订单已过期"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(order))
}

// GetUserOrders 获取用户订单列表
func (oc *OrderController) GetUserOrders(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 获取查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	
	// 获取status参数，不设置默认值，当参数不存在时为-1
	statusStr := c.Query("status")
	status := -1 // -1表示获取所有状态的订单
	if statusStr != "" {
		status, _ = strconv.Atoi(statusStr)
	}

	// 构建查询条件
	query := model.OrderQuery{
		UserID: userID.(int),
		Status: status,
		Page:   page,
		Size:   pageSize,
	}

	// 查询订单列表
	orders, total, err := model.GetUserOrders(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 构造响应数据
	response := map[string]interface{}{
		"list":     orders,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// GetOrderDetail 获取订单详情
func (oc *OrderController) GetOrderDetail(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 获取订单ID
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	// 查询订单详情
	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	// 检查订单所属权
	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(order))
}

// CancelOrder 取消订单
func (oc *OrderController) CancelOrder(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 获取订单ID
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	// 查询订单
	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	// 检查订单所属权
	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	// 检查订单状态
	if order.Status != 0 { // 只有待支付状态可以取消
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderStatusError, "订单状态错误，无法取消"))
		return
	}

	// 更新订单状态
	if err := model.UpdateOrderStatus(order.ID, 2); err != nil { // 2:已取消
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 恢复库存
	model.IncreaseStock(order.TicketTypeID, order.Quantity)

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

// PayOrder 支付订单
func (oc *OrderController) PayOrder(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 获取订单ID
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	// 查询订单
	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	// 检查订单所属权
	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	// 检查订单是否已过期
	if time.Now().After(order.ExpireTime) {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderExpired, "订单已过期"))
		return
	}

	// 检查订单状态
	if order.Status != 0 { // 只有待支付状态可以支付
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderStatusError, "订单状态错误，无法支付"))
		return
	}

	// 模拟支付过程
	// 使用model中的PayOrder函数来更新订单状态和支付时间
	if err := model.PayOrder(order.ID); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 查询支付后的订单信息
	updatedOrder, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 查询票种信息以验证票种是否存在
	ticketType, err := model.GetTicketTypeByID(order.TicketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}
	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}
	// 使用ticketType变量
	_ = ticketType

	// 模拟生成电子票信息
	// 由于没有Ticket类型，我们创建一个自定义结构体
	type TicketInfo struct {
		TicketNo     string    `json:"ticket_no"`
		Status       int       `json:"status"`
		CreatedAt    time.Time `json:"created_at"`
	}
	tickets := []TicketInfo{}
	if updatedOrder.PaymentTime != nil {
		for i := 0; i < order.Quantity; i++ {
			tickets = append(tickets, TicketInfo{
				TicketNo:     "TICKET" + strconv.Itoa(order.ID) + strconv.Itoa(i+1),
				Status:       0, // 有效
				CreatedAt:    *updatedOrder.PaymentTime,
			})
		}
	}

	// 返回支付结果和电子票信息
	response := struct {
		PaymentTime string      `json:"payment_time"`
		Tickets     []TicketInfo `json:"tickets"`
	}{updatedOrder.PaymentTime.Format(time.RFC3339), tickets}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// GenerateOrderNo 生成订单号（实际项目中可能需要更复杂的生成规则）
func GenerateOrderNo() string {
	return time.Now().Format("20060102150405") + strconv.FormatInt(time.Now().UnixNano()%1000000, 10)
}

// RefundOrder 申请退款
func (oc *OrderController) RefundOrder(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 获取订单ID
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	// 查询订单
	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	// 检查订单所属权
	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	// 检查订单状态
	if order.Status != 1 { // 只有已支付状态可以申请退款
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderStatusError, "订单状态错误，无法申请退款"))
		return
	}

	// 更新订单状态为已退款（这里我们使用3表示已退款）
	if err := model.UpdateOrderStatus(order.ID, 3); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 模拟退款处理
	// 在实际项目中，这里应该调用支付平台的退款API

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}