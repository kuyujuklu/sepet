package tariffrepo

import (
	"errors"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/tarifferrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

type TariffRepo interface {
	GetTariffByName(name string) (models.Tariff, error)
	GetTariffByID(id int) (models.Tariff, error)
}

type tariffRepo struct {
	Database *gorm.DB
}

func New() TariffRepo {
	return &tariffRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *tariffRepo) GetTariffByName(name string) (models.Tariff, error) {
	var tariff models.Tariff
	result := r.Database.First(&tariff, "name = ?", name)

	if result.Error != nil {
		return models.Tariff{}, tarifferrors.ErrTariffNotFound
	}

	return tariff, nil
}

func (r *tariffRepo) GetTariffByID(id int) (models.Tariff, error) {
	var tariff models.Tariff
	result := r.Database.First(&tariff, "id = ?", id)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.Tariff{}, tarifferrors.ErrTariffNotFound
		}
		return models.Tariff{}, tarifferrors.ErrUnableToGetTariff
	}

	return tariff, nil
}
