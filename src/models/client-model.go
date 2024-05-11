package models

import "gorm.io/gorm"

type Client struct {
	gorm.Model
	Phone          string
	HashedPassword string
	Name           string
	RoleID         int
	Role           Role
}
