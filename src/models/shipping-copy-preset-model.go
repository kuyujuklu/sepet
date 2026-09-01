package models

import "time"

// A saved "copy this pub's shipping zones/prices/etc onto these other pubs"
// job (see AdministrationShipping.jsx's donor/target tool). Presets store
// only the donor/target ids and which fields to copy, not a snapshot of the
// donor's actual zones - applying always reads the donor's current shapes/
// prices, same as a one-off copy does, so re-applying a preset later (e.g.
// for a recurring "free delivery day" promo) picks up whatever the donor
// pub is configured with at that moment.
type ShippingCopyPreset struct {
	ID                 uint `gorm:"primaryKey"`
	Name               string
	DonorPubID         uint
	TargetPubIDsJSON   string // JSON of []int
	CopyZonesAndPrices bool
	CopyAvailability   bool
	CopyDeliveryTime   bool
	CopyWorkHours      bool
	CopyCommission     bool
	LastAppliedAt      *time.Time
	CreatedAt          time.Time
	UpdatedAt          time.Time
}
