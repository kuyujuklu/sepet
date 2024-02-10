package models

type Vertex struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Shape struct {
	Vertices []Vertex `json:"vertices"`
}

type Shipping struct {
	ID         uint
	Available  bool
	ShapesJSON string //this is json of structure []Shape
}
