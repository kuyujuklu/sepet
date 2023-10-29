package models

const (
	BASIC_TARIFF    = "basic"
	PRO_TARIFF      = "pro"
	BUSINESS_TARIFF = "business"
)

type Tariff struct {
	ID   uint
	Name string
}
