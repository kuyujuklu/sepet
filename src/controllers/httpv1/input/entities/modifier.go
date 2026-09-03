package entities

import "github.com/alexkalak/qrmenu/src/models"

type ModifierOptionInput struct {
	Name       string  `json:"name" validate:"required,min=1" example:"Large"`
	PriceDelta float64 `json:"price_delta" example:"20"`
}

type ModifierGroupInput struct {
	Name    string                `json:"name" validate:"required,min=1" example:"Размер"`
	Options []ModifierOptionInput `json:"options"`
}

func (g *ModifierGroupInput) ConvertToModel() models.ModifierGroup {
	options := make([]models.ModifierOption, 0, len(g.Options))
	for _, option := range g.Options {
		options = append(options, models.ModifierOption{
			Name:       option.Name,
			PriceDelta: option.PriceDelta,
		})
	}

	return models.ModifierGroup{
		Name:    g.Name,
		Options: options,
	}
}

type ModifierOptionOutput struct {
	ID         int     `json:"id" example:"1"`
	Name       string  `json:"name" example:"Large"`
	PriceDelta float64 `json:"price_delta" example:"20"`
}

func (o *ModifierOptionOutput) FillFromModel(option models.ModifierOption) {
	o.ID = int(option.ID)
	o.Name = option.Name
	o.PriceDelta = option.PriceDelta
}

type ModifierGroupOutput struct {
	ID      int                    `json:"id" example:"1"`
	Name    string                 `json:"name" example:"Размер"`
	Options []ModifierOptionOutput `json:"options"`
}

func (g *ModifierGroupOutput) FillFromModel(group models.ModifierGroup) {
	g.ID = int(group.ID)
	g.Name = group.Name

	g.Options = make([]ModifierOptionOutput, 0, len(group.Options))
	for _, option := range group.Options {
		optionOutput := ModifierOptionOutput{}
		optionOutput.FillFromModel(option)
		g.Options = append(g.Options, optionOutput)
	}
}
