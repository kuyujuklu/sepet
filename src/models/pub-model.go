package models

import "gorm.io/gorm"

type Pub struct {
	gorm.Model
	Name            string
	QrCode          string
	ColorTheme      string
	Color           string
	BgImageFileName string
	LogoFileName    string
	WifiPassword    string
	Address         string
	AdditionalInfo  string

	Menus []Menu

	CurrencyID uint
	Currency   Currency
	CompanyID  uint
	Company    Company
}
