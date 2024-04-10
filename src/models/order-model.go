package models

import (
	"encoding/json"

	"github.com/alexkalak/qrmenu/src/errors/ordererrors"
	"gorm.io/gorm"
)

const (
	CASH_ORDER_PAYMENT_TYPE         = "cash"
	CARD_OFFLINE_ORDER_PAYMENT_TYPE = "card_offline"
)

const (
	DELIVERY_ORDER_TYPE = "delivery"
	IN_PLACE_ORDER_TYPE = "in_place"
	PREORDER_ORDER_TYPE = "preorder"
)

const (
	NOT_HANDLED_ORDER_STATUS = "not_handled"
	HANDLED_ORDER_STATUS     = "handled"
	PREPARING_ORDER_STATUS   = "preparing"
	COMPLETED_ORDER_STATUS   = "completed"
)

func CheckOrderTypeCorrectness(orderType string) error {
	if orderType != DELIVERY_ORDER_TYPE && orderType != IN_PLACE_ORDER_TYPE && orderType != PREORDER_ORDER_TYPE {
		return ordererrors.ErrUnknownOrderType
	}
	return nil
}

func CheckOrderPaymentTypeCorrectness(paymentType string) error {
	if paymentType != CASH_ORDER_PAYMENT_TYPE && paymentType != CARD_OFFLINE_ORDER_PAYMENT_TYPE {
		return ordererrors.ErrUnkonwnOrderPaymentType
	}
	return nil
}

func CheckOrderStatusCorrectness(status string) error {
	if status != NOT_HANDLED_ORDER_STATUS && status != HANDLED_ORDER_STATUS && status != PREPARING_ORDER_STATUS && status != COMPLETED_ORDER_STATUS {
		return ordererrors.ErrUnkonwnOrderStatus
	}
	return nil
}

type OrderDish struct {
	DishID int `json:"dish_id"`
	Count  int `json:"count"`
}

type Order struct {
	gorm.Model
	Town                 string
	FullAddress          string
	MainPhoneNumber      string
	SecondPhoneNumber    string
	Comments             string
	PaymentType          string
	PubID                int
	Pub                  Pub
	ClientID             int
	Client               Client
	DishesJSON           string
	OrderType            string
	TableForInPlaceOrder int
	Status               string
}

func (m *Order) GetDishes() ([]OrderDish, error) {
	var dishes []OrderDish
	if m.DishesJSON == "" {
		return nil, nil
	}
	err := json.Unmarshal([]byte(m.DishesJSON), &dishes)
	if err != nil {
		return nil, err
	}
	return dishes, nil
}
