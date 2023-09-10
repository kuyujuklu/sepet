package entities

import "github.com/alexkalak/qrmenu/src/models"

type DishInput struct {
	Name        string  `json:"name" validate:"required,min=2" example:"My dish name"`
	Price       float64 `json:"price" validate:"numeric" example:"1.99"`
	Ingredients string  `json:"ingredients" example:"My dish ingredients"`
	TextColor   string  `json:"text_color" example:"#000000"`
	Place       int     `json:"place" validate:"required,numeric" example:"1"`
	Visible     bool    `json:"visible" validate:"" example:"true"`
}

func (d *DishInput) ConvertToModel(categoryID int) models.Dish {
	dish := models.Dish{
		Name:        d.Name,
		Price:       d.Price,
		Ingredients: d.Ingredients,
		TextColor:   d.TextColor,
		Place:       d.Place,
		Visible:     d.Visible,
		CategoryID:  uint(categoryID),
	}

	return dish
}

type DishOutput struct {
	ID            int     `json:"id" example:"1"`
	Name          string  `json:"name" example:"My dish name"`
	ImageFileName string  `json:"image_file_name" example:"my-dish-image.jpg"`
	Price         float64 `json:"price" example:"1.99"`
	Ingredients   string  `json:"ingredients" example:"My dish ingredients"`
	TextColor     string  `json:"text_color" example:"#000000"`
	Place         int     `json:"place" example:"1"`
	Visible       bool    `json:"visible" example:"true"`
	CategoryID    int     `json:"category_id" example:"1"`
}

func (d *DishOutput) ConvertFromModel(dish models.Dish) {
	d.ID = int(dish.ID)
	d.Name = dish.Name
	d.ImageFileName = dish.ImageFileName
	d.Price = dish.Price
	d.Ingredients = dish.Ingredients
	d.TextColor = dish.TextColor
	d.Place = dish.Place
	d.Visible = dish.Visible
	d.CategoryID = int(dish.CategoryID)
}
