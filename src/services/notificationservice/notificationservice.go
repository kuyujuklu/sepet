package notificationservice

import (
	"fmt"
	"os"

	"github.com/alexkalak/qrmenu/src/errors/notificationerrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/notificationrepo"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

type NotificaitonText struct {
	Ru string
	Ro string
}

type NotificationService interface {
	Subscribe(phone, token, lang string) (models.NotificationSubscription, error)
	SendToAllClients(title NotificaitonText, body NotificaitonText) error
	SendNotification(clientID int, title NotificaitonText, body NotificaitonText, data map[string]string) error
	SendNotificationLinkedToOrderInfoPage(clientID int, title NotificaitonText, body NotificaitonText, orderID int) error
	SendNotificationWithToken(token string, lang string, title NotificaitonText, body NotificaitonText) error
}

type notificationService struct {
	NotificationRepo         notificationrepo.NotificationRepo
	ClientRepo               clientrepo.ClientRepo
	ApplicationPath          string
	ApplicationPathParam     string
	ApplicationOrderPagePath string
	ApplicationOrderIDParam  string
}

func New() NotificationService {
	return &notificationService{
		NotificationRepo:         notificationrepo.New(),
		ClientRepo:               clientrepo.New(),
		ApplicationPath:          os.Getenv("APPLICATION_EXPO_PATH"),
		ApplicationPathParam:     os.Getenv("APPLICATION_PATH_PARAM"),
		ApplicationOrderPagePath: os.Getenv("APPLICATION_ORDER_PAGE_PATH"),
		ApplicationOrderIDParam:  os.Getenv("APPLICATION_ORDER_ID_PARAM"),
	}
}

func (s *notificationService) Subscribe(phone, token, lang string) (models.NotificationSubscription, error) {
	_, err := s.NotificationRepo.GetNotificationSubscription(phone)
	// notificationSub exists
	if err == nil {
		return s.NotificationRepo.UpdateNotificationSubscriptionToken(phone, token, lang)
	}
	// notification does not exist
	if err == notificationerrors.ErrNotificationNotFound {
		return s.NotificationRepo.CreateSubscriptionSubscription(phone, token, lang)
	}

	// unable to get sub
	return models.NotificationSubscription{}, err
}

type void struct{}

func (s *notificationService) SendToAllClients(title NotificaitonText, body NotificaitonText) error {
	subscriptions, err := s.NotificationRepo.GetAllSubscriptions()
	if err != nil {
		return err
	}

	clientIDsSet := make(map[int]void, 0)

	pushClient := expo.NewPushClient(nil)

	for _, notificationSub := range subscriptions {
		_, exist := clientIDsSet[notificationSub.ClientID]
		if exist {
			fmt.Println("EXIST", notificationSub.ClientID)
			continue
		} else {
			fmt.Println("Not Exist", notificationSub.ClientID)
		}

		clientIDsSet[notificationSub.ClientID] = void{}

		pushToken, err := expo.NewExponentPushToken(notificationSub.ExpoNotificationToken)
		if err != nil {
			continue
		}

		fmt.Println("not", notificationSub)
		fmt.Println("pus", pushToken)

		notificationTitle := title.Ru
		if notificationSub.Lang == models.NOTIFICATION_LANG_RO {
			notificationTitle = title.Ro
		}

		notificationBody := body.Ru
		if notificationSub.Lang == models.NOTIFICATION_LANG_RO {
			notificationBody = body.Ro
		}
		response, err := pushClient.Publish(&expo.PushMessage{
			To:       []expo.ExponentPushToken{pushToken},
			Title:    notificationTitle,
			Body:     notificationBody,
			Sound:    "default",
			Priority: expo.DefaultPriority,
		})

		fmt.Println("response: ", response)

		if err != nil {
			fmt.Println("ru resp: ", response)
			fmt.Println("ru err: ", err)
			continue
		}

	}

	return nil
}

func (s *notificationService) SendNotification(clientID int, title NotificaitonText, body NotificaitonText, data map[string]string) error {
	client, err := s.ClientRepo.GetClientByID(clientID)
	if err != nil {
		return err
	}

	notificationSub, err := s.NotificationRepo.GetNotificationSubscription(client.Phone)
	if err != nil {
		return err
	}

	pushToken, err := expo.NewExponentPushToken(notificationSub.ExpoNotificationToken)
	if err != nil {
		return err
	}

	fmt.Println("not", notificationSub)
	fmt.Println("pus", pushToken)

	pushClient := expo.NewPushClient(nil)

	notificationTitleString := title.Ru
	if notificationSub.Lang == models.NOTIFICATION_LANG_RO {
		notificationTitleString = title.Ro
	}

	notificationBodyString := body.Ru
	if notificationSub.Lang == models.NOTIFICATION_LANG_RO {
		notificationBodyString = body.Ro
	}

	// Publish message
	response, err := pushClient.Publish(
		&expo.PushMessage{
			To:       []expo.ExponentPushToken{pushToken},
			Body:     notificationTitleString,
			Sound:    "default",
			Title:    notificationBodyString,
			Priority: expo.DefaultPriority,
			Data:     data,
		},
	)
	if err != nil {
		fmt.Println("nil in publishing notification: ", err)
		return err
	}

	fmt.Println("push response: ", helpers.ConvertToJSON(response))

	return nil
}

func (s *notificationService) SendNotificationLinkedToOrderInfoPage(clientID int, title NotificaitonText, body NotificaitonText, orderID int) error {
	data := make(map[string]string)
	data["url"] = fmt.Sprintf("%s?%s=%s&%s=%d", s.ApplicationPath, s.ApplicationPathParam, s.ApplicationOrderPagePath, s.ApplicationOrderIDParam, orderID)
	fmt.Println("data: ", data)
	return s.SendNotification(clientID, title, body, data)
}

func (s *notificationService) SendNotificationWithToken(token string, lang string, title NotificaitonText, body NotificaitonText) error {
	pushToken, err := expo.NewExponentPushToken(token)
	if err != nil {
		return err
	}

	fmt.Println("not", token)
	fmt.Println("pus", pushToken)

	pushClient := expo.NewPushClient(nil)

	notificationTitleString := title.Ru
	if lang == models.NOTIFICATION_LANG_RO {
		notificationTitleString = title.Ro
	}

	notificationBodyString := body.Ru
	if lang == models.NOTIFICATION_LANG_RO {
		notificationBodyString = body.Ro
	}

	// Publish message
	response, err := pushClient.Publish(
		&expo.PushMessage{
			To:       []expo.ExponentPushToken{pushToken},
			Title:    notificationBodyString,
			Body:     notificationTitleString,
			Sound:    "default",
			Priority: expo.DefaultPriority,
		},
	)
	if err != nil {
		fmt.Println("nil in publishing notification: ", err)
		return err
	}

	fmt.Println("push response: ", helpers.ConvertToJSON(response))

	return nil
}
