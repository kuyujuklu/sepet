package entities

import (
	"encoding/json"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type CreateOrderInput struct {
	Town                 string      `json:"town" example:"Kazaklia"`
	FullAddress          string      `json:"full_address" example:"Lenina 889"`
	MainPhoneNumber      string      `json:"main_phone_number" example:"843829"`
	SecondPhoneNumber    string      `json:"second_phone_number" example:"929320"`
	Comments             string      `json:"comments" example:"without sugar"`
	PaymentType          string      `json:"payment_type"`
	OrderType            string      `json:"order_type" example:"delivery"`
	TableForInPlaceOrder int         `json:"table_for_in_place_order" example:"2"`
	PubID                int         `json:"pub_id"`
	Dishes               []OrderDish `json:"dishes"`
}

func (i *CreateOrderInput) ConvertToModel() (models.Order, error) {
	dishesBytes, err := json.Marshal(i.Dishes)
	if err != nil {
		return models.Order{}, err
	}

	if err := models.CheckOrderPaymentTypeCorrectness(i.PaymentType); err != nil {
		return models.Order{}, err
	}

	if err := models.CheckOrderTypeCorrectness(i.OrderType); err != nil {
		return models.Order{}, err
	}

	return models.Order{
		Town:                 i.Town,
		FullAddress:          i.FullAddress,
		MainPhoneNumber:      i.MainPhoneNumber,
		SecondPhoneNumber:    i.SecondPhoneNumber,
		Comments:             i.Comments,
		PaymentType:          i.PaymentType,
		PubID:                i.PubID,
		OrderType:            i.OrderType,
		TableForInPlaceOrder: i.TableForInPlaceOrder,
		DishesJSON:           string(dishesBytes),
	}, nil
}

type OrderOutput struct {
	ID                   int         `json:"id" example:"12"`
	PubName              string      `json:"pub_name" example:"Big star"`
	CreatedTime          string      `json:"created_time" example:"2006-01-02 15:04:05"`
	Town                 string      `json:"town" example:"Kazaklia"`
	FullAddress          string      `json:"full_address" example:"Lenina 889"`
	MainPhoneNumber      string      `json:"main_phone_number" example:"843829"`
	SecondPhoneNumber    string      `json:"second_phone_number" example:"929320"`
	Comments             string      `json:"comments"`
	PaymentType          string      `json:"payment_type"`
	PubID                int         `json:"pub_id"`
	ClientID             int         `json:"client_id"`
	Dishes               []OrderDish `json:"dishes"`
	OrderType            string      `json:"order_type" example:"delivery"`
	TableForInPlaceOrder int         `json:"table_for_in_place_order" example:"2"`
	Status               string      `json:"status"`
}

func (o *OrderOutput) FillFromModel(order models.Order) error {
	orderDishes, err := order.GetDishes()
	if err != nil {
		return err
	}

	o.Town = order.Town
	o.PubName = order.Pub.Name
	o.ID = int(order.ID)
	o.CreatedTime = helpers.ConvertToStandardApiTime(order.CreatedAt)
	o.FullAddress = order.FullAddress
	o.MainPhoneNumber = order.MainPhoneNumber
	o.SecondPhoneNumber = order.SecondPhoneNumber
	o.PubID = order.PubID
	o.ClientID = order.ClientID
	o.Comments = order.Comments
	o.PaymentType = order.PaymentType
	o.OrderType = order.OrderType
	o.TableForInPlaceOrder = order.TableForInPlaceOrder
	o.Status = order.Status

	for _, modelOrder := range orderDishes {
		o.Dishes = append(o.Dishes, OrderDish{Count: modelOrder.Count, DishID: modelOrder.DishID})
	}

	return nil
}

type OrderDish struct {
	DishID int `json:"dish_id"`
	Count  int `json:"count"`
}
