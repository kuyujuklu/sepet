package models

import "gorm.io/gorm"

type PhoneValidationSession struct {
	gorm.Model
	Name           string
	Phone          string
	HashedPassword string
	Number         string
	PinID          string
}
