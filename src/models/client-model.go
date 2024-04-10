package models

import "gorm.io/gorm"

type Client struct {
	gorm.Model
	Phone  string
	Name   string
	RoleID int
	Role   Role
}

type RegistrationSession struct {
	gorm.Model
	Phone            string
	Name             string
	ValidationNumber int
}

type LoginSession struct {
	gorm.Model
	Phone            string
	ValidationNumber int
}
