package notificationservice

import (
	"fmt"
	"os"
	"strconv"

	"github.com/alexkalak/qrmenu/src/errors/notificationerrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/clientrepo"
	"github.com/alexkalak/qrmenu/src/repo/notificationrepo"
	"github.com/alexkalak/qrmenu/src/services/pushcampaignservice"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

type NotificaitonText struct {
	Ru string
	Ro string
}

type NotificationService interface {
	Subscribe(phone, deviceID, token, lang string) (models.NotificationSubscription, error)
	SendToAllClients(title NotificaitonText, body NotificaitonText) error
	SendNotification(clientID int, title NotificaitonText, body NotificaitonText, data map[string]string) error
	SendNotificationLinkedToOrderInfoPage(clientID int, title NotificaitonText, body NotificaitonText, orderID int) error
	SendNotificationWithToken(token string, lang string, title NotificaitonText, body NotificaitonText) error
	GetSubscriberStats() (linked int, anonymous int, err error)
}

type notificationService struct {
	NotificationRepo         notificationrepo.NotificationRepo
	ClientRepo               clientrepo.ClientRepo
	PushCampaignService      pushcampaignservice.PushCampaignService
	ApplicationPath          string
	ApplicationPathParam     string
	ApplicationOrderPagePath string
	ApplicationOrderIDParam  string
}

func New() NotificationService {
	return &notificationService{
		NotificationRepo:         notificationrepo.New(),
		ClientRepo:               clientrepo.New(),
		PushCampaignService:      pushcampaignservice.New(),
		ApplicationPath:          os.Getenv("APPLICATION_EXPO_PATH"),
		ApplicationPathParam:     os.Getenv("APPLICATION_PATH_PARAM"),
		ApplicationOrderPagePath: os.Getenv("APPLICATION_ORDER_PAGE_PATH"),
		ApplicationOrderIDParam:  os.Getenv("APPLICATION_ORDER_ID_PARAM"),
	}
}

// recordSend saves this individual send as a PushCampaignRecipient row (see
// that model's comment) and returns the recipient id to fold into the
// message's Data map, so the client can report received/opened against it
// and RunReceiptPoller can check a real delivery receipt the same way it
// already does for campaign sends. Never fails the caller - losing this
// tracking row is not worth losing the push itself over.
func (s *notificationService) recordSend(clientID int, pushToken expo.ExponentPushToken, response expo.PushResponse) string {
	status := models.PUSH_CAMPAIGN_RECIPIENT_STATUS_SENT
	if response.Status != expo.SuccessStatus {
		status = models.PUSH_CAMPAIGN_RECIPIENT_STATUS_FAILED
	}
	recipient, err := s.PushCampaignService.RecordIndividualSend(clientID, string(pushToken), response.ID, status)
	if err != nil {
		fmt.Println("notificationservice: failed to record send for delivery tracking:", err)
		return ""
	}
	return strconv.Itoa(int(recipient.ID))
}

// Subscribe registers a push token for whatever the app currently knows -
// which may be nothing but the device itself. `phone` is empty for a client
// who hasn't logged in yet (or an app build old enough to not send
// deviceID at all falls through to the original phone-only path below).
// `deviceID` is a UUID the app generates once and persists locally, stable
// across logins/logouts on that install - the anchor that lets a device's
// row get upgraded with a real ClientID once they do log in, rather than
// the login creating a second, duplicate row.
func (s *notificationService) Subscribe(phone, deviceID, token, lang string) (models.NotificationSubscription, error) {
	var clientID int
	if phone != "" {
		client, err := s.ClientRepo.GetClientByPhoneNumber(phone)
		if err != nil {
			return models.NotificationSubscription{}, err
		}
		clientID = int(client.ID)
	}

	if deviceID != "" {
		existing, err := s.NotificationRepo.GetSubscriptionByDeviceID(deviceID)
		if err == nil {
			// Never regress a row that's already linked to a real client
			// back to anonymous just because this particular call didn't
			// have a phone (e.g. a logged-out app re-subscribing on the
			// same device) - only ever add information, never drop it.
			effectiveClientID := existing.ClientID
			if clientID != 0 {
				effectiveClientID = clientID
			}
			if updateErr := s.NotificationRepo.UpdateSubscriptionByID(existing.ID, effectiveClientID, token, lang); updateErr != nil {
				return models.NotificationSubscription{}, updateErr
			}
			existing.ClientID = effectiveClientID
			existing.ExpoNotificationToken = token
			existing.Lang = lang
			return existing, nil
		}
		if err != notificationerrors.ErrNotificationNotFound {
			return models.NotificationSubscription{}, err
		}
		return s.NotificationRepo.CreateSubscriptionWithDevice(clientID, deviceID, token, lang)
	}

	if phone == "" {
		return models.NotificationSubscription{}, notificationerrors.ErrNoIdentifierProvided
	}

	// No deviceID sent at all - a build from before this existed. Original
	// phone-only behavior, unchanged.
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

	// Keyed by the subscription row's own id, not ClientID: an anonymous
	// device (ClientID 0 - see the model comment) would otherwise dedupe
	// against every *other* anonymous device as if they were all "the same
	// client already sent to", and a client logged in on two devices would
	// lose the second one the same way. A row's id is always unique.
	seenSubscriptionIDs := make(map[uint]void, 0)

	pushClient := expo.NewPushClient(nil)

	for _, notificationSub := range subscriptions {
		_, exist := seenSubscriptionIDs[notificationSub.ID]
		if exist {
			continue
		}
		seenSubscriptionIDs[notificationSub.ID] = void{}

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

		s.recordSend(notificationSub.ClientID, pushToken, response)
	}

	return nil
}

// sendToSubscription is one recipient's worth of the two-phase
// create-pending/send/finalize dance SendNotification uses - pulled out so
// it can run once per device instead of just the single one
// GetNotificationSubscription used to arbitrarily pick.
func (s *notificationService) sendToSubscription(pushClient *expo.PushClient, sub models.NotificationSubscription, title NotificaitonText, body NotificaitonText, data map[string]string) error {
	pushToken, err := expo.NewExponentPushToken(sub.ExpoNotificationToken)
	if err != nil {
		return err
	}

	titleString := title.Ru
	if sub.Lang == models.NOTIFICATION_LANG_RO {
		titleString = title.Ro
	}
	bodyString := body.Ru
	if sub.Lang == models.NOTIFICATION_LANG_RO {
		bodyString = body.Ro
	}

	// A fresh copy per subscription - this runs once per device for the
	// same client, and each device's push needs its own deliveryID, not
	// whichever one a previous iteration happened to set.
	messageData := make(map[string]string, len(data)+1)
	for k, v := range data {
		messageData[k] = v
	}

	// The recipient row has to exist before the send so its id can ride
	// along inside Data - that's what lets the app report received/opened
	// against this exact notification (see CreatePendingIndividualSend).
	// Best-effort: a tracking failure here still lets the actual push go out.
	pending, pendingErr := s.PushCampaignService.CreatePendingIndividualSend(sub.ClientID)
	if pendingErr != nil {
		fmt.Println("notificationservice: failed to create pending delivery record:", pendingErr)
	} else {
		messageData["deliveryID"] = strconv.Itoa(int(pending.ID))
	}

	response, err := pushClient.Publish(
		&expo.PushMessage{
			To:       []expo.ExponentPushToken{pushToken},
			Title:    titleString,
			Body:     bodyString,
			Sound:    "default",
			Priority: expo.DefaultPriority,
			Data:     messageData,
		},
	)
	if err != nil {
		fmt.Println("nil in publishing notification: ", err)
		if pendingErr == nil {
			if finalizeErr := s.PushCampaignService.FinalizeIndividualSend(pending.ID, string(pushToken), "", models.PUSH_CAMPAIGN_RECIPIENT_STATUS_FAILED); finalizeErr != nil {
				fmt.Println("notificationservice: failed to finalize failed delivery record:", finalizeErr)
			}
		}
		return err
	}

	if pendingErr == nil {
		status := models.PUSH_CAMPAIGN_RECIPIENT_STATUS_SENT
		if response.Status != expo.SuccessStatus {
			status = models.PUSH_CAMPAIGN_RECIPIENT_STATUS_FAILED
		}
		if finalizeErr := s.PushCampaignService.FinalizeIndividualSend(pending.ID, string(pushToken), response.ID, status); finalizeErr != nil {
			fmt.Println("notificationservice: failed to finalize delivery record:", finalizeErr)
		}
	}

	fmt.Println("push response: ", helpers.ConvertToJSON(response))
	return nil
}

// SendNotification reaches every device the client is subscribed on, not
// just one. GetNotificationSubscription's plain `.First()` lookup used to be
// harmless because logging in on a new device overwrote the client's one
// existing row in place - but since notification subscriptions can now be
// registered before login (device-keyed, see the model comment), the same
// client can genuinely have more than one *separate* row (one per device)
// at once, and `.First()` would silently only ever reach whichever one
// happens to sort first, e.g. an old phone that's no longer the one in the
// person's hand.
func (s *notificationService) SendNotification(clientID int, title NotificaitonText, body NotificaitonText, data map[string]string) error {
	subs, err := s.NotificationRepo.GetSubscriptionsByClientIDs([]int{clientID})
	if err != nil {
		return err
	}
	if len(subs) == 0 {
		return notificationerrors.ErrNotificationNotFound
	}

	pushClient := expo.NewPushClient(nil)

	var lastErr error
	sentToAny := false
	for _, sub := range subs {
		if sendErr := s.sendToSubscription(pushClient, sub, title, body, data); sendErr != nil {
			lastErr = sendErr
			continue
		}
		sentToAny = true
	}

	if sentToAny {
		return nil
	}
	return lastErr
}

func (s *notificationService) SendNotificationLinkedToOrderInfoPage(clientID int, title NotificaitonText, body NotificaitonText, orderID int) error {
	data := make(map[string]string)
	data["url"] = fmt.Sprintf("%s?%s=%s&%s=%d", s.ApplicationPath, s.ApplicationPathParam, s.ApplicationOrderPagePath, s.ApplicationOrderIDParam, orderID)
	fmt.Println("data: ", data)
	return s.SendNotification(clientID, title, body, data)
}

func (s *notificationService) GetSubscriberStats() (int, int, error) {
	return s.NotificationRepo.CountSubscribers()
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
			Title:    notificationTitleString,
			Body:     notificationBodyString,
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
