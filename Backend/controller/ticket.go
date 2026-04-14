package controller

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
)

type TicketController struct{}

func (tc *TicketController) GetTicketTypesByPerformanceID(c *gin.Context) {
	performanceID, err := strconv.Atoi(c.Param("performanceId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的演出ID"))
		return
	}

	performance, err := model.GetPerformanceByID(performanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取演出信息失败"))
		return
	}

	if performance == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodePerformanceNotExist, ""))
		return
	}

	ticketTypes, err := model.GetTicketTypesByPerformanceID(performanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(ticketTypes))
}

func (tc *TicketController) GetTicketTypeByID(c *gin.Context) {
	ticketTypeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的票种ID"))
		return
	}

	ticketType, err := model.GetTicketTypeByID(ticketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(ticketType))
}

func (tc *TicketController) GetTicketStock(c *gin.Context) {
	ticketTypeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的票种ID"))
		return
	}

	ticketType, err := model.GetTicketTypeByID(ticketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	response := map[string]interface{}{
		"ticketTypeId": ticketType.ID,
		"stock":        ticketType.Stock,
	}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func (tc *TicketController) SeckillTicket(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		TicketTypeId int `json:"ticketTypeId" binding:"required"`
		Quantity     int `json:"quantity" binding:"required,min=1,max=5"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	cfg := util.GetConfig()
	if request.Quantity > cfg.Seckill.MaxQuantityPerUser {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeTicketLimitExceeded, "超过最大购买数量"))
		return
	}

	ticketType, err := model.GetTicketTypeByID(request.TicketTypeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}

	if ticketType == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodeTicketNotExist, ""))
		return
	}

	if ticketType.Stock < request.Quantity {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeTicketStockInsufficient, "库存不足"))
		return
	}

	performance, err := model.GetPerformanceByID(ticketType.PerformanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取演出信息失败"))
		return
	}

	if performance == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodePerformanceNotExist, ""))
		return
	}

	ctx := context.Background()
	lock, err := util.AcquireSeckillLock(ctx, request.TicketTypeId, 10*time.Second)
	if err != nil {
		if err == util.ErrLockAcquireFailed {
			c.JSON(http.StatusServiceUnavailable, util.ErrorResponse(util.StatusCodeTicketSeckillFailed, "系统繁忙，请稍后重试"))
			return
		}
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取分布式锁失败"))
		return
	}
	defer util.ReleaseSeckillLock(lock, ctx)

	ticketType, err = model.GetTicketTypeByID(request.TicketTypeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}

	if ticketType.Stock < request.Quantity {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeTicketStockInsufficient, "库存不足"))
		return
	}

	if err := model.DecreaseStock(request.TicketTypeId, request.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeTicketSeckillFailed, "扣减库存失败"))
		return
	}

	order := &model.Order{
		OrderNo:       GenerateOrderNo(),
		UserID:        userID.(int),
		PerformanceID: ticketType.PerformanceID,
		TicketTypeID:  request.TicketTypeId,
		Quantity:      request.Quantity,
		Amount:        ticketType.Price * float64(request.Quantity),
		Status:        0,
		ExpireTime:    time.Now().Add(time.Duration(cfg.Seckill.OrderExpireMinutes) * time.Minute),
		PaymentTime:   nil,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := model.CreateOrder(order); err != nil {
		model.IncreaseStock(request.TicketTypeId, request.Quantity)
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "创建订单失败"))
		return
	}

	response := struct {
		OrderId    int     `json:"order_id"`
		OrderNo    string  `json:"order_no"`
		Amount     float64 `json:"amount"`
		ExpireTime string  `json:"expire_time"`
	}{order.ID, order.OrderNo, order.Amount, order.ExpireTime.Format(time.RFC3339)}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func GenerateOrderNo() string {
	return time.Now().Format("20060102150405") + strconv.FormatInt(time.Now().UnixNano()%1000000, 10)
}
