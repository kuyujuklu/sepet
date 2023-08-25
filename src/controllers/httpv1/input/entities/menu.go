package entities

import "github.com/alexkalak/qrmenu/src/models"

type MenuInput struct {
	Name    string `json:"name" validate:"required,min=2" example:"My menu name"`
	PubID   int    `json:"pub_id" example:"2"`
	Place   int    `json:"place" example:"1"`
	Visible bool   `json:"visible" validate:"required" example:"true"`
}

func (c *MenuInput) ConvertToModel(pubID int) models.Menu {
	menu := models.Menu{
		Name:    c.Name,
		PubID:   uint(c.PubID),
		Place:   c.Place,
		Visible: c.Visible,
	}

	return menu
}

type MenuOutput struct {
	ID      int    `json:"id" example:"1"`
	Name    string `json:"name" example:"My menu name"`
	Place   int    `json:"place" example:"1"`
	PubID   int    `json:"pub_id" example:"2"`
	Visible bool   `json:"visible" example:"true"`
}

func (c *MenuOutput) ConvertFromModel(menu models.Menu) {
	c.ID = int(menu.ID)
	c.Name = menu.Name
	c.PubID = int(menu.PubID)
	c.Place = menu.Place
	c.Visible = menu.Visible
}
