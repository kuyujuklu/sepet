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

type SetFreeDeliveryFrom struct {
	FreeDeliveryFrom int `json:"free_delivery_from" example:"300"`
}

type ShippingWorkTimeForDay struct {
	Start int `json:"start"`
	End   int `json:"end"`
}

type SetShippingWorkHoursInput struct {
	WorkHours []ShippingWorkTimeForDay `json:"work_hours"`
}

func (e *SetShippingWorkHoursInput) ConvertToModel() []models.ShippingWorkTimeForDay {
	output := make([]models.ShippingWorkTimeForDay, 0, len(e.WorkHours))

	for _, workHour := range e.WorkHours {
		output = append(output, models.ShippingWorkTimeForDay{
			Start: workHour.Start,
			End:   workHour.End,
		})
	}

	return output
}

type SetShippingPrices struct {
	Prices map[string]float64 `json:"prices" example:"{shape_id: price}"`
}

type SetStandardShippingPrice struct {
	Price float64 `json:"price" example:"88"`
}

type VertexOutput struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type ShapeOutput struct {
	ShapeID  string         `json:"shape_id"`
	Color    string         `json:"color"`
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
	s.ShapeID = shape.ShapeID
	s.Color = shape.Color
	return nil
}

type ShippingOutput struct {
	ID                         int                      `json:"id"`
	Available                  bool                     `json:"available"`
	ShippingTimeFrom           int                      `json:"shipping_time_from"`
	ShippingTimeTo             int                      `json:"shipping_time_to"`
	ShippingWorkHoursForWeek   []ShippingWorkTimeForDay `json:"shipping_work_hours_for_week"`
	ShippingStartWorkTime      int                      `json:"shipping_work_start"`
	ShippingEndWorkTime        int                      `json:"shipping_work_end"`
	ShippingPrices             map[string]float64       `json:"shipping_prices"`
	ShippingFreeDeliveryPrices map[string]float64       `json:"shipping_free_delivery_prices"`
	StandardShippingPrice      string                   `json:"standard_shipping_price"`
	Shapes                     []ShapeOutput            `json:"shapes"`
	ShippingPrice              float64                  `json:"shipping_price"`
	DeliveryType               string                   `json:"delivery_type"`
	AddCommissionToDishPrices  bool                     `json:"add_commission_to_dish_prices"`
	CommissionForDishPrices    int                      `json:"commission_for_dish_prices"` // standard commission in percent
}

func (s *ShippingOutput) FillFromModel(shipping models.Shipping) error {
	shapes, err := shipping.GetShapes()
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}

	prices, err := shipping.GetPrices()
	if err != nil {
		return puberrors.ErrPubShippingIsInvalid
	}
	freeDeliveryPrices, err := shipping.GetFreeDeliveryPrices()
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

	workHours, err := shipping.GetWorkHoursForWeek()
	if err != nil {
		return err
	}
	workHoursOutput := make([]ShippingWorkTimeForDay, 0, len(workHours))
	for _, workHour := range workHours {
		workHoursOutput = append(workHoursOutput, ShippingWorkTimeForDay{
			Start: workHour.Start,
			End:   workHour.End,
		})
	}

	s.ID = int(shipping.ID)
	s.Available = shipping.Available
	s.Shapes = shapesOutput
	s.ShippingTimeFrom = shipping.ShippingTimeFrom
	s.ShippingTimeTo = shipping.ShippingTimeTo
	s.ShippingPrices = prices
	s.ShippingFreeDeliveryPrices = freeDeliveryPrices
	s.ShippingWorkHoursForWeek = workHoursOutput
	s.ShippingStartWorkTime = shipping.ShippingStartWorkTime
	s.ShippingEndWorkTime = shipping.ShippingEndWorkTime
	s.DeliveryType = shipping.DeliveryType
	s.AddCommissionToDishPrices = shipping.AddCommissionToDishPrices
	s.CommissionForDishPrices = models.DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT

	return nil
}
