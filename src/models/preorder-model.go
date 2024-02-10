package models

type PreorderInfo struct {
	ID           uint
	CardPreorder bool
	CashPreorder bool
}

func (p *PreorderInfo) IsAvailable() bool {
	return p.CardPreorder || p.CashPreorder
}
