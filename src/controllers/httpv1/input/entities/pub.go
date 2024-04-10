package entities

import (
	"time"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
)

type CreatePubInput struct {
	UrlName string `json:"url_name" validate:"required,min=2" example:"my-pub-name"`
	Name    string `json:"name" validate:"required,min=2" example:"My pub name"`
}

func (p *CreatePubInput) ConvertToModel(companyID int) models.Pub {
	pub := models.Pub{
		CompanyID:  uint(companyID),
		Name:       p.Name,
		UrlName:    p.UrlName,
		Color:      "#dc4444",
		ColorTheme: "dark",
		CurrencyID: 1,
	}

	return pub
}

type UpdatePubInput struct {
	Name           string `json:"name" validate:"required,min=2" example:"My pub name"`
	ColorTheme     string `json:"color_theme" validate:"" example:"light"`
	Color          string `json:"color" validate:"" example:"#ffffff"`
	WifiPassword   string `json:"wifi_password" validate:"" example:"12345678"`
	Address        string `json:"address" validate:"" example:"My pub address"`
	AdditionalInfo string `json:"additional_info" validate:"" example:"My pub additional info"`

	CurrencyID int `json:"currency_id" example:"22"`
	CompanyID  int `json:"company_id" example:"1"`
}

func (p *UpdatePubInput) ConvertToModel(companyID int, pubID int) models.Pub {
	pub := models.Pub{
		CompanyID:      uint(companyID),
		CurrencyID:     uint(p.CurrencyID),
		Name:           p.Name,
		ColorTheme:     p.ColorTheme,
		Color:          p.Color,
		WifiPassword:   p.WifiPassword,
		Address:        p.Address,
		AdditionalInfo: p.AdditionalInfo,
	}

	pub.ID = uint(p.CompanyID)

	return pub
}

type PubOutput struct {
	ID              int            `json:"id" example:"1"`
	Expired         bool           `json:"expired" example:"false"`
	ExpirationTime  string         `json:"expiration_time_utc" example:""`
	Name            string         `json:"name" example:"My pub name"`
	UrlName         string         `json:"url_name" example:"my-pub-name"`
	QrCodeFileName  string         `json:"qr_code_file_name" example:"my-pub-name.png"`
	ColorTheme      string         `json:"color_theme" example:"light"`
	Color           string         `json:"color" example:"#ffffff"`
	BgImageFileName string         `json:"bg_image_file_name" example:"my-pub-name-bg.png"`
	LogoFileName    string         `json:"logo_file_name" example:"my-pub-name-logo.png"`
	WifiPassword    string         `json:"wifi_password" example:"12345678"`
	Address         string         `json:"address" example:"My pub address"`
	AdditionalInfo  string         `json:"additional_info" example:"My pub additional info"`
	ShippingOutput  ShippingOutput `json:"shipping"`
	Lat             float64        `json:"lat" example:"55.7558"`
	Lng             float64        `json:"lng" example:"37.6176"`
	CurrencyID      int            `json:"currency_id"`
	CompanyID       int            `json:"company_id"`
}

func (p *PubOutput) FillFromModel(pub models.Pub) error {
	if time.Now().Unix() > pub.ExpirationTime.Unix() {
		p.Expired = true
	}

	if pub.Shipping.Available {
		shippingOutput := ShippingOutput{}
		if err := shippingOutput.FillFromModel(pub.Shipping); err != nil {
			return err
		}

		p.ShippingOutput = shippingOutput
	}

	p.ExpirationTime = helpers.ConvertToStandardApiTime(pub.ExpirationTime)
	p.ID = int(pub.ID)
	p.Name = pub.Name
	p.UrlName = pub.UrlName
	p.QrCodeFileName = pub.QrCodeFileName
	p.ColorTheme = pub.ColorTheme
	p.Color = pub.Color
	p.BgImageFileName = pub.BgImageFileName
	p.LogoFileName = pub.LogoFileName
	p.WifiPassword = pub.WifiPassword
	p.Address = pub.Address
	p.AdditionalInfo = pub.AdditionalInfo
	p.CurrencyID = int(pub.CurrencyID)
	p.CompanyID = int(pub.CompanyID)
	p.Lat = pub.Lat
	p.Lng = pub.Lng

	return nil
}

type UpdateExpirationTimeInput struct {
	Days int `json:"days" validate:"required,numeric" example:"30"`
}
type UpdateExpirationTimeOutput struct {
	ExpirationTime string `json:"expiration_time_utc" validate:"required" example:"2021-01-01 00:00:00"`
}

type SetLatLngInput struct {
	Lat float64 `json:"lat" validate:"required" example:"55.7558"`
	Lng float64 `json:"lng" validate:"required" example:"37.6176"`
}
