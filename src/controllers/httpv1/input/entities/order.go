package entities

import (
	"encoding/json"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type CreateOrderInput struct {
	Town                 string           `json:"town" example:"Kazaklia"`
	FullAddress          string           `json:"full_address" example:"Lenina 889"`
	MainPhoneNumber      string           `json:"main_phone_number" example:"843829"`
	SecondPhoneNumber    string           `json:"second_phone_number" example:"929320"`
	Comments             string           `json:"comments" example:"without sugar"`
	PaymentType          string           `json:"payment_type"`
	OrderType            string           `json:"order_type" example:"delivery"`
	TableForInPlaceOrder int              `json:"table_for_in_place_order" example:"2"`
	PubID                int              `json:"pub_id"`
	DeliveryPrice        float64          `json:"delivery_price"`
	Lat                  float64          `json:"lat"`
	Lng                  float64          `json:"lng"`
	Dishes               []OrderDishInput `json:"dishes"`
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
		DeliveryPrice:        i.DeliveryPrice,
		Town:                 i.Town,
		FullAddress:          i.FullAddress,
		MainPhoneNumber:      i.MainPhoneNumber,
		SecondPhoneNumber:    i.SecondPhoneNumber,
		Comments:             i.Comments,
		PaymentType:          i.PaymentType,
		PubID:                i.PubID,
		OrderType:            i.OrderType,
		TableForInPlaceOrder: i.TableForInPlaceOrder,
		Lat:                  i.Lat,
		Lng:                  i.Lng,
		DishesJSON:           string(dishesBytes),
	}, nil
}

type RateOrderInput struct {
	Rating int `json:"rating"`
}

type OrderCourierInfoOutput struct {
	IsReserved        bool    `json:"is_reserved"`
	ReserverCourierID int     `json:"reserver_courier_id"`
	Distance          int     `json:"distance"`
	CourierReward     float64 `json:"courier_reward"`
}

func (o *OrderCourierInfoOutput) FillFromModel(courierInfo models.OrderCourierInfo) {
	o.IsReserved = courierInfo.IsReserved
	o.ReserverCourierID = courierInfo.ReserverCourierID
	o.Distance = courierInfo.Distance
	o.CourierReward = courierInfo.CourierReward
}

type OrderOutput struct {
	ID                   int                    `json:"id" example:"12"`
	PubName              string                 `json:"pub_name" example:"Big star"`
	CreatedTime          string                 `json:"created_time" example:"2006-01-02 15:04:05"`
	Town                 string                 `json:"town" example:"Kazaklia"`
	FullAddress          string                 `json:"full_address" example:"Lenina 889"`
	MainPhoneNumber      string                 `json:"main_phone_number" example:"843829"`
	SecondPhoneNumber    string                 `json:"second_phone_number" example:"929320"`
	Comments             string                 `json:"comments"`
	PaymentType          string                 `json:"payment_type"`
	PubID                int                    `json:"pub_id"`
	PubUrlName           string                 `json:"pub_url_name"`
	ClientID             int                    `json:"client_id"`
	Dishes               []OrderDishOutput      `json:"dishes"`
	OrderType            string                 `json:"order_type" example:"delivery"`
	TableForInPlaceOrder int                    `json:"table_for_in_place_order" example:"2"`
	Status               string                 `json:"status"`
	Rating               int                    `json:"rating"`
	DeliveryPrice        float64                `json:"delivery_price"`
	CourierInfo          OrderCourierInfoOutput `json:"courier_info"`
	ClientName           string                 `json:"client_name" example:"George"`
	Pub                  PubOutput              `json:"pub"`
	Lat                  float64                `json:"lat"`
	Lng                  float64                `json:"lng"`
}

func (o *OrderOutput) FillFromModel(order models.Order) error {
	orderDishes, err := order.GetDishes()
	if err != nil {
		return err
	}

	orderPub := PubOutput{}
	err = orderPub.FillFromModel(order.Pub)
	if err != nil {
		return err
	}
	courierInfo := OrderCourierInfoOutput{}
	courierInfo.FillFromModel(order.OrderCourierInfo)

	o.Pub = orderPub
	o.CourierInfo = courierInfo

	o.Town = order.Town
	o.PubName = order.Pub.Name
	o.ID = int(order.ID)
	o.CreatedTime = helpers.ConvertToStandardApiTime(order.CreatedAt)
	o.FullAddress = order.FullAddress
	o.MainPhoneNumber = order.MainPhoneNumber
	o.SecondPhoneNumber = order.SecondPhoneNumber
	o.PubID = order.PubID
	o.PubUrlName = order.Pub.UrlName
	o.ClientID = order.ClientID
	o.Comments = order.Comments
	o.PaymentType = order.PaymentType
	o.OrderType = order.OrderType
	o.TableForInPlaceOrder = order.TableForInPlaceOrder
	o.Status = order.Status
	o.Rating = order.Rating
	o.DeliveryPrice = order.DeliveryPrice
	o.ClientName = order.Client.Name
	o.Lat = order.Lat
	o.Lng = order.Lng

	for _, orderDish := range orderDishes {
		o.Dishes = append(o.Dishes, OrderDishOutput{Count: orderDish.Count, DishID: orderDish.DishID, DishPrice: orderDish.DishPrice})
	}

	return nil
}

type OrderOutputWithoutPub struct {
	ID                   int                    `json:"id" example:"12"`
	PubName              string                 `json:"pub_name" example:"Big star"`
	CreatedTime          string                 `json:"created_time" example:"2006-01-02 15:04:05"`
	Town                 string                 `json:"town" example:"Kazaklia"`
	FullAddress          string                 `json:"full_address" example:"Lenina 889"`
	MainPhoneNumber      string                 `json:"main_phone_number" example:"843829"`
	SecondPhoneNumber    string                 `json:"second_phone_number" example:"929320"`
	Comments             string                 `json:"comments"`
	PaymentType          string                 `json:"payment_type"`
	PubID                int                    `json:"pub_id"`
	PubUrlName           string                 `json:"pub_url_name"`
	ClientID             int                    `json:"client_id"`
	Dishes               []OrderDishOutput      `json:"dishes"`
	OrderType            string                 `json:"order_type" example:"delivery"`
	TableForInPlaceOrder int                    `json:"table_for_in_place_order" example:"2"`
	Status               string                 `json:"status"`
	Rating               int                    `json:"rating"`
	DeliveryPrice        float64                `json:"delivery_price"`
	CourierInfo          OrderCourierInfoOutput `json:"courier_info"`
	ClientName           string                 `json:"client_name" example:"George"`
	Lat                  float64                `json:"lat"`
	Lng                  float64                `json:"lng"`
}

func (o *OrderOutputWithoutPub) FillFromModel(order models.Order) error {
	orderDishes, err := order.GetDishes()
	if err != nil {
		return err
	}

	orderPub := PubOutput{}
	err = orderPub.FillFromModel(order.Pub)
	if err != nil {
		return err
	}
	courierInfo := OrderCourierInfoOutput{}
	courierInfo.FillFromModel(order.OrderCourierInfo)

	o.CourierInfo = courierInfo

	o.Town = order.Town
	o.PubName = order.Pub.Name
	o.ID = int(order.ID)
	o.CreatedTime = helpers.ConvertToStandardApiTime(order.CreatedAt)
	o.FullAddress = order.FullAddress
	o.MainPhoneNumber = order.MainPhoneNumber
	o.SecondPhoneNumber = order.SecondPhoneNumber
	o.PubID = order.PubID
	o.PubUrlName = order.Pub.UrlName
	o.ClientID = order.ClientID
	o.Comments = order.Comments
	o.PaymentType = order.PaymentType
	o.OrderType = order.OrderType
	o.TableForInPlaceOrder = order.TableForInPlaceOrder
	o.Status = order.Status
	o.Rating = order.Rating
	o.DeliveryPrice = order.DeliveryPrice
	o.ClientName = order.Client.Name
	o.Lat = order.Lat
	o.Lng = order.Lng

	for _, orderDish := range orderDishes {
		o.Dishes = append(o.Dishes, OrderDishOutput{Count: orderDish.Count, DishID: orderDish.DishID, DishPrice: orderDish.DishPrice})
	}

	return nil
}

type OrderDishInput struct {
	DishID int `json:"dish_id"`
	Count  int `json:"count"`
}

type OrderDishOutput struct {
	DishID    int     `json:"dish_id"`
	Count     int     `json:"count"`
	DishPrice float64 `json:"dish_price"`
}
