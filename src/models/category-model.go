package models

import "gorm.io/gorm"

const (
	CATEGORY_TYPE_PIZZA  = "pizza"
	CATEGORY_TYPE_BURGER = "burger"
	CATEGORY_TYPE_SUSHI  = "sushi"
	CATEGORY_TYPE_DRINKS = "drinks"
	CATEGORY_TYPE_OTHER  = "other"
)

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
	CategoryType  string
}
