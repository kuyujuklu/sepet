package models

import (
	"encoding/json"
	"fmt"
)

type Vertex struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Shape struct {
	Vertices []Vertex `json:"vertices"`
	ShapeID  string   `json:"shape_id"`
	Color    string   `json:"color"`
}

const (
	DELIVERY_TYPE_OWN              = "own"
	DELIVERY_TYPE_DELIVERY_SERVICE = "delivery_service"
)

type Shipping struct {
	ID                        uint
	Available                 bool
	DeliveryType              string
	ShapesJSON                string //this is json of structure []Shape
	ShippingPricesJSON        string // {shape_id: price}
	ShippingTimeFrom          int
	ShippingTimeTo            int
	ShippingStartWorkTime     int //in minutes, for example 360 - 06:00
	ShippingEndWorkTime       int //in minutes, for example 1080 - 18:00
	AddCommissionToDishPrices bool
}

func (s *Shipping) GetShapes() ([]Shape, error) {
	var shapes []Shape
	if s.ShapesJSON == "" {
		fmt.Println("it is empty")
		return nil, nil
	}
	err := json.Unmarshal([]byte(s.ShapesJSON), &shapes)
	if err != nil {
		return nil, err
	}
	return shapes, nil
}

func (s *Shipping) GetPrices() (map[string]float64, error) {
	prices := make(map[string]float64)

	if s.ShippingPricesJSON == "" {
		return nil, nil
	}

	err := json.Unmarshal([]byte(s.ShippingPricesJSON), &prices)
	if err != nil {
		return nil, err
	}

	return prices, nil
}
