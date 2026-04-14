package service

import (
	"errors"
	"time"

	"ticket-system-backend/model"
)

var (
	ErrOrderNotFound     = errors.New("订单不存在")
	ErrOrderExpired      = errors.New("订单已过期")
	ErrOrderStatusError  = errors.New("订单状态错误")
	ErrInsufficientStock = errors.New("库存不足")
)

type OrderService struct{}

func NewOrderService() *OrderService {
	return &OrderService{}
}

func (s *OrderService) GetUserOrders(userID, page, pageSize, status int) ([]*model.Order, int, error) {
	query := model.OrderQuery{
		UserID: userID,
		Status: status,
		Page:   page,
		Size:   pageSize,
	}
	return model.GetUserOrders(query)
}

func (s *OrderService) GetOrderByID(orderID, userID int) (*model.Order, error) {
	order, err := model.GetOrderByID(orderID)
	if err != nil {
		return nil, ErrOrderNotFound
	}

	if order.UserID != userID {
		return nil, ErrOrderNotFound
	}

	return order, nil
}

func (s *OrderService) CancelOrder(orderID, userID int) error {
	order, err := model.GetOrderByID(orderID)
	if err != nil {
		return ErrOrderNotFound
	}

	if order.UserID != userID {
		return ErrOrderNotFound
	}

	if order.Status != 0 {
		return ErrOrderStatusError
	}

	if err := model.UpdateOrderStatus(order.ID, 2); err != nil {
		return err
	}

	return model.IncreaseStock(order.TicketTypeID, order.Quantity)
}

func (s *OrderService) PayOrder(orderID, userID int) (*model.Order, error) {
	order, err := model.GetOrderByID(orderID)
	if err != nil {
		return nil, ErrOrderNotFound
	}

	if order.UserID != userID {
		return nil, ErrOrderNotFound
	}

	if time.Now().After(order.ExpireTime) {
		return nil, ErrOrderExpired
	}

	if order.Status != 0 {
		return nil, ErrOrderStatusError
	}

	if err := model.PayOrder(order.ID); err != nil {
		return nil, err
	}

	return model.GetOrderByID(orderID)
}

func (s *OrderService) RefundOrder(orderID, userID int) error {
	order, err := model.GetOrderByID(orderID)
	if err != nil {
		return ErrOrderNotFound
	}

	if order.UserID != userID {
		return ErrOrderNotFound
	}

	if order.Status != 1 {
		return ErrOrderStatusError
	}

	if err := model.UpdateOrderStatus(order.ID, 3); err != nil {
		return err
	}

	return model.IncreaseStock(order.TicketTypeID, order.Quantity)
}

func (s *OrderService) CreateOrderFromSeckill(orderID, userID int) (*model.Order, error) {
	order, err := model.GetOrderByID(orderID)
	if err != nil {
		return nil, ErrOrderNotFound
	}

	if order.UserID != userID {
		return nil, ErrOrderNotFound
	}

	if time.Now().After(order.ExpireTime) {
		return nil, ErrOrderExpired
	}

	return order, nil
}
