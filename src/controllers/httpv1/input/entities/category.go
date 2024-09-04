package entities

import (
	"github.com/alexkalak/qrmenu/src/errors/categoryerrors"
	"github.com/alexkalak/qrmenu/src/models"
)

type CategoryInput struct {
	Name          string   `json:"name" validate:"required,min=2" example:"My category name"`
	Place         int      `json:"place" validate:"required,numeric" example:"1"`
	Visible       bool     `json:"visible" validate:"" example:"true"`
	TextColor     string   `json:"text_color" validate:"required" example:"#ffffff"`
	CategoryTypes []string `json:"category_types" validate:"required" example:""`
}

func (c *CategoryInput) ConvertToModel(menuID int) models.Category {
	category := models.Category{
		Name:              c.Name,
		TextColor:         c.TextColor,
		Place:             c.Place,
		Visible:           c.Visible,
		CategoryTypesJSON: models.SerializeCategoryTypes(c.CategoryTypes),
		MenuID:            uint(menuID),
	}

	return category
}

type CategoryOutput struct {
	ID            int      `json:"id" example:"1"`
	Name          string   `json:"name" example:"My category name"`
	Place         int      `json:"place" example:"1"`
	Visible       bool     `json:"visible" example:"true"`
	MenuID        int      `json:"menu_id" example:"1"`
	ImageFileName string   `json:"image_file_name" example:"41e480e5-340b-4f1a-94e2-7ed25a6b8d3c.green_circle_checkmark.png"`
	TextColor     string   `json:"text_color" example:"#ffffff"`
	CategoryTypes []string `json:"category_types" example:""`
}

func (c *CategoryOutput) FillFromModel(category models.Category) {
	c.ID = int(category.ID)
	c.Name = category.Name
	c.Place = category.Place
	c.Visible = category.Visible
	c.MenuID = int(category.MenuID)
	c.ImageFileName = category.ImageFileName
	c.TextColor = category.TextColor
	c.CategoryTypes = category.CategoryTypes()
}

type CategoryOutputWithPubID struct {
	ID            int      `json:"id" example:"1"`
	Name          string   `json:"name" example:"My category name"`
	Place         int      `json:"place" example:"1"`
	Visible       bool     `json:"visible" example:"true"`
	MenuID        int      `json:"menu_id" example:"1"`
	ImageFileName string   `json:"image_file_name" example:"41e480e5-340b-4f1a-94e2-7ed25a6b8d3c.green_circle_checkmark.png"`
	TextColor     string   `json:"text_color" example:"#ffffff"`
	CategoryTypes []string `json:"category_types" example:""`
	PubID         int      `json:"pub_id" example:"1"`
}

func (c *CategoryOutputWithPubID) FillFromModel(category models.Category) error {
	if category.Menu.ID == 0 {
		return categoryerrors.ErrCategoryMenuNotFound
	}

	c.ID = int(category.ID)
	c.Name = category.Name
	c.Place = category.Place
	c.Visible = category.Visible
	c.MenuID = int(category.MenuID)
	c.ImageFileName = category.ImageFileName
	c.TextColor = category.TextColor
	c.CategoryTypes = category.CategoryTypes()
	c.PubID = int(category.Menu.PubID)

	return nil
}
