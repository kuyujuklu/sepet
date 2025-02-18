package notificationrepo

import (
	"errors"
	"fmt"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/notificationerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"gorm.io/gorm"
)

type NotificationRepo interface {
	GetNotificationSubscription(phone string) (models.NotificationSubscription, error)
	GetAllSubscriptions() ([]models.NotificationSubscription, error)
	CreateSubscriptionSubscription(phone, token, lang string) (models.NotificationSubscription, error)
	UpdateNotificationSubscriptionToken(phone, token, lang string) (models.NotificationSubscription, error)
}

type notificationRepo struct {
	Database   *gorm.DB
	ClientRepo clientrepo.ClientRepo
}

func New() NotificationRepo {
	return &notificationRepo{
		Database:   postgresql.GetDB(),
		ClientRepo: clientrepo.New(),
	}
}

func (r *notificationRepo) GetNotificationSubscription(phone string) (models.NotificationSubscription, error) {
	client, err := r.ClientRepo.GetClientByPhoneNumber(phone)
	if err != nil {
		return models.NotificationSubscription{}, err
	}

	notificationSub := models.NotificationSubscription{}
	resp := r.Database.First(&notificationSub, "client_id = ?", client.ID)
	if resp.Error != nil {
		if errors.Is(resp.Error, gorm.ErrRecordNotFound) {
			return models.NotificationSubscription{}, notificationerrors.ErrNotificationNotFound
		}
		return models.NotificationSubscription{}, notificationerrors.ErrUnableToGetNotification
	}

	return notificationSub, nil
}

func (r *notificationRepo) CreateSubscriptionSubscription(phone, token, lang string) (models.NotificationSubscription, error) {
	client, err := r.ClientRepo.GetClientByPhoneNumber(phone)
	if err != nil {
		return models.NotificationSubscription{}, err
	}

	notificationSub := models.NotificationSubscription{
		ExpoNotificationToken: token,
		ClientID:              int(client.ID),
		Lang:                  lang,
	}

	resp := r.Database.Create(&notificationSub)
	if resp.Error != nil {
		return models.NotificationSubscription{}, notificationerrors.ErrUnableToCreateNotification
	}

	return notificationSub, nil
}

func (r *notificationRepo) UpdateNotificationSubscriptionToken(phone, token, lang string) (models.NotificationSubscription, error) {
	fmt.Println("=======================================================")
	client, err := r.ClientRepo.GetClientByPhoneNumber(phone)
	if err != nil {
		return models.NotificationSubscription{}, err
	}

	resp := r.Database.
		Model(&models.NotificationSubscription{}).
		Where("client_id = ?", client.ID).
		Updates(map[string]interface{}{"expo_notification_token": token, "lang": lang})
	if resp.Error != nil {
		fmt.Println("resp err : ", resp.Error)
		return models.NotificationSubscription{}, notificationerrors.ErrUnableToUpdateNotification
	}

	notificationSub, err := r.GetNotificationSubscription(phone)
	if err != nil {
		return models.NotificationSubscription{}, err
	}
	fmt.Println("not sub: ", notificationSub)

	return notificationSub, nil
}
func (r *notificationRepo) GetAllSubscriptions() ([]models.NotificationSubscription, error) {
	subs := make([]models.NotificationSubscription, 0)
	resp := r.Database.Find(&subs)
	if resp.Error != nil {
		return nil, notificationerrors.ErrUnableToGetNotification
	}
	return subs, nil
}
