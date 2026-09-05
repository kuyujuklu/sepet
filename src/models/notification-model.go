package models

import "gorm.io/gorm"

const (
	NOTIFICATION_LANG_RU string = "ru"
	NOTIFICATION_LANG_RO string = "ro"
)

// ClientID 0 means the subscription isn't linked to a client yet - the app
// can register a device's push token as soon as OS permission is granted,
// before the person ever logs in. DeviceID is what makes that row findable
// again once (if) they do log in on that same device, so it upgrades in
// place instead of the login creating a second, duplicate row: empty on
// subscriptions from app builds that predate this, which fall back to the
// original phone-only lookup (see notificationservice.Subscribe).
type NotificationSubscription struct {
	gorm.Model
	ExpoNotificationToken string
	ClientID              int
	DeviceID              string `gorm:"index"`
	Lang                  string
}
