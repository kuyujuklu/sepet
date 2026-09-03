package models

import "time"

const (
	PUSH_CAMPAIGN_STATUS_SCHEDULED = "scheduled"
	PUSH_CAMPAIGN_STATUS_SENDING   = "sending"
	PUSH_CAMPAIGN_STATUS_SENT      = "sent"
	PUSH_CAMPAIGN_STATUS_FAILED    = "failed"
	PUSH_CAMPAIGN_STATUS_CANCELED  = "canceled"
)

// Deep link that a tap on the push should open - kept as discrete typed
// fields (not a pre-built URL string) since the mobile app's
// resolveDestinationFromFields already accepts a plain {path, pubID,
// pubName, orderID} object, so the same shape can go straight into the
// Expo message's Data map without a URL-encode/decode round trip.
const (
	PUSH_CAMPAIGN_DEEP_LINK_NONE   = "none"
	PUSH_CAMPAIGN_DEEP_LINK_PUB    = "pub"
	PUSH_CAMPAIGN_DEEP_LINK_ORDER  = "order"
	PUSH_CAMPAIGN_DEEP_LINK_DISH   = "dish"
	PUSH_CAMPAIGN_DEEP_LINK_SCREEN = "screen"
	PUSH_CAMPAIGN_DEEP_LINK_URL    = "url"
)

// Who receives the campaign. Every option besides "all" is resolved at send
// time from data that already exists (orders.client_id/pub_id/created_at) -
// no new tracking table needed, unlike delivered/opened below.
const (
	PUSH_CAMPAIGN_AUDIENCE_ALL           = "all"
	PUSH_CAMPAIGN_AUDIENCE_PUB_CUSTOMERS = "pub_customers"
	PUSH_CAMPAIGN_AUDIENCE_INACTIVE      = "inactive"
	PUSH_CAMPAIGN_AUDIENCE_FIRST_TIME    = "first_time"
	PUSH_CAMPAIGN_AUDIENCE_FREQUENT      = "frequent"
)

const (
	PUSH_CAMPAIGN_PRIORITY_DEFAULT = "default"
	PUSH_CAMPAIGN_PRIORITY_HIGH    = "high"
)

// A push notification blast composed in the superadmin panel. Recipients are
// resolved fresh at send time from the audience fields below (not stored on
// the campaign itself) - see PushCampaignRecipient for the per-recipient
// send/delivery/open record created once the campaign actually sends.
type PushCampaign struct {
	ID uint `gorm:"primaryKey"`

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

	Status      string
	ScheduledAt *time.Time
	SentAt      *time.Time

	// Snapshots written once sending starts/finishes - the history list
	// reads these directly rather than counting PushCampaignRecipient rows
	// on every list request.
	RecipientCount int
	SentCount      int
	FailedCount    int
	DeliveredCount int
	OpenedCount    int

	CreatedAt time.Time
	UpdatedAt time.Time
}

const (
	PUSH_CAMPAIGN_RECIPIENT_STATUS_PENDING     = "pending"
	PUSH_CAMPAIGN_RECIPIENT_STATUS_SENT        = "sent"
	PUSH_CAMPAIGN_RECIPIENT_STATUS_FAILED      = "failed"
	PUSH_CAMPAIGN_RECIPIENT_STATUS_DELIVERED   = "delivered"
	PUSH_CAMPAIGN_RECIPIENT_STATUS_UNDELIVERED = "undelivered"
)

// One row per client a campaign was actually sent to. TicketID is Expo's
// immediate send-time ticket id (PushResponse.ID) - the receipt poller
// later exchanges it for a real delivery receipt (see pushcampaignservice's
// RunReceiptPoller), since the vendored Expo SDK has no receipt-fetching
// method of its own.
type PushCampaignRecipient struct {
	ID uint `gorm:"primaryKey"`

	PushCampaignID uint
	ClientID       int
	ExpoToken      string

	TicketID string
	Status   string

	DeliveryCheckedAt *time.Time
	OpenedAt          *time.Time

	CreatedAt time.Time
	UpdatedAt time.Time
}
