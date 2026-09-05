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
	GetSubscriptionsByClientIDs(clientIDs []int) ([]models.NotificationSubscription, error)
	CreateSubscriptionSubscription(phone, token, lang string) (models.NotificationSubscription, error)
	UpdateNotificationSubscriptionToken(phone, token, lang string) (models.NotificationSubscription, error)
	DeleteSubscriptionByToken(token string) error
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
// DeleteSubscriptionByToken soft-deletes every subscription row still
// carrying this exact token - called when Expo's delivery receipt reports
// DeviceNotRegistered, so a churned install stops being sent to (and
// re-counted as a failure) on every future send.
func (r *notificationRepo) DeleteSubscriptionByToken(token string) error {
	resp := r.Database.Where("expo_notification_token = ?", token).Delete(&models.NotificationSubscription{})
	if resp.Error != nil {
		return notificationerrors.ErrUnableToUpdateNotification
	}
	return nil
}

func (r *notificationRepo) GetAllSubscriptions() ([]models.NotificationSubscription, error) {
	subs := make([]models.NotificationSubscription, 0)
	resp := r.Database.Find(&subs)
	if resp.Error != nil {
		return nil, notificationerrors.ErrUnableToGetNotification
	}
	return subs, nil
}

// GetSubscriptionsByClientIDs is GetAllSubscriptions narrowed to a specific
// set of clients - used when a caller already knows which clients it cares
// about (e.g. a push campaign targeting one venue's customers) and would
// otherwise pull every subscription in the system just to filter almost all
// of it back out in Go.
func (r *notificationRepo) GetSubscriptionsByClientIDs(clientIDs []int) ([]models.NotificationSubscription, error) {
	subs := make([]models.NotificationSubscription, 0)
	if len(clientIDs) == 0 {
		return subs, nil
	}
	resp := r.Database.Where("client_id IN ?", clientIDs).Find(&subs)
	if resp.Error != nil {
		return nil, notificationerrors.ErrUnableToGetNotification
	}
	return subs, nil
}
