package pushcampaignservice

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/alexkalak/qrmenu/src/errors/pushcampaignerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/notificationrepo"
	"github.com/alexkalak/qrmenu/src/repo/pushcampaignrepo"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

// The Expo SDK vendored here (github.com/oliveroneill/exponent-server-sdk-golang)
// has no receipt-fetching method at all, so real "delivered" tracking is a
// small hand-rolled call to Expo's actual REST endpoint instead of an SDK call.
const expoReceiptsURL = "https://exp.host/--/api/v2/push/getReceipts"

// Expo's HTTP API caps a single /push/send or /push/getReceipts request -
// keep both loops comfortably under that regardless of audience size.
const expoSendBatchSize = 100
const expoReceiptsBatchSize = 300

type CampaignInput struct {
	TitleRu string
	TitleRo string
	BodyRu  string
	BodyRo  string

	DeepLinkType    string
	DeepLinkPubID   int
	DeepLinkOrderID int
	DeepLinkDishID  int
	DeepLinkScreen  string
	DeepLinkURL     string

	AudienceType         string
	AudiencePubID        int
	AudienceInactiveDays int

	TTLHours int
	Priority string

	// nil = send now, otherwise the campaign is stored as scheduled and
	// RunScheduler picks it up once this time arrives.
	ScheduledAt *time.Time
}

type TestSendInput struct {
	Phone   string
	TitleRu string
	TitleRo string
	BodyRu  string
	BodyRo  string

	DeepLinkType    string
	DeepLinkPubID   int
	DeepLinkOrderID int
	DeepLinkDishID  int
	DeepLinkScreen  string
	DeepLinkURL     string
}

type PushCampaignService interface {
	CreateCampaign(input CampaignInput) (models.PushCampaign, error)
	GetAll() ([]models.PushCampaign, error)
	PreviewAudienceCount(audienceType string, pubID int, inactiveDays int) (int, error)
	SendTest(input TestSendInput) error
	SendCampaignNow(campaignID int) error
	MarkOpened(campaignID, clientID int) error

	// RecordIndividualSend and the two Mark*ByRecipient methods below track
	// one-off pushes (order/status notifications) through the exact same
	// recipient table and receipt poller a campaign blast uses, addressed by
	// the recipient row's own id rather than a (campaignID, clientID) pair -
	// works the same whether PushCampaignID is a real campaign or 0.
	RecordIndividualSend(clientID int, expoToken, ticketID, status string) (models.PushCampaignRecipient, error)
	CreatePendingIndividualSend(clientID int) (models.PushCampaignRecipient, error)
	FinalizeIndividualSend(recipientID uint, expoToken, ticketID, status string) error
	MarkReceivedByRecipient(recipientID, clientID int) error
	MarkOpenedByRecipient(recipientID, clientID int) error

	// Long-running - each is meant to be started once with `go`, from
	// main.go. Neither existed as a pattern in this codebase before this
	// feature; the only prior periodic loop (wsutils.SendPing) is spawned
	// per-connection, not once at boot.
	RunScheduler()
	RunReceiptPoller()
}

type pushCampaignService struct {
	Repo             pushcampaignrepo.PushCampaignRepo
	NotificationRepo notificationrepo.NotificationRepo
}

func New() PushCampaignService {
	return &pushCampaignService{
		Repo:             pushcampaignrepo.New(),
		NotificationRepo: notificationrepo.New(),
	}
}

func isKnownDeepLinkType(t string) bool {
	switch t {
	case "", models.PUSH_CAMPAIGN_DEEP_LINK_NONE, models.PUSH_CAMPAIGN_DEEP_LINK_PUB,
		models.PUSH_CAMPAIGN_DEEP_LINK_ORDER, models.PUSH_CAMPAIGN_DEEP_LINK_DISH,
		models.PUSH_CAMPAIGN_DEEP_LINK_SCREEN, models.PUSH_CAMPAIGN_DEEP_LINK_URL:
		return true
	}
	return false
}

func isKnownAudienceType(t string) bool {
	switch t {
	case "", models.PUSH_CAMPAIGN_AUDIENCE_ALL, models.PUSH_CAMPAIGN_AUDIENCE_PUB_CUSTOMERS,
		models.PUSH_CAMPAIGN_AUDIENCE_INACTIVE, models.PUSH_CAMPAIGN_AUDIENCE_FIRST_TIME,
		models.PUSH_CAMPAIGN_AUDIENCE_FREQUENT:
		return true
	}
	return false
}

func (s *pushCampaignService) CreateCampaign(input CampaignInput) (models.PushCampaign, error) {
	if !isKnownDeepLinkType(input.DeepLinkType) {
		return models.PushCampaign{}, pushcampaignerrors.ErrUnknownDeepLinkType
	}
	if !isKnownAudienceType(input.AudienceType) {
		return models.PushCampaign{}, pushcampaignerrors.ErrUnknownAudienceType
	}
	if input.ScheduledAt != nil && !input.ScheduledAt.After(time.Now()) {
		return models.PushCampaign{}, pushcampaignerrors.ErrInvalidScheduledTime
	}

	priority := input.Priority
	if priority == "" {
		priority = models.PUSH_CAMPAIGN_PRIORITY_DEFAULT
	}

	campaign := models.PushCampaign{
		TitleRu: input.TitleRu, TitleRo: input.TitleRo,
		BodyRu: input.BodyRu, BodyRo: input.BodyRo,

		DeepLinkType:    input.DeepLinkType,
		DeepLinkPubID:   input.DeepLinkPubID,
		DeepLinkOrderID: input.DeepLinkOrderID,
		DeepLinkDishID:  input.DeepLinkDishID,
		DeepLinkScreen:  input.DeepLinkScreen,
		DeepLinkURL:     input.DeepLinkURL,

		AudienceType:         input.AudienceType,
		AudiencePubID:        input.AudiencePubID,
		AudienceInactiveDays: input.AudienceInactiveDays,

		TTLHours: input.TTLHours,
		Priority: priority,

		ScheduledAt: input.ScheduledAt,
	}

	if input.ScheduledAt != nil {
		campaign.Status = models.PUSH_CAMPAIGN_STATUS_SCHEDULED
	} else {
		// Set to "sending" up front (not left at some earlier draft state)
		// so the very first read after creation - the HTTP response below
		// included - already reflects reality, since the actual send runs
		// in the background from here (see SendCampaignNow's doc comment).
		campaign.Status = models.PUSH_CAMPAIGN_STATUS_SENDING
	}

	created, err := s.Repo.Create(campaign)
	if err != nil {
		return models.PushCampaign{}, err
	}

	if input.ScheduledAt == nil {
		go func() {
			if err := s.SendCampaignNow(int(created.ID)); err != nil {
				fmt.Println("push campaign send failed:", created.ID, err)
			}
		}()
	}

	return created, nil
}

func (s *pushCampaignService) GetAll() ([]models.PushCampaign, error) {
	return s.Repo.GetAll()
}

// dedupSubscriptionsByClient mirrors the same clientIDsSet pattern
// notificationservice.SendToAllClients already uses - a client can have
// stale rows from re-subscribing on a new device.
func dedupSubscriptionsByClient(subs []models.NotificationSubscription) []models.NotificationSubscription {
	seen := make(map[int]bool, len(subs))
	deduped := make([]models.NotificationSubscription, 0, len(subs))
	for _, sub := range subs {
		if seen[sub.ClientID] {
			continue
		}
		seen[sub.ClientID] = true
		deduped = append(deduped, sub)
	}
	return deduped
}

// resolveRecipients only pulls the subscriptions it actually needs: "all"
// still has to read the whole table (there is no narrower query for it),
// but every other segment resolves its (typically much smaller) client id
// list first and asks for exactly those subscriptions - not the full table
// filtered down in Go, which is what this used to do regardless of how
// narrow the segment was.
func (s *pushCampaignService) resolveRecipients(audienceType string, pubID int, inactiveDays int) ([]models.NotificationSubscription, error) {
	if audienceType == "" || audienceType == models.PUSH_CAMPAIGN_AUDIENCE_ALL {
		allSubs, err := s.NotificationRepo.GetAllSubscriptions()
		if err != nil {
			return nil, err
		}
		return dedupSubscriptionsByClient(allSubs), nil
	}

	eligibleIDs, err := s.Repo.ResolveAudienceClientIDs(audienceType, pubID, inactiveDays)
	if err != nil {
		return nil, err
	}
	if len(eligibleIDs) == 0 {
		return nil, nil
	}

	subs, err := s.NotificationRepo.GetSubscriptionsByClientIDs(eligibleIDs)
	if err != nil {
		return nil, err
	}
	return dedupSubscriptionsByClient(subs), nil
}

func (s *pushCampaignService) PreviewAudienceCount(audienceType string, pubID int, inactiveDays int) (int, error) {
	if !isKnownAudienceType(audienceType) {
		return 0, pushcampaignerrors.ErrUnknownAudienceType
	}
	subs, err := s.resolveRecipients(audienceType, pubID, inactiveDays)
	if err != nil {
		return 0, err
	}
	return len(subs), nil
}

// buildPushData is the full Data payload for one recipient - the deep-link
// fields the app's resolveDestinationFromFields (or, for "dish"/"url", its
// own special-cased handling) reads, plus campaignID so a tap can be posted
// back to /client/push-campaigns/:id/opened regardless of whether the push
// had a deep link at all. Only a real, persisted campaign gets that field -
// SendTest's throwaway campaign literal has ID 0, and a test tap has nothing
// to report against.
func buildPushData(campaign models.PushCampaign) map[string]string {
	data := map[string]string{}
	if campaign.ID != 0 {
		data["campaignID"] = strconv.Itoa(int(campaign.ID))
	}

	switch campaign.DeepLinkType {
	case models.PUSH_CAMPAIGN_DEEP_LINK_PUB:
		data["path"] = "PubInfo"
		data["pubID"] = strconv.Itoa(campaign.DeepLinkPubID)
	case models.PUSH_CAMPAIGN_DEEP_LINK_ORDER:
		data["path"] = "OrderInfoPage"
		data["orderID"] = strconv.Itoa(campaign.DeepLinkOrderID)
	case models.PUSH_CAMPAIGN_DEEP_LINK_DISH:
		// Resolved by the app's own dish-popup handling, not
		// resolveDestinationFromFields (dishes aren't a routed screen).
		data["path"] = "DishInfo"
		data["pubID"] = strconv.Itoa(campaign.DeepLinkPubID)
		data["dishID"] = strconv.Itoa(campaign.DeepLinkDishID)
	case models.PUSH_CAMPAIGN_DEEP_LINK_SCREEN:
		// Matches resolveDestinationFromFields's existing bare fallback
		// (`if (Screens[path]) return {screen: Screens[path]}`) - works
		// with today's app already, screen name must match a Screens key.
		data["path"] = campaign.DeepLinkScreen
	case models.PUSH_CAMPAIGN_DEEP_LINK_URL:
		// Deliberately a different key from "path" above - opened via a
		// plain Linking.openURL call, not resolveDestinationFromFields.
		data["externalUrl"] = campaign.DeepLinkURL
	}

	if len(data) == 0 {
		return nil
	}
	return data
}

func priorityOrDefault(priority string) string {
	if priority == models.PUSH_CAMPAIGN_PRIORITY_HIGH {
		return expo.HighPriority
	}
	return expo.DefaultPriority
}

// SendCampaignNow resolves the campaign's audience, sends every push
// through Expo in batches of expoSendBatchSize, and records one
// PushCampaignRecipient per attempted send - all synchronously. Callers that
// need this to not block (the HTTP create handler, the scheduler) run it via
// `go`; the campaign's Status/SentCount/FailedCount are updated after each
// batch, so a client polling GetAll sees live progress rather than a single
// jump from "sending" to "sent".
func (s *pushCampaignService) SendCampaignNow(campaignID int) error {
	campaign, err := s.Repo.GetByID(campaignID)
	if err != nil {
		return err
	}
	if campaign.Status == models.PUSH_CAMPAIGN_STATUS_SENT {
		return pushcampaignerrors.ErrPushCampaignAlreadySent
	}

	subs, err := s.resolveRecipients(campaign.AudienceType, campaign.AudiencePubID, campaign.AudienceInactiveDays)
	if err != nil {
		return err
	}
	if len(subs) == 0 {
		campaign.Status = models.PUSH_CAMPAIGN_STATUS_FAILED
		if _, err := s.Repo.Update(campaign); err != nil {
			// Not returned - ErrNoRecipientsForAudience is the real reason
			// this failed and is what the caller should see/log. But if this
			// write itself failed, the campaign is left at its old status
			// (e.g. still "scheduled") rather than "failed", so it's worth a
			// line in the logs to explain a campaign that looks stuck later.
			fmt.Println("push campaign: failed to mark empty-audience campaign as failed:", campaign.ID, err)
		}
		return pushcampaignerrors.ErrNoRecipientsForAudience
	}

	campaign.Status = models.PUSH_CAMPAIGN_STATUS_SENDING
	campaign.RecipientCount = len(subs)
	campaign, err = s.Repo.Update(campaign)
	if err != nil {
		return err
	}

	data := buildPushData(campaign)
	ttlSeconds := campaign.TTLHours * 3600
	priority := priorityOrDefault(campaign.Priority)

	pushClient := expo.NewPushClient(nil)
	sentCount, failedCount := 0, 0

	for i := 0; i < len(subs); i += expoSendBatchSize {
		end := i + expoSendBatchSize
		if end > len(subs) {
			end = len(subs)
		}
		subBatch := subs[i:end]

		// One pending recipient row per subscriber, created *before* sending -
		// its id has to exist so it can ride along inside that subscriber's
		// own push as `deliveryID` (same two-phase reasoning as
		// notificationservice.SendNotification). A batch that fails to even
		// create its rows can't be sent with tracking, so it's counted
		// failed and skipped rather than sent untracked.
		pendingRecipients := make([]models.PushCampaignRecipient, len(subBatch))
		for j, sub := range subBatch {
			pendingRecipients[j] = models.PushCampaignRecipient{
				PushCampaignID: campaign.ID,
				ClientID:       sub.ClientID,
				ExpoToken:      sub.ExpoNotificationToken,
				Status:         models.PUSH_CAMPAIGN_RECIPIENT_STATUS_PENDING,
			}
		}
		if err := s.Repo.CreateRecipients(pendingRecipients); err != nil {
			fmt.Println("push campaign: failed to create pending recipient batch:", err)
			failedCount += len(subBatch)
			campaign.FailedCount = failedCount
			campaign, _ = s.Repo.Update(campaign)
			continue
		}

		messages := make([]expo.PushMessage, 0, len(subBatch))
		for j, sub := range subBatch {
			title, body := campaign.TitleRu, campaign.BodyRu
			if sub.Lang == models.NOTIFICATION_LANG_RO {
				title, body = campaign.TitleRo, campaign.BodyRo
			}

			messageData := make(map[string]string, len(data)+1)
			for k, v := range data {
				messageData[k] = v
			}
			messageData["deliveryID"] = strconv.Itoa(int(pendingRecipients[j].ID))

			messages = append(messages, expo.PushMessage{
				To:         []expo.ExponentPushToken{expo.ExponentPushToken(sub.ExpoNotificationToken)},
				Title:      title,
				Body:       body,
				Sound:      "default",
				Priority:   priority,
				TTLSeconds: ttlSeconds,
				Data:       messageData,
			})
		}

		responses, err := pushClient.PublishMultiple(messages)
		if err != nil {
			// The whole batch failed to even reach Expo (network error,
			// malformed token before Expo's own per-message validation) -
			// finalize every recipient in this batch as failed and move on;
			// a batch failing does not stop the rest of the campaign.
			for j := range subBatch {
				failedCount++
				if updateErr := s.Repo.UpdateRecipientTicket(pendingRecipients[j].ID, pendingRecipients[j].ExpoToken, "", models.PUSH_CAMPAIGN_RECIPIENT_STATUS_FAILED); updateErr != nil {
					fmt.Println("push campaign: failed to finalize failed recipient:", updateErr)
				}
			}
		} else {
			for j, resp := range responses {
				status := models.PUSH_CAMPAIGN_RECIPIENT_STATUS_SENT
				if resp.Status != expo.SuccessStatus {
					status = models.PUSH_CAMPAIGN_RECIPIENT_STATUS_FAILED
					failedCount++
				} else {
					sentCount++
				}
				if updateErr := s.Repo.UpdateRecipientTicket(pendingRecipients[j].ID, pendingRecipients[j].ExpoToken, resp.ID, status); updateErr != nil {
					fmt.Println("push campaign: failed to finalize recipient:", updateErr)
				}
			}
		}

		campaign.SentCount = sentCount
		campaign.FailedCount = failedCount
		campaign, _ = s.Repo.Update(campaign)
	}

	now := time.Now()
	campaign.Status = models.PUSH_CAMPAIGN_STATUS_SENT
	campaign.SentAt = &now
	_, err = s.Repo.Update(campaign)
	return err
}

// SendTest reaches every device that phone is subscribed on - a single
// `.First()` lookup used to be enough back when logging in on a new device
// overwrote the one existing row, but subscriptions are device-keyed now
// (see the model comment), so the phone testing this could easily have more
// than one live subscription (e.g. an old phone that's still technically
// logged in, and the new one actually in hand) and a test send should prove
// out the copy/deep-link on whichever device the admin is actually holding.
func (s *pushCampaignService) SendTest(input TestSendInput) error {
	subs, err := s.NotificationRepo.GetSubscriptionsByPhone(input.Phone)
	if err != nil {
		return pushcampaignerrors.ErrTestRecipientNotSubscribed
	}

	data := buildPushData(models.PushCampaign{
		DeepLinkType:    input.DeepLinkType,
		DeepLinkPubID:   input.DeepLinkPubID,
		DeepLinkOrderID: input.DeepLinkOrderID,
		DeepLinkDishID:  input.DeepLinkDishID,
		DeepLinkScreen:  input.DeepLinkScreen,
		DeepLinkURL:     input.DeepLinkURL,
	})

	pushClient := expo.NewPushClient(nil)

	var lastErr error
	sentToAny := false
	for _, sub := range subs {
		title, body := input.TitleRu, input.BodyRu
		if sub.Lang == models.NOTIFICATION_LANG_RO {
			title, body = input.TitleRo, input.BodyRo
		}

		_, sendErr := pushClient.Publish(&expo.PushMessage{
			To:       []expo.ExponentPushToken{expo.ExponentPushToken(sub.ExpoNotificationToken)},
			Title:    title,
			Body:     body,
			Sound:    "default",
			Priority: expo.DefaultPriority,
			Data:     data,
		})
		if sendErr != nil {
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

func (s *pushCampaignService) MarkOpened(campaignID, clientID int) error {
	recipient, err := s.Repo.GetRecipientForCampaignAndClient(campaignID, clientID)
	if err != nil {
		return err
	}
	if recipient.OpenedAt != nil {
		return nil // already recorded - a tap can fire this more than once
	}
	if err := s.Repo.MarkRecipientOpened(recipient.ID, time.Now()); err != nil {
		return err
	}
	return s.Repo.IncrementOpenedCount(recipient.PushCampaignID)
}

// RecordIndividualSend gives a one-off push the same tracking row a campaign
// recipient gets (PushCampaignID 0 - see the model comment) after the fact -
// for callers with no data payload to correlate a later received/opened
// report against, so there's no need to know the row's id before sending.
func (s *pushCampaignService) RecordIndividualSend(clientID int, expoToken, ticketID, status string) (models.PushCampaignRecipient, error) {
	return s.Repo.CreateRecipient(models.PushCampaignRecipient{
		PushCampaignID: 0,
		ClientID:       clientID,
		ExpoToken:      expoToken,
		TicketID:       ticketID,
		Status:         status,
	})
}

// CreatePendingIndividualSend/FinalizeIndividualSend split the same tracking
// row across the send: a caller that wants recipient.ID inside the push's own
// Data (so the client can report received/opened against a specific
// notification, not just "some push from this client") needs that id before
// Expo is ever called, but the ticket/status it also needs to record only
// exist after. Create the row first with a pending status, read its id into
// the payload, send, then fill in what the send actually produced.
func (s *pushCampaignService) CreatePendingIndividualSend(clientID int) (models.PushCampaignRecipient, error) {
	return s.Repo.CreateRecipient(models.PushCampaignRecipient{
		PushCampaignID: 0,
		ClientID:       clientID,
		Status:         models.PUSH_CAMPAIGN_RECIPIENT_STATUS_PENDING,
	})
}

func (s *pushCampaignService) FinalizeIndividualSend(recipientID uint, expoToken, ticketID, status string) error {
	return s.Repo.UpdateRecipientTicket(recipientID, expoToken, ticketID, status)
}

func (s *pushCampaignService) MarkReceivedByRecipient(recipientID, clientID int) error {
	recipient, err := s.Repo.GetRecipientByID(recipientID)
	if err != nil {
		return err
	}
	if recipient.ClientID != clientID {
		return pushcampaignerrors.ErrPushCampaignNotFound
	}
	if recipient.ReceivedAt != nil {
		return nil // the received listener can fire more than once for one push
	}
	if err := s.Repo.MarkRecipientReceived(recipient.ID, time.Now()); err != nil {
		return err
	}
	if recipient.PushCampaignID == 0 {
		return nil
	}
	return s.Repo.IncrementReceivedCount(recipient.PushCampaignID)
}

func (s *pushCampaignService) MarkOpenedByRecipient(recipientID, clientID int) error {
	recipient, err := s.Repo.GetRecipientByID(recipientID)
	if err != nil {
		return err
	}
	if recipient.ClientID != clientID {
		return pushcampaignerrors.ErrPushCampaignNotFound
	}
	if recipient.OpenedAt != nil {
		return nil
	}
	if err := s.Repo.MarkRecipientOpened(recipient.ID, time.Now()); err != nil {
		return err
	}
	if recipient.PushCampaignID == 0 {
		return nil
	}
	return s.Repo.IncrementOpenedCount(recipient.PushCampaignID)
}

func (s *pushCampaignService) RunScheduler() {
	ticker := time.NewTicker(1 * time.Minute)
	for range ticker.C {
		due, err := s.Repo.GetDueCampaigns(time.Now())
		if err != nil {
			continue
		}
		for _, campaign := range due {
			id := int(campaign.ID)
			go func() {
				if err := s.SendCampaignNow(id); err != nil {
					fmt.Println("scheduled push campaign send failed:", id, err)
				}
			}()
		}
	}
}

type expoReceipt struct {
	Status  string                 `json:"status"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details"`
}

type expoReceiptsResponse struct {
	Data map[string]expoReceipt `json:"data"`
}

func fetchExpoReceipts(ticketIDs []string) (map[string]expoReceipt, error) {
	body, err := json.Marshal(map[string][]string{"ids": ticketIDs})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", expoReceiptsURL, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("expo getReceipts failed with status %d", resp.StatusCode)
	}

	var parsed expoReceiptsResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, err
	}
	return parsed.Data, nil
}

func (s *pushCampaignService) RunReceiptPoller() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		s.checkPendingReceipts()
	}
}

func (s *pushCampaignService) checkPendingReceipts() {
	now := time.Now()
	// Give Expo a couple minutes to actually generate the receipt, and
	// don't bother with anything older than ~20h - Expo stops serving
	// receipts for tickets after about a day.
	recipients, err := s.Repo.GetRecipientsPendingReceiptCheck(now.Add(-2*time.Minute), now.Add(-20*time.Hour), 3000)
	if err != nil || len(recipients) == 0 {
		return
	}

	ticketToRecipient := make(map[string]models.PushCampaignRecipient, len(recipients))
	ticketIDs := make([]string, 0, len(recipients))
	for _, r := range recipients {
		if r.TicketID == "" {
			continue
		}
		ticketToRecipient[r.TicketID] = r
		ticketIDs = append(ticketIDs, r.TicketID)
	}

	deliveredDeltaByCampaign := make(map[uint]int)

	for i := 0; i < len(ticketIDs); i += expoReceiptsBatchSize {
		end := i + expoReceiptsBatchSize
		if end > len(ticketIDs) {
			end = len(ticketIDs)
		}
		batch := ticketIDs[i:end]

		receipts, err := fetchExpoReceipts(batch)
		if err != nil {
			fmt.Println("push campaign: fetchExpoReceipts failed:", err)
			continue
		}

		checkedAt := time.Now()
		for ticketID, receipt := range receipts {
			recipient, ok := ticketToRecipient[ticketID]
			if !ok {
				continue
			}
			status := models.PUSH_CAMPAIGN_RECIPIENT_STATUS_DELIVERED
			if receipt.Status != expo.SuccessStatus {
				status = models.PUSH_CAMPAIGN_RECIPIENT_STATUS_UNDELIVERED
				// DeviceNotRegistered means Apple/Google told Expo the
				// install is gone for good (uninstalled, token revoked) -
				// Expo's own guidance is to stop sending to it. Left
				// unpruned, the exact same dead token fails this same way
				// on every future send/campaign, forever.
				if errorCode, _ := receipt.Details["error"].(string); errorCode == "DeviceNotRegistered" {
					if err := s.NotificationRepo.DeleteSubscriptionByToken(recipient.ExpoToken); err != nil {
						fmt.Println("push campaign: failed to prune DeviceNotRegistered token:", err)
					}
				}
			} else {
				deliveredDeltaByCampaign[recipient.PushCampaignID]++
			}
			if err := s.Repo.UpdateRecipientDeliveryStatus(recipient.ID, status, checkedAt); err != nil {
				fmt.Println("push campaign: failed to update recipient delivery status:", err)
			}
		}
	}

	for campaignID, delta := range deliveredDeltaByCampaign {
		if err := s.Repo.IncrementDeliveredCount(campaignID, delta); err != nil {
			fmt.Println("push campaign: failed to increment delivered count:", err)
		}
	}
}
