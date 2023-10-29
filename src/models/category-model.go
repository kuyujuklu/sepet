package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name          string
	ImageFileName string
	Place         int
	Visible       bool
	Dishes        []Dish
	Menu          Menu
	MenuID        uint
	TextColor     string
}
