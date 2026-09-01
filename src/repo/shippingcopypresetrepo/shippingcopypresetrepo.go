package shippingcopypresetrepo

import (
	"time"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/shippingcopypreseterrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type ShippingCopyPresetRepo interface {
	GetAll() ([]models.ShippingCopyPreset, error)
	GetByID(id int) (models.ShippingCopyPreset, error)
	Create(preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error)
	Update(id int, preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error)
	Delete(id int) error
	TouchLastApplied(id int) error
}

type shippingCopyPresetRepo struct {
	Database *gorm.DB
}

func New() ShippingCopyPresetRepo {
	return &shippingCopyPresetRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *shippingCopyPresetRepo) GetAll() ([]models.ShippingCopyPreset, error) {
	presets := make([]models.ShippingCopyPreset, 0)
	result := r.Database.Order("id desc").Find(&presets)
	if result.Error != nil {
		return nil, shippingcopypreseterrors.ErrUnableToGetShippingCopyPreset
	}

	return presets, nil
}

func (r *shippingCopyPresetRepo) GetByID(id int) (models.ShippingCopyPreset, error) {
	var preset models.ShippingCopyPreset
	result := r.Database.First(&preset, "id = ?", id)
	if result.Error != nil {
		return models.ShippingCopyPreset{}, shippingcopypreseterrors.ErrShippingCopyPresetNotFound
	}

	return preset, nil
}

func (r *shippingCopyPresetRepo) Create(preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error) {
	result := r.Database.Create(&preset)
	if result.Error != nil {
		return models.ShippingCopyPreset{}, shippingcopypreseterrors.ErrUnableToCreateShippingCopyPreset
	}

	return preset, nil
}

func (r *shippingCopyPresetRepo) Update(id int, preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error) {
	result := r.Database.
		Model(&models.ShippingCopyPreset{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":                  preset.Name,
			"donor_pub_id":          preset.DonorPubID,
			"target_pub_ids_json":   preset.TargetPubIDsJSON,
			"copy_zones_and_prices": preset.CopyZonesAndPrices,
			"copy_availability":     preset.CopyAvailability,
			"copy_delivery_time":    preset.CopyDeliveryTime,
			"copy_work_hours":       preset.CopyWorkHours,
			"copy_commission":       preset.CopyCommission,
		})
	if result.Error != nil {
		return models.ShippingCopyPreset{}, shippingcopypreseterrors.ErrUnableToUpdateShippingCopyPreset
	}

	return r.GetByID(id)
}

func (r *shippingCopyPresetRepo) Delete(id int) error {
	result := r.Database.Delete(&models.ShippingCopyPreset{}, id)
	if result.Error != nil {
		return shippingcopypreseterrors.ErrUnableToDeleteShippingCopyPreset
	}

	return nil
}

func (r *shippingCopyPresetRepo) TouchLastApplied(id int) error {
	now := time.Now()
	result := r.Database.
		Model(&models.ShippingCopyPreset{}).
		Where("id = ?", id).
		UpdateColumn("last_applied_at", now)
	if result.Error != nil {
		return shippingcopypreseterrors.ErrUnableToUpdateShippingCopyPreset
	}

	return nil
}
