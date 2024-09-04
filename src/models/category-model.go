package models

import (
	"encoding/json"

	"gorm.io/gorm"
)

const (
	CATEGORY_TYPE_PIZZA  = "pizza"
	CATEGORY_TYPE_BURGER = "burger"
	CATEGORY_TYPE_SUSHI  = "sushi"
	CATEGORY_TYPE_DRINKS = "drinks"
	CATEGORY_TYPE_OTHER  = "other"
)

type Category struct {
	gorm.Model
	Name              string
	ImageFileName     string
	Place             int
	Visible           bool
	Dishes            []Dish
	Menu              Menu
	MenuID            uint
	TextColor         string
	CategoryTypesJSON string
}

func (c *Category) CategoryTypes() []string {
	categoryTypes := []string{}
	err := json.Unmarshal([]byte(c.CategoryTypesJSON), &categoryTypes)
	if err != nil {
		return []string{}
	}

	return categoryTypes
}

func SerializeCategoryTypes(types []string) string {
	serializedBytes, err := json.Marshal(types)
	if err != nil {
		return ""
	}
	return string(serializedBytes)
}
