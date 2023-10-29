package tariffservice

import (
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/tariffrepo"
)

type TariffService interface {
	GetTariffByName(name string) (models.Tariff, error)
	GetTariffByID(id int) (models.Tariff, error)
}

type roleService struct {
	TariffRepo tariffrepo.TariffRepo
}

func New() TariffService {
	return &roleService{
		TariffRepo: tariffrepo.New(),
	}
}

func (s *roleService) GetTariffByName(name string) (models.Tariff, error) {
	return s.TariffRepo.GetTariffByName(name)
}

func (s *roleService) GetTariffByID(id int) (models.Tariff, error) {
	return s.TariffRepo.GetTariffByID(id)
}
