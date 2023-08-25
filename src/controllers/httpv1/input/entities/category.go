package entities

import "github.com/alexkalak/qrmenu/src/models"

type CategoryInput struct {
	Name    string `json:"name" validate:"required,min=2" example:"My category name"`
	Place   int    `json:"place" validate:"required,numeric" example:"1"`
	Visible bool   `json:"visible" validate:"required" example:"true"`
}

func (c *CategoryInput) ConvertToModel(menuID int) models.Category {
	category := models.Category{
		Name:    c.Name,
		Place:   c.Place,
		Visible: c.Visible,
		MenuID:  uint(menuID),
	}

	return category
}

type CategoryOutput struct {
	ID            int    `json:"id" example:"1"`
	Name          string `json:"name" example:"My category name"`
	Place         int    `json:"place" example:"1"`
	Visible       bool   `json:"visible" example:"true"`
	MenuID        int    `json:"menu_id" example:"1"`
	ImageFileName string `json:"image_file_name" example:"41e480e5-340b-4f1a-94e2-7ed25a6b8d3c.green_circle_checkmark.png"`
}

func (c *CategoryOutput) ConvertFromModel(category models.Category) {
	c.ID = int(category.ID)
	c.Name = category.Name
	c.Place = category.Place
	c.Visible = category.Visible
	c.MenuID = int(category.MenuID)
	c.ImageFileName = category.ImageFileName
}
