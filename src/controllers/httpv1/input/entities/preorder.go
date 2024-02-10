package entities

import (
	"github.com/alexkalak/qrmenu/src/models"
)

type SetPubPreorder struct {
	CardPreorder bool `json:"card_preorder"`
	CashPreorder bool `json:"cash_preorder"`
}

func (p *SetPubPreorder) ConvertToModel() models.PreorderInfo {
	return models.PreorderInfo{
		CardPreorder: p.CardPreorder,
		CashPreorder: p.CashPreorder,
	}
}
