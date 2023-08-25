package currencyrepo

import (
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/currencyerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

func Configure() error {
	return nil
}

type CurrencyRepo interface {
	GetCurrencyByID(id int) (models.Currency, error)
}

type currencyRepo struct {
	Database *gorm.DB
}

func New() CurrencyRepo {
	return &currencyRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *currencyRepo) GetCurrencyByID(id int) (models.Currency, error) {
	var currency models.Currency
	result := r.Database.First(&currency, "id = ?", id)

	if result.Error != nil {
		return models.Currency{}, currencyerrors.ErrCurrencyNotFound
	}

	return currency, nil
}

func (r *currencyRepo) GetCurrencyByName(name string) (models.Currency, error) {
	var currency models.Currency
	result := r.Database.First(&currency, "name = ?", name)

	if result.Error != nil {
		return models.Currency{}, currencyerrors.ErrCurrencyNotFound
	}

	return currency, nil
}
