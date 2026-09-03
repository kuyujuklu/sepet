package couriernotificationrepo

import (
	"errors"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/notificationerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

type CourierNotificationRepo interface {
	GetByCourierID(courierID int) (models.CourierNotificationSubscription, error)
	GetAll() ([]models.CourierNotificationSubscription, error)
	Create(courierID int, token, lang string) (models.CourierNotificationSubscription, error)
	UpdateToken(courierID int, token, lang string) (models.CourierNotificationSubscription, error)
}

type courierNotificationRepo struct {
	Database *gorm.DB
}

func New() CourierNotificationRepo {
	return &courierNotificationRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *courierNotificationRepo) GetByCourierID(courierID int) (models.CourierNotificationSubscription, error) {
	sub := models.CourierNotificationSubscription{}
	resp := r.Database.First(&sub, "courier_id = ?", courierID)
	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.CourierNotificationSubscription{}, notificationerrors.ErrNotificationNotFound
		}
		return models.CourierNotificationSubscription{}, notificationerrors.ErrUnableToGetNotification
	}

	return sub, nil
}

func (r *courierNotificationRepo) GetAll() ([]models.CourierNotificationSubscription, error) {
	subs := make([]models.CourierNotificationSubscription, 0)
	resp := r.Database.Find(&subs)
	if resp.Error != nil {
		return nil, notificationerrors.ErrUnableToGetNotification
	}
	return subs, nil
}

func (r *courierNotificationRepo) Create(courierID int, token, lang string) (models.CourierNotificationSubscription, error) {
	sub := models.CourierNotificationSubscription{
		ExpoNotificationToken: token,
		CourierID:             courierID,
		Lang:                  lang,
	}

	resp := r.Database.Create(&sub)
	if resp.Error != nil {
		return models.CourierNotificationSubscription{}, notificationerrors.ErrUnableToCreateNotification
	}

	return sub, nil
}

func (r *courierNotificationRepo) UpdateToken(courierID int, token, lang string) (models.CourierNotificationSubscription, error) {
	resp := r.Database.
		Model(&models.CourierNotificationSubscription{}).
		Where("courier_id = ?", courierID).
		Updates(map[string]interface{}{"expo_notification_token": token, "lang": lang})
	if resp.Error != nil {
		return models.CourierNotificationSubscription{}, notificationerrors.ErrUnableToUpdateNotification
	}

	return r.GetByCourierID(courierID)
}
