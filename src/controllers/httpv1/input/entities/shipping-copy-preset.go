package entities

import (
	"encoding/json"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type ShippingCopyPresetInput struct {
	Name               string `json:"name" validate:"required" example:"Chisinau free-delivery day"`
	DonorPubID         int    `json:"donor_pub_id" validate:"required" example:"71"`
	TargetPubIDs       []int  `json:"target_pub_ids" validate:"required,min=1"`
	CopyZonesAndPrices bool   `json:"copy_zones_and_prices"`
	CopyAvailability   bool   `json:"copy_availability"`
	CopyDeliveryTime   bool   `json:"copy_delivery_time"`
	CopyWorkHours      bool   `json:"copy_work_hours"`
	CopyCommission     bool   `json:"copy_commission"`
}

func (i *ShippingCopyPresetInput) ConvertToModel() (models.ShippingCopyPreset, error) {
	targetPubIDsJSON, err := json.Marshal(i.TargetPubIDs)
	if err != nil {
		return models.ShippingCopyPreset{}, err
	}

	return models.ShippingCopyPreset{
		Name:               i.Name,
		DonorPubID:         uint(i.DonorPubID),
		TargetPubIDsJSON:   string(targetPubIDsJSON),
		CopyZonesAndPrices: i.CopyZonesAndPrices,
		CopyAvailability:   i.CopyAvailability,
		CopyDeliveryTime:   i.CopyDeliveryTime,
		CopyWorkHours:      i.CopyWorkHours,
		CopyCommission:     i.CopyCommission,
	}, nil
}

type ShippingCopyPresetOutput struct {
	ID                 int     `json:"id" example:"1"`
	Name               string  `json:"name" example:"Chisinau free-delivery day"`
	DonorPubID         int     `json:"donor_pub_id" example:"71"`
	TargetPubIDs       []int   `json:"target_pub_ids"`
	CopyZonesAndPrices bool    `json:"copy_zones_and_prices"`
	CopyAvailability   bool    `json:"copy_availability"`
	CopyDeliveryTime   bool    `json:"copy_delivery_time"`
	CopyWorkHours      bool    `json:"copy_work_hours"`
	CopyCommission     bool    `json:"copy_commission"`
	LastAppliedAtUTC   *string `json:"last_applied_at_utc"`
	CreatedAtUTC       string  `json:"created_at_utc"`
	UpdatedAtUTC       string  `json:"updated_at_utc"`
}

func (o *ShippingCopyPresetOutput) FillFromModel(m models.ShippingCopyPreset) error {
	targetPubIDs := make([]int, 0)
	if m.TargetPubIDsJSON != "" {
		if err := json.Unmarshal([]byte(m.TargetPubIDsJSON), &targetPubIDs); err != nil {
			return err
		}
	}

	o.ID = int(m.ID)
	o.Name = m.Name
	o.DonorPubID = int(m.DonorPubID)
	o.TargetPubIDs = targetPubIDs
	o.CopyZonesAndPrices = m.CopyZonesAndPrices
	o.CopyAvailability = m.CopyAvailability
	o.CopyDeliveryTime = m.CopyDeliveryTime
	o.CopyWorkHours = m.CopyWorkHours
	o.CopyCommission = m.CopyCommission
	o.CreatedAtUTC = helpers.ConvertToStandardApiTime(m.CreatedAt)
	o.UpdatedAtUTC = helpers.ConvertToStandardApiTime(m.UpdatedAt)

	if m.LastAppliedAt != nil {
		lastApplied := helpers.ConvertToStandardApiTime(*m.LastAppliedAt)
		o.LastAppliedAtUTC = &lastApplied
	}

	return nil
}
