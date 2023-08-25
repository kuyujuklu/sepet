package models

import "gorm.io/gorm"

type Menu struct {
	gorm.Model
	ID         uint `gorm:"primarykey"`
	Name       string
	Visible    bool
	Categories []Category
	PubID      uint
	Pub        Pub
	Place      int
}
