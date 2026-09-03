package models

import "gorm.io/gorm"

// A ModifierGroup is reusable across dishes (e.g. "Размер", "Соусы") so a pub
// only defines it once and assigns it to as many dishes as it applies to,
// rather than re-entering the same options per dish.
type ModifierGroup struct {
	gorm.Model
	Name    string
	PubID   uint
	Pub     Pub
	Options []ModifierOption
	Dishes  []Dish `gorm:"many2many:dish_modifier_groups;"`
}

// PriceDelta is added to (or, if negative, subtracted from) the dish's
// resolved price when this option is selected - resolved server-side only,
// same as the dish price itself (see orderservice.FillDishPrices).
type ModifierOption struct {
	gorm.Model
	Name            string
	PriceDelta      float64
	ModifierGroupID uint
}
