package entities

import (
	"time"

	"github.com/alexkalak/qrmenu/src/models"
)

type DishInput struct {
	Name        string  `json:"name" validate:"required,min=2" example:"My dish name"`
	Price       float64 `json:"price" validate:"numeric" example:"1.99"`
	SalePrice   float64 `json:"sale_price" validate:"numeric" example:"1.99"`
	Ingredients string  `json:"ingredients" example:"My dish ingredients"`
	TextColor   string  `json:"text_color" example:"#000000"`
	Place       int     `json:"place" validate:"required,numeric" example:"1"`
	Visible     bool    `json:"visible" validate:"" example:"true"`
	Available   bool    `json:"available" example:"true"`
	IsHit       bool    `json:"is_hit" example:"false"`
	// AvailabilityStart/End are minutes-since-midnight; equal values (the
	// zero value included) mean "no schedule - always available".
	AvailabilityStart int `json:"availability_start" example:"0"`
	AvailabilityEnd   int `json:"availability_end" example:"0"`
	// ModifierGroupIDs is the full set of modifier groups assigned to this
	// dish - applied separately from the rest of the dish fields (see
	// ModifierGroupRepo.SetDishModifierGroups), not part of ConvertToModel.
	ModifierGroupIDs []int `json:"modifier_group_ids"`
}

func (d *DishInput) ConvertToModel(categoryID int) models.Dish {
	dish := models.Dish{
		Name:              d.Name,
		Price:             d.Price,
		SalePrice:         d.SalePrice,
		Ingredients:       d.Ingredients,
		TextColor:         d.TextColor,
		Place:             d.Place,
		Visible:           d.Visible,
		Available:         d.Available,
		IsHit:             d.IsHit,
		AvailabilityStart: d.AvailabilityStart,
		AvailabilityEnd:   d.AvailabilityEnd,
		CategoryID:        uint(categoryID),
	}

	return dish
}

type DishOutput struct {
	ID                int                    `json:"id" example:"1"`
	Name              string                 `json:"name" example:"My dish name"`
	ImageFileName     string                 `json:"image_file_name" example:"my-dish-image.jpg"`
	Price             float64                `json:"price" example:"1.99"`
	SalePrice         float64                `json:"sale_price" example:"1.99"`
	Ingredients       string                 `json:"ingredients" example:"My dish ingredients"`
	TextColor         string                 `json:"text_color" example:"#000000"`
	Place             int                    `json:"place" example:"1"`
	Visible           bool                   `json:"visible" example:"true"`
	CategoryID        int                    `json:"category_id" example:"1"`
	Available         bool                   `json:"available" example:"true"`
	IsHit             bool                   `json:"is_hit" example:"false"`
	AvailabilityStart int                    `json:"availability_start" example:"0"`
	AvailabilityEnd   int                    `json:"availability_end" example:"0"`
	IsAvailableNow    bool                   `json:"is_available_now" example:"true"`
	ModifierGroups    []ModifierGroupOutput  `json:"modifier_groups"`
}

func (d *DishOutput) FillFromModel(dish models.Dish) {
	d.ID = int(dish.ID)
	d.Name = dish.Name
	d.ImageFileName = dish.ImageFileName
	d.Price = dish.Price
	d.SalePrice = dish.SalePrice
	d.Ingredients = dish.Ingredients
	d.TextColor = dish.TextColor
	d.Place = dish.Place
	d.Visible = dish.Visible
	d.CategoryID = int(dish.CategoryID)
	d.Available = dish.Available
	d.IsHit = dish.IsHit
	d.AvailabilityStart = dish.AvailabilityStart
	d.AvailabilityEnd = dish.AvailabilityEnd

	now := time.Now().UTC()
	d.IsAvailableNow = dish.IsAvailableNow(now.Hour()*60 + now.Minute())

	d.ModifierGroups = make([]ModifierGroupOutput, 0, len(dish.ModifierGroups))
	for _, group := range dish.ModifierGroups {
		groupOutput := ModifierGroupOutput{}
		groupOutput.FillFromModel(group)
		d.ModifierGroups = append(d.ModifierGroups, groupOutput)
	}
}
