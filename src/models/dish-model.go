package models

import "gorm.io/gorm"

type Dish struct {
	gorm.Model
	Name          string
	ImageFileName string
	Price         float64
	Ingriedients  string
	Place         int
	Visible       bool
	CategoryID    uint
	Category      Category
}
