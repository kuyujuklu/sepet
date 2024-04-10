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
}

type Shipping struct {
	ID               uint
	Available        bool
	ShapesJSON       string //this is json of structure []Shape
	ShippingTimeFrom int
	ShippingTimeTo   int
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
