package models

import "gorm.io/gorm"

type Company struct {
	gorm.Model
	Name     string
	Phone    string
	Email    string
	Password string
	Pubs     []Pub

	RoleID uint
	Role   Role //always company
}
