package entities

import (
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
