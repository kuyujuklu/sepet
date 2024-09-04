package models

import (
	"time"

	"gorm.io/gorm"
)

type Courier struct {
	gorm.Model

	FullName       string
	Email          string
	HashedPassword string
	PhoneNumber    string
	BirthDate      time.Time
	Gender         string
	Location       string
	ImageFileName  string
}
