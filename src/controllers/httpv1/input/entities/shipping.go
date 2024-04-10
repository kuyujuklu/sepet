package entities

import (
	"github.com/alexkalak/qrmenu/src/errors/puberrors"
	"github.com/alexkalak/qrmenu/src/models"
)

type SetShippingShapes struct {
	Shapes []models.Shape `json:"shapes"`
}

func (p *SetShippingShapes) ConvertToModel() []models.Shape {
	return p.Shapes
}

type SetAvailableShipping struct {
	Available bool `json:"available"`
}

type SetShippingTime struct {
	From int `json:"from" example:"30"`
	To   int `json:"to" example:"50"`
}

type VertexOutput struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type ShapeOutput struct {
	Vertices []VertexOutput `json:"vertices"`
}

func (s *ShapeOutput) FillFromModel(shape models.Shape) error {
	vertices := make([]VertexOutput, 0, len(shape.Vertices))
	for _, vertex := range shape.Vertices {
		vertices = append(vertices, VertexOutput{
			Lat: vertex.Lat,
			Lng: vertex.Lng,
		})
	}
	s.Vertices = vertices
	return nil
}

type ShippingOutput struct {
	ID               int           `json:"id"`
	Available        bool          `json:"available"`
	ShippingTimeFrom int           `json:"shipping_time_from"`
	ShippingTimeTo   int           `json:"shipping_time_to"`
	Shapes           []ShapeOutput `json:"shapes"`
}

func (s *ShippingOutput) FillFromModel(shipping models.Shipping) error {
	shapes, err := shipping.GetShapes()
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	shapesOutput := make([]ShapeOutput, 0, len(shapes))
	for _, shape := range shapes {
		shapeOutput := ShapeOutput{}
		if err := shapeOutput.FillFromModel(shape); err != nil {
			return err
		}

		shapesOutput = append(shapesOutput, shapeOutput)
	}

	s.ID = int(shipping.ID)
	s.Available = shipping.Available
	s.Shapes = shapesOutput
	s.ShippingTimeFrom = shipping.ShippingTimeFrom
	s.ShippingTimeTo = shipping.ShippingTimeTo

	return nil
}
