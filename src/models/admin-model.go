package models

type Admin struct {
	ID       uint `gorm:"primaryKey"`
	Name     string
	Password string
}
