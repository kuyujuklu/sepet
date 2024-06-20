package notificationerrors

import "errors"

var ErrUnableToCreateNotification = errors.New("unable to create notification")
var ErrUnableToGetNotification = errors.New("unable to get notification")
var ErrUnableToUpdateNotification = errors.New("unable to update notification")
var ErrUnableToDeleteNotification = errors.New("unable to delete notification")
var ErrNotificationNotFound = errors.New("notification not found")
