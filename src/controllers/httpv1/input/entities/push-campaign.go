package entities

import (
	"time"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/services/pushcampaignservice"
)

type PushCampaignInput struct {
	TitleRu string `json:"title_ru" validate:"required" example:"Скидка 20% сегодня"`
	TitleRo string `json:"title_ro" validate:"required" example:"Reducere 20% astăzi"`
	BodyRu  string `json:"body_ru" validate:"required"`
	BodyRo  string `json:"body_ro" validate:"required"`

	DeepLinkType    string `json:"deep_link_type" example:"pub"`
	DeepLinkPubID   int    `json:"deep_link_pub_id"`
	DeepLinkOrderID int    `json:"deep_link_order_id"`
	DeepLinkDishID  int    `json:"deep_link_dish_id"`
	DeepLinkScreen  string `json:"deep_link_screen"`
	DeepLinkURL     string `json:"deep_link_url"`

	AudienceType         string `json:"audience_type" example:"all"`
	AudiencePubID        int    `json:"audience_pub_id"`
	AudienceInactiveDays int    `json:"audience_inactive_days"`

	TTLHours int    `json:"ttl_hours"`
	Priority string `json:"priority" example:"default"`

	// RFC3339, e.g. "2026-09-05T14:30:00+03:00" - omitted or empty means
	// send immediately.
	ScheduledAt string `json:"scheduled_at"`
}

func (i *PushCampaignInput) ToServiceInput() (pushcampaignservice.CampaignInput, error) {
	input := pushcampaignservice.CampaignInput{
		TitleRu: i.TitleRu, TitleRo: i.TitleRo,
		BodyRu: i.BodyRu, BodyRo: i.BodyRo,

		DeepLinkType:    i.DeepLinkType,
		DeepLinkPubID:   i.DeepLinkPubID,
		DeepLinkOrderID: i.DeepLinkOrderID,
		DeepLinkDishID:  i.DeepLinkDishID,
		DeepLinkScreen:  i.DeepLinkScreen,
		DeepLinkURL:     i.DeepLinkURL,

		AudienceType:         i.AudienceType,
		AudiencePubID:        i.AudiencePubID,
		AudienceInactiveDays: i.AudienceInactiveDays,

		TTLHours: i.TTLHours,
		Priority: i.Priority,
	}

	if i.ScheduledAt != "" {
		parsed, err := time.Parse(time.RFC3339, i.ScheduledAt)
		if err != nil {
			return pushcampaignservice.CampaignInput{}, err
		}
		input.ScheduledAt = &parsed
	}

	return input, nil
}

type PushCampaignTestSendInput struct {
	Phone   string `json:"phone" validate:"required" example:"37360055555"`
	TitleRu string `json:"title_ru" validate:"required"`
	TitleRo string `json:"title_ro" validate:"required"`
	BodyRu  string `json:"body_ru" validate:"required"`
	BodyRo  string `json:"body_ro" validate:"required"`

	DeepLinkType    string `json:"deep_link_type"`
	DeepLinkPubID   int    `json:"deep_link_pub_id"`
	DeepLinkOrderID int    `json:"deep_link_order_id"`
	DeepLinkDishID  int    `json:"deep_link_dish_id"`
	DeepLinkScreen  string `json:"deep_link_screen"`
	DeepLinkURL     string `json:"deep_link_url"`
}

func (i *PushCampaignTestSendInput) ToServiceInput() pushcampaignservice.TestSendInput {
	return pushcampaignservice.TestSendInput{
		Phone:   i.Phone,
		TitleRu: i.TitleRu, TitleRo: i.TitleRo,
		BodyRu: i.BodyRu, BodyRo: i.BodyRo,

		DeepLinkType:    i.DeepLinkType,
		DeepLinkPubID:   i.DeepLinkPubID,
		DeepLinkOrderID: i.DeepLinkOrderID,
		DeepLinkDishID:  i.DeepLinkDishID,
		DeepLinkScreen:  i.DeepLinkScreen,
		DeepLinkURL:     i.DeepLinkURL,
	}
}

type PushCampaignOutput struct {
	ID int `json:"id" example:"1"`

	TitleRu string `json:"title_ru"`
	TitleRo string `json:"title_ro"`
	BodyRu  string `json:"body_ru"`
	BodyRo  string `json:"body_ro"`

	DeepLinkType    string `json:"deep_link_type"`
	DeepLinkPubID   int    `json:"deep_link_pub_id"`
	DeepLinkOrderID int    `json:"deep_link_order_id"`
	DeepLinkDishID  int    `json:"deep_link_dish_id"`
	DeepLinkScreen  string `json:"deep_link_screen"`
	DeepLinkURL     string `json:"deep_link_url"`

	AudienceType         string `json:"audience_type"`
	AudiencePubID        int    `json:"audience_pub_id"`
	AudienceInactiveDays int    `json:"audience_inactive_days"`

	TTLHours int    `json:"ttl_hours"`
	Priority string `json:"priority"`

	Status         string  `json:"status"`
	ScheduledAtUTC *string `json:"scheduled_at_utc"`
	SentAtUTC      *string `json:"sent_at_utc"`

	RecipientCount int `json:"recipient_count"`
	SentCount      int `json:"sent_count"`
	FailedCount    int `json:"failed_count"`
	DeliveredCount int `json:"delivered_count"`
	OpenedCount    int `json:"opened_count"`

	CreatedAtUTC string `json:"created_at_utc"`
}

func (o *PushCampaignOutput) FillFromModel(m models.PushCampaign) {
	o.ID = int(m.ID)

	o.TitleRu, o.TitleRo = m.TitleRu, m.TitleRo
	o.BodyRu, o.BodyRo = m.BodyRu, m.BodyRo

	o.DeepLinkType = m.DeepLinkType
	o.DeepLinkPubID = m.DeepLinkPubID
	o.DeepLinkOrderID = m.DeepLinkOrderID
	o.DeepLinkDishID = m.DeepLinkDishID
	o.DeepLinkScreen = m.DeepLinkScreen
	o.DeepLinkURL = m.DeepLinkURL

	o.AudienceType = m.AudienceType
	o.AudiencePubID = m.AudiencePubID
	o.AudienceInactiveDays = m.AudienceInactiveDays

	o.TTLHours = m.TTLHours
	o.Priority = m.Priority

	o.Status = m.Status
	if m.ScheduledAt != nil {
		v := helpers.ConvertToStandardApiTime(*m.ScheduledAt)
		o.ScheduledAtUTC = &v
	}
	if m.SentAt != nil {
		v := helpers.ConvertToStandardApiTime(*m.SentAt)
		o.SentAtUTC = &v
	}

	o.RecipientCount = m.RecipientCount
	o.SentCount = m.SentCount
	o.FailedCount = m.FailedCount
	o.DeliveredCount = m.DeliveredCount
	o.OpenedCount = m.OpenedCount

	o.CreatedAtUTC = helpers.ConvertToStandardApiTime(m.CreatedAt)
}
