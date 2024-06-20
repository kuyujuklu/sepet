package orderservice

import (
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type EventType string

const (
	CREATE_EVENT_TYPE        EventType = "CREATE_EVENT"
	UPDATE_EVENT_TYPE        EventType = "UPDATE_EVENT"
	UPDATE_RATING_EVENT_TYPE EventType = "UPDATE_RATING_EVENT"
	GET_ALL_EVENT_TYPE       EventType = "GET_ALL"
)

type WSMessageOrderArray struct {
	EventType EventType       `json:"event_type"`
	Orders    []WSOrderOutput `json:"orders"`
}

type WSMessage struct {
	EventType EventType     `json:"event_type"`
	Order     WSOrderOutput `json:"order"`
}

type WSOrderOutput struct {
	ID                   int         `json:"id" example:"12"`
	ClientName           string      `json:"client_name" example:"George"`
	OrderType            string      `json:"order_type" example:"delivery"`
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
	TableForInPlaceOrder int         `json:"table_for_in_place_order"`
	Status               string      `json:"status"`
	Rating               int         `json:"rating"`
}

func (o *WSOrderOutput) FillFromModel(order models.Order) error {
	orderDishes, err := order.GetDishes()
	if err != nil {
		return err
	}

	o.Town = order.Town
	o.PubName = order.Pub.Name
	o.ClientName = order.Client.Name
	o.ID = int(order.ID)
	o.CreatedTime = helpers.ConvertToStandardApiTime(order.CreatedAt)
	o.FullAddress = order.FullAddress
	o.MainPhoneNumber = order.MainPhoneNumber
	o.SecondPhoneNumber = order.SecondPhoneNumber
	o.Comments = order.Comments
	o.PubID = order.PubID
	o.ClientID = order.ClientID
	o.PaymentType = order.PaymentType
	o.TableForInPlaceOrder = order.TableForInPlaceOrder
	o.OrderType = order.OrderType
	o.Status = order.Status
	o.Rating = order.Rating

	for _, modelOrder := range orderDishes {
		o.Dishes = append(o.Dishes, OrderDish{Count: modelOrder.Count, DishID: modelOrder.DishID})
	}

	return nil
}

type OrderDish struct {
	DishID int `json:"dish_id"`
	Count  int `json:"count"`
}
