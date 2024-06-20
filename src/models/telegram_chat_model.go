package models

import "gorm.io/gorm"

type TelegramChat struct {
	gorm.Model
	PubID    int
	ChatID   string
	Username string
}
