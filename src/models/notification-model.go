package models

import "gorm.io/gorm"

const (
	NOTIFICATION_LANG_RU string = "ru"
	NOTIFICATION_LANG_RO string = "ro"
)

type NotificationSubscription struct {
	gorm.Model
	ExpoNotificationToken string
	ClientID              int
	Lang                  string
}
