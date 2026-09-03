package models

import "gorm.io/gorm"

type CourierNotificationSubscription struct {
	gorm.Model
	ExpoNotificationToken string
	CourierID             int
	Lang                  string
}
