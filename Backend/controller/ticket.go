package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"ticket-system-backend/model"
	"ticket-system-backend/util"
)

// 生成订单号（实际项目中可能需要更复杂的生成规则）
func generateOrderNo() string {
	return time.Now().Format("20060102150405") + strconv.FormatInt(time.Now().UnixNano()%1000000, 10)
}

// TicketController 票种控制器
type TicketController struct {}

// GetTicketTypesByPerformanceID 根据演出ID获取票种列表
func (tc *TicketController) GetTicketTypesByPerformanceID(c *gin.Context) {
	// 获取演出ID
	performanceID, err := strconv.Atoi(c.Param("performanceId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的演出ID"))
		return
	}

	// 检查演出是否存在
	performance, err := model.GetPerformanceByID(performanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if performance == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodePerformanceNotExist, ""))
		return
	}

	// 查询票种列表
	ticketTypes, err := model.GetTicketTypesByPerformanceID(performanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(ticketTypes))
}

// UpdateTicketStock 更新票种库存
func (tc *TicketController) UpdateTicketStock(c *gin.Context) {
	// 获取演出ID和票种ID
	performanceID, err := strconv.Atoi(c.Param("performanceId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的演出ID"))
		return
	}

	ticketTypeId, err := strconv.Atoi(c.Param("ticketTypeId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的票种ID"))
		return
	}

	// 获取请求参数
	var request struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 检查票种是否存在
	ticketType, err := model.GetTicketTypeByID(ticketTypeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	// 检查票种是否属于指定演出
	if ticketType.PerformanceID != performanceID {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "票种不属于该演出"))
		return
	}

	// 更新库存（这里简化处理，实际应根据业务需求进行库存调整）
	// 例如：可以是增加库存、减少库存等

	response := struct {
		Success bool `json:"success"`
	}{true}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// GetTicketTypeByID 获取票种详情
func (tc *TicketController) GetTicketTypeByID(c *gin.Context) {
	// 获取票种ID
	ticketTypeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的票种ID"))
		return
	}

	// 查询票种详情
	ticketType, err := model.GetTicketTypeByID(ticketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(ticketType))
}

// GetTicketStock 获取票种库存
func (tc *TicketController) GetTicketStock(c *gin.Context) {
	// 获取票种ID
	ticketTypeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的票种ID"))
		return
	}

	// 查询票种详情
	ticketType, err := model.GetTicketTypeByID(ticketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	// 构造响应数据
	response := map[string]interface{}{
		"ticketTypeId": ticketType.ID,
		"stock":        ticketType.Stock,
	}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// SeckillTicket 抢票接口
func (tc *TicketController) SeckillTicket(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 获取请求参数
	var request struct {
		TicketTypeId int `json:"ticketTypeId" binding:"required"`
		Quantity int `json:"quantity" binding:"required,min=1,max=5"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 检查票种是否存在
	ticketType, err := model.GetTicketTypeByID(request.TicketTypeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	// 检查库存是否充足
	if ticketType.Stock < request.Quantity {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeTicketStockInsufficient, ""))
		return
	}

	// 检查演出信息
	performance, err := model.GetPerformanceByID(ticketType.PerformanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	if performance == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodePerformanceNotExist, ""))
		return
	}

	// 扣减库存
	if err := model.DecreaseStock(request.TicketTypeId, request.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeTicketSeckillFailed, err.Error()))
		return
	}

	// 创建订单
	order := &model.Order{
		OrderNo:       generateOrderNo(),
		UserID:        userID.(int),
		PerformanceID: ticketType.PerformanceID,
		TicketTypeID:  request.TicketTypeId,
		Quantity:      request.Quantity,
		Amount:        ticketType.Price * float64(request.Quantity),
		Status:        0, // 待支付
		ExpireTime:    time.Now().Add(30 * time.Minute), // 设置订单有效期为30分钟
		PaymentTime:   nil, // 未支付，设置为nil表示数据库中的NULL值
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := model.CreateOrder(order); err != nil {
		// 如果创建订单失败，回滚库存
		model.IncreaseStock(request.TicketTypeId, request.Quantity)
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 返回订单信息
	response := struct {
		OrderId int `json:"order_id"`
		OrderNo string `json:"order_no"`
		Amount float64 `json:"amount"`
		ExpireTime string `json:"expire_time"`
	}{order.ID, order.OrderNo, order.Amount, order.ExpireTime.Format(time.RFC3339)}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}