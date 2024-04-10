package models

import (
	"time"

	"gorm.io/gorm"
)

const (
	BURGER_PUB_TYPE = "burger"
	PIZZA_PUB_TYPE  = "pizza"
	SUSHI_PUB_TYPE  = "sushi"
	DRINKS_PUB_TYPE = "drinks"
)

type Pub struct {
	gorm.Model
	UrlName         string
	Name            string
	QrCodeFileName  string
	ColorTheme      string
	Color           string
	BgImageFileName string
	LogoFileName    string
	WifiPassword    string
	Address         string
	AdditionalInfo  string

	Lat float64
	Lng float64

	Menus []Menu

	CurrencyID uint
	Currency   Currency
	CompanyID  uint
	Company    Company

	ShippingID uint
	Shipping   Shipping

	PreorderInfoID uint
	PreorderInfo   PreorderInfo

	PubType string

	ExpirationTime time.Time
}
