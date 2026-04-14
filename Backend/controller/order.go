package controller

import (
	"net/http"
	"strconv"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
)

type OrderController struct{}

func (oc *OrderController) CreateOrderFromSeckill(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		OrderId int `json:"orderId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	order, err := model.GetOrderByID(request.OrderId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取订单信息失败"))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	if time.Now().After(order.ExpireTime) {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderExpired, "订单已过期"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(order))
}

func (oc *OrderController) GetUserOrders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	statusStr := c.Query("status")
	status := -1
	if statusStr != "" {
		status, _ = strconv.Atoi(statusStr)
	}

	query := model.OrderQuery{
		UserID: userID.(int),
		Status: status,
		Page:   page,
		Size:   pageSize,
	}

	orders, total, err := model.GetUserOrders(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "查询订单列表失败"))
		return
	}

	response := map[string]interface{}{
		"list":     orders,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func (oc *OrderController) GetOrderDetail(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取订单详情失败"))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(order))
}

func (oc *OrderController) CancelOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取订单信息失败"))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	if order.Status != 0 {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderStatusError, "订单状态错误，无法取消"))
		return
	}

	if err := model.UpdateOrderStatus(order.ID, 2); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "取消订单失败"))
		return
	}

	model.IncreaseStock(order.TicketTypeID, order.Quantity)

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

func (oc *OrderController) PayOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取订单信息失败"))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	if time.Now().After(order.ExpireTime) {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderExpired, "订单已过期"))
		return
	}

	if order.Status != 0 {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderStatusError, "订单状态错误，无法支付"))
		return
	}

	if err := model.PayOrder(order.ID); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "支付订单失败"))
		return
	}

	updatedOrder, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取订单信息失败"))
		return
	}

	ticketType, err := model.GetTicketTypeByID(order.TicketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}
	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}
	_ = ticketType

	type TicketInfo struct {
		TicketNo  string    `json:"ticket_no"`
		Status    int       `json:"status"`
		CreatedAt time.Time `json:"created_at"`
	}
	tickets := []TicketInfo{}
	if updatedOrder.PaymentTime != nil {
		for i := 0; i < order.Quantity; i++ {
			tickets = append(tickets, TicketInfo{
				TicketNo:  "TICKET" + strconv.Itoa(order.ID) + strconv.Itoa(i+1),
				Status:    0,
				CreatedAt: *updatedOrder.PaymentTime,
			})
		}
	}

	response := struct {
		PaymentTime string       `json:"payment_time"`
		Tickets     []TicketInfo `json:"tickets"`
	}{updatedOrder.PaymentTime.Format(time.RFC3339), tickets}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func (oc *OrderController) RefundOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的订单ID"))
		return
	}

	order, err := model.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取订单信息失败"))
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeOrderNotExist, ""))
		return
	}

	if order.UserID != userID.(int) {
		c.JSON(http.StatusForbidden, util.ErrorResponse(util.StatusCodeForbidden, ""))
		return
	}

	if order.Status != 1 {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeOrderStatusError, "订单状态错误，无法申请退款"))
		return
	}

	if err := model.UpdateOrderStatus(order.ID, 3); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "退款申请失败"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}
