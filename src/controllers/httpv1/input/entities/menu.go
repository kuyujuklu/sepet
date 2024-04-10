package entities

import "github.com/alexkalak/qrmenu/src/models"

type MenuInput struct {
	Name    string `json:"name" validate:"required,min=2" example:"My menu name"`
	PubID   int    `json:"pub_id" example:"2"`
	Place   int    `json:"place" example:"1"`
	Visible bool   `json:"visible" validate:"" example:"true"`
}

func (m *MenuInput) ConvertToModel(pubID int) models.Menu {
	menu := models.Menu{
		Name:    m.Name,
		PubID:   uint(m.PubID),
		Place:   m.Place,
		Visible: m.Visible,
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

func (m *MenuOutput) FillFromModel(menu models.Menu) {
	m.ID = int(menu.ID)
	m.Name = menu.Name
	m.PubID = int(menu.PubID)
	m.Place = menu.Place
	m.Visible = menu.Visible
}
