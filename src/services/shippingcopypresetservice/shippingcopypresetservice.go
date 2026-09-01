package shippingcopypresetservice

import (
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/shippingcopypresetrepo"
)

type ShippingCopyPresetService interface {
	GetAll() ([]models.ShippingCopyPreset, error)
	Create(preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error)
	Update(id int, preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error)
	Delete(id int) error
	TouchLastApplied(id int) (models.ShippingCopyPreset, error)
}

type shippingCopyPresetService struct {
	Repo shippingcopypresetrepo.ShippingCopyPresetRepo
}

func New() ShippingCopyPresetService {
	return &shippingCopyPresetService{
		Repo: shippingcopypresetrepo.New(),
	}
}

func (s *shippingCopyPresetService) GetAll() ([]models.ShippingCopyPreset, error) {
	return s.Repo.GetAll()
}

func (s *shippingCopyPresetService) Create(preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error) {
	return s.Repo.Create(preset)
}

func (s *shippingCopyPresetService) Update(id int, preset models.ShippingCopyPreset) (models.ShippingCopyPreset, error) {
	return s.Repo.Update(id, preset)
}

func (s *shippingCopyPresetService) Delete(id int) error {
	return s.Repo.Delete(id)
}

func (s *shippingCopyPresetService) TouchLastApplied(id int) (models.ShippingCopyPreset, error) {
	if err := s.Repo.TouchLastApplied(id); err != nil {
		return models.ShippingCopyPreset{}, err
	}

	return s.Repo.GetByID(id)
}
