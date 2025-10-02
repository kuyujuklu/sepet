package models

import (
	"encoding/json"
	"time"

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
	AT_COURIER_ORDER_STATUS  = "at_courier"
	COMPLETED_ORDER_STATUS   = "completed"
	CANCELED_ORDER_STATUS    = "canceled"
)

func TranslateStatus(status string, lang string) string {
	if lang == "ru" {
		switch status {
		case NOT_HANDLED_ORDER_STATUS:
			return "Рассматривается"
		case HANDLED_ORDER_STATUS:
			return "Обработан"
		case PREPARING_ORDER_STATUS:
			return "Готовится"
		case AT_COURIER_ORDER_STATUS:
			return "У курьера"
		case COMPLETED_ORDER_STATUS:
			return "Доставлен"
		case CANCELED_ORDER_STATUS:
			return "Отменен"
		}
	}
	if lang == "ro" {
		switch status {
		case NOT_HANDLED_ORDER_STATUS:
			return "Nouă"
		case HANDLED_ORDER_STATUS:
			return "Procesat"
		case PREPARING_ORDER_STATUS:
			return "În pregătire"
		case AT_COURIER_ORDER_STATUS:
			return "La curier"
		case COMPLETED_ORDER_STATUS:
			return "Livrată"
		case CANCELED_ORDER_STATUS:
			return "Anulat"
		}
	}
	return "unknown"
}

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
	if status != NOT_HANDLED_ORDER_STATUS && status != HANDLED_ORDER_STATUS && status != PREPARING_ORDER_STATUS && status != AT_COURIER_ORDER_STATUS && status != COMPLETED_ORDER_STATUS && status != CANCELED_ORDER_STATUS {
		return ordererrors.ErrUnkonwnOrderStatus
	}
	return nil
}

type OrderDish struct {
	DishID    int     `json:"dish_id"`
	Count     int     `json:"count"`
	DishPrice float64 `json:"dish_price"`
}

type Order struct {
	gorm.Model
	Town                              string
	Prepared                          bool
	FullAddress                       string
	MainPhoneNumber                   string
	SecondPhoneNumber                 string
	Comments                          string
	PaymentType                       string
	PubID                             int
	Pub                               Pub
	ClientID                          int
	Client                            Client
	DishesJSON                        string
	TotalDishesPriceWithoutCommission float64
	OrderType                         string
	TableForInPlaceOrder              int
	Status                            string
	Rating                            int // from 1 to 5
	DeliveryPrice                     float64
	Lat                               float64
	Lng                               float64
	ApproximatePreparationTime        time.Time // in minutes

	OrderCourierInfo   OrderCourierInfo
	OrderCourierInfoID int
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
