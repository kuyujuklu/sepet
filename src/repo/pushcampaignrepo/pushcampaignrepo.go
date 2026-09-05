package pushcampaignrepo

import (
	"errors"
	"time"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/pushcampaignerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

type PushCampaignRepo interface {
	Create(campaign models.PushCampaign) (models.PushCampaign, error)
	GetByID(id int) (models.PushCampaign, error)
	GetAll() ([]models.PushCampaign, error)
	Update(campaign models.PushCampaign) (models.PushCampaign, error)
	GetDueCampaigns(now time.Time) ([]models.PushCampaign, error)
	IncrementDeliveredCount(campaignID uint, delta int) error
	IncrementOpenedCount(campaignID uint) error

	CreateRecipients(recipients []models.PushCampaignRecipient) error
	CreateRecipient(recipient models.PushCampaignRecipient) (models.PushCampaignRecipient, error)
	UpdateRecipientTicket(id uint, expoToken, ticketID, status string) error
	GetRecipientByID(id int) (models.PushCampaignRecipient, error)
	GetRecipientForCampaignAndClient(campaignID, clientID int) (models.PushCampaignRecipient, error)
	MarkRecipientOpened(id uint, openedAt time.Time) error
	MarkRecipientReceived(id uint, receivedAt time.Time) error
	IncrementReceivedCount(campaignID uint) error
	UpdateRecipientDeliveryStatus(id uint, status string, checkedAt time.Time) error
	GetRecipientsPendingReceiptCheck(readyBefore time.Time, expireAfter time.Time, limit int) ([]models.PushCampaignRecipient, error)

	// Audience resolution - every segment besides "all" reads straight off
	// the orders table (client_id/pub_id/created_at), no new tracking
	// needed. Returns the eligible client ids for the given segment; the
	// service layer intersects this with clients who actually have a live
	// push subscription.
	ResolveAudienceClientIDs(audienceType string, pubID int, inactiveDays int) ([]int, error)
}

type pushCampaignRepo struct {
	Database *gorm.DB
}

func New() PushCampaignRepo {
	return &pushCampaignRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *pushCampaignRepo) Create(campaign models.PushCampaign) (models.PushCampaign, error) {
	result := r.Database.Create(&campaign)
	if result.Error != nil {
		return models.PushCampaign{}, pushcampaignerrors.ErrUnableToCreatePushCampaign
	}
	return campaign, nil
}

func (r *pushCampaignRepo) GetByID(id int) (models.PushCampaign, error) {
	var campaign models.PushCampaign
	result := r.Database.First(&campaign, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.PushCampaign{}, pushcampaignerrors.ErrPushCampaignNotFound
		}
		return models.PushCampaign{}, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return campaign, nil
}

func (r *pushCampaignRepo) GetAll() ([]models.PushCampaign, error) {
	campaigns := make([]models.PushCampaign, 0)
	result := r.Database.Order("id desc").Find(&campaigns)
	if result.Error != nil {
		return nil, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return campaigns, nil
}

func (r *pushCampaignRepo) Update(campaign models.PushCampaign) (models.PushCampaign, error) {
	result := r.Database.Save(&campaign)
	if result.Error != nil {
		return models.PushCampaign{}, pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return campaign, nil
}

func (r *pushCampaignRepo) GetDueCampaigns(now time.Time) ([]models.PushCampaign, error) {
	campaigns := make([]models.PushCampaign, 0)
	result := r.Database.
		Where("status = ? AND scheduled_at IS NOT NULL AND scheduled_at <= ?", models.PUSH_CAMPAIGN_STATUS_SCHEDULED, now).
		Find(&campaigns)
	if result.Error != nil {
		return nil, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return campaigns, nil
}

func (r *pushCampaignRepo) IncrementDeliveredCount(campaignID uint, delta int) error {
	if delta == 0 {
		return nil
	}
	result := r.Database.Model(&models.PushCampaign{}).
		Where("id = ?", campaignID).
		UpdateColumn("delivered_count", gorm.Expr("delivered_count + ?", delta))
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) IncrementOpenedCount(campaignID uint) error {
	result := r.Database.Model(&models.PushCampaign{}).
		Where("id = ?", campaignID).
		UpdateColumn("opened_count", gorm.Expr("opened_count + 1"))
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) CreateRecipients(recipients []models.PushCampaignRecipient) error {
	if len(recipients) == 0 {
		return nil
	}
	result := r.Database.CreateInBatches(&recipients, 200)
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToCreatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) CreateRecipient(recipient models.PushCampaignRecipient) (models.PushCampaignRecipient, error) {
	result := r.Database.Create(&recipient)
	if result.Error != nil {
		return models.PushCampaignRecipient{}, pushcampaignerrors.ErrUnableToCreatePushCampaign
	}
	return recipient, nil
}

func (r *pushCampaignRepo) UpdateRecipientTicket(id uint, expoToken, ticketID, status string) error {
	result := r.Database.Model(&models.PushCampaignRecipient{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"expo_token": expoToken,
			"ticket_id":  ticketID,
			"status":     status,
		})
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) GetRecipientByID(id int) (models.PushCampaignRecipient, error) {
	var recipient models.PushCampaignRecipient
	result := r.Database.First(&recipient, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.PushCampaignRecipient{}, pushcampaignerrors.ErrPushCampaignNotFound
		}
		return models.PushCampaignRecipient{}, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return recipient, nil
}

func (r *pushCampaignRepo) GetRecipientForCampaignAndClient(campaignID, clientID int) (models.PushCampaignRecipient, error) {
	var recipient models.PushCampaignRecipient
	result := r.Database.First(&recipient, "push_campaign_id = ? AND client_id = ?", campaignID, clientID)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.PushCampaignRecipient{}, pushcampaignerrors.ErrPushCampaignNotFound
		}
		return models.PushCampaignRecipient{}, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return recipient, nil
}

func (r *pushCampaignRepo) MarkRecipientOpened(id uint, openedAt time.Time) error {
	result := r.Database.Model(&models.PushCampaignRecipient{}).
		Where("id = ?", id).
		UpdateColumn("opened_at", openedAt)
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) MarkRecipientReceived(id uint, receivedAt time.Time) error {
	result := r.Database.Model(&models.PushCampaignRecipient{}).
		Where("id = ?", id).
		UpdateColumn("received_at", receivedAt)
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) IncrementReceivedCount(campaignID uint) error {
	result := r.Database.Model(&models.PushCampaign{}).
		Where("id = ?", campaignID).
		UpdateColumn("received_count", gorm.Expr("received_count + 1"))
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

func (r *pushCampaignRepo) UpdateRecipientDeliveryStatus(id uint, status string, checkedAt time.Time) error {
	result := r.Database.Model(&models.PushCampaignRecipient{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":              status,
			"delivery_checked_at": checkedAt,
		})
	if result.Error != nil {
		return pushcampaignerrors.ErrUnableToUpdatePushCampaign
	}
	return nil
}

// GetRecipientsPendingReceiptCheck finds recipients whose ticket was
// accepted by Expo but never checked for a real delivery receipt yet -
// readyBefore excludes ones sent too recently for Expo to have generated a
// receipt, expireAfter excludes ones old enough that Expo has already
// discarded the receipt (~24h).
func (r *pushCampaignRepo) GetRecipientsPendingReceiptCheck(readyBefore time.Time, expireAfter time.Time, limit int) ([]models.PushCampaignRecipient, error) {
	recipients := make([]models.PushCampaignRecipient, 0)
	result := r.Database.
		Where("status = ? AND ticket_id != '' AND delivery_checked_at IS NULL AND created_at <= ? AND created_at >= ?",
			models.PUSH_CAMPAIGN_RECIPIENT_STATUS_SENT, readyBefore, expireAfter).
		Limit(limit).
		Find(&recipients)
	if result.Error != nil {
		return nil, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return recipients, nil
}

func (r *pushCampaignRepo) ResolveAudienceClientIDs(audienceType string, pubID int, inactiveDays int) ([]int, error) {
	ids := make([]int, 0)
	var result *gorm.DB

	switch audienceType {
	case models.PUSH_CAMPAIGN_AUDIENCE_PUB_CUSTOMERS:
		result = r.Database.Model(&models.Order{}).
			Where("pub_id = ?", pubID).
			Distinct("client_id").
			Pluck("client_id", &ids)

	case models.PUSH_CAMPAIGN_AUDIENCE_INACTIVE:
		cutoff := time.Now().AddDate(0, 0, -inactiveDays)
		result = r.Database.Model(&models.Order{}).
			Group("client_id").
			Having("MAX(created_at) < ?", cutoff).
			Pluck("client_id", &ids)

	case models.PUSH_CAMPAIGN_AUDIENCE_FIRST_TIME:
		result = r.Database.Model(&models.Order{}).
			Group("client_id").
			Having("COUNT(*) = 1").
			Pluck("client_id", &ids)

	case models.PUSH_CAMPAIGN_AUDIENCE_FREQUENT:
		result = r.Database.Model(&models.Order{}).
			Group("client_id").
			Having("COUNT(*) >= ?", 5).
			Pluck("client_id", &ids)

	default:
		return nil, pushcampaignerrors.ErrUnknownAudienceType
	}

	if result.Error != nil {
		return nil, pushcampaignerrors.ErrUnableToGetPushCampaign
	}
	return ids, nil
}
