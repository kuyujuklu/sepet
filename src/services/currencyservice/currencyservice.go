package currencyservice

import (
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/currencyrepo"
)

type CurrencyService interface {
	GetCurrencyByID(id int) (models.Currency, error)
}

type currencyService struct {
	CurrencyRepo currencyrepo.CurrencyRepo
}

func New() CurrencyService {
	return &currencyService{
		CurrencyRepo: currencyrepo.New(),
	}
}

func (s *currencyService) GetCurrencyByID(id int) (models.Currency, error) {
	return s.CurrencyRepo.GetCurrencyByID(id)
}
