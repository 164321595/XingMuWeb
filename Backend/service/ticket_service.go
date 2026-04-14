package service

import (
	"context"
	"errors"
	"strconv"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"
)

var (
	ErrTicketTypeNotFound  = errors.New("票种不存在")
	ErrPerformanceNotFound = errors.New("演出不存在")
	ErrStockInsufficient   = errors.New("库存不足")
	ErrSeckillFailed       = errors.New("抢票失败")
	ErrLockAcquireFailed   = errors.New("系统繁忙，请稍后重试")
	ErrTicketLimitExceeded = errors.New("超出每人限购数量")
)

type TicketService struct{}

func NewTicketService() *TicketService {
	return &TicketService{}
}

func (s *TicketService) GetTicketTypesByPerformanceID(performanceID int) ([]model.TicketType, error) {
	performance, err := model.GetPerformanceByID(performanceID)
	if err != nil || performance == nil {
		return nil, ErrPerformanceNotFound
	}

	return model.GetTicketTypesByPerformanceID(performanceID)
}

func (s *TicketService) GetTicketTypeByID(ticketTypeID int) (*model.TicketType, error) {
	ticketType, err := model.GetTicketTypeByID(ticketTypeID)
	if err != nil || ticketType == nil {
		return nil, ErrTicketTypeNotFound
	}
	return ticketType, nil
}

func (s *TicketService) Seckill(ctx context.Context, userID, ticketTypeID, quantity int) (*model.Order, error) {
	cfg := util.GetConfig()

	if quantity > cfg.Seckill.MaxQuantityPerUser {
		return nil, ErrTicketLimitExceeded
	}

	ticketType, err := model.GetTicketTypeByID(ticketTypeID)
	if err != nil || ticketType == nil {
		return nil, ErrTicketTypeNotFound
	}

	if ticketType.Stock < quantity {
		return nil, ErrStockInsufficient
	}

	performance, err := model.GetPerformanceByID(ticketType.PerformanceID)
	if err != nil || performance == nil {
		return nil, ErrPerformanceNotFound
	}

	lock, err := util.AcquireSeckillLock(ctx, ticketTypeID, 10*time.Second)
	if err != nil {
		if err == util.ErrLockAcquireFailed {
			return nil, ErrLockAcquireFailed
		}
		return nil, err
	}
	defer util.ReleaseSeckillLock(lock, ctx)

	ticketType, err = model.GetTicketTypeByID(ticketTypeID)
	if err != nil || ticketType == nil {
		return nil, ErrTicketTypeNotFound
	}

	if ticketType.Stock < quantity {
		return nil, ErrStockInsufficient
	}

	if err := model.DecreaseStock(ticketTypeID, quantity); err != nil {
		return nil, ErrSeckillFailed
	}

	order := &model.Order{
		OrderNo:       GenerateOrderNo(),
		UserID:        userID,
		PerformanceID: ticketType.PerformanceID,
		TicketTypeID:  ticketTypeID,
		Quantity:      quantity,
		Amount:        ticketType.Price * float64(quantity),
		Status:        0,
		ExpireTime:    time.Now().Add(time.Duration(cfg.Seckill.OrderExpireMinutes) * time.Minute),
		PaymentTime:   nil,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := model.CreateOrder(order); err != nil {
		model.IncreaseStock(ticketTypeID, quantity)
		return nil, err
	}

	return order, nil
}

func GenerateOrderNo() string {
	return time.Now().Format("20060102150405") + strconv.FormatInt(time.Now().UnixNano()%1000000, 10)
}
