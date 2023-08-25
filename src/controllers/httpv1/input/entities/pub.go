package entities

import "github.com/alexkalak/qrmenu/src/models"

type CreatePubInput struct {
	Name string `json:"name" validate:"required,min=2" example:"My pub name"`
}

func (c *CreatePubInput) ConvertToModel(companyID int) models.Pub {
	pub := models.Pub{
		CompanyID:  uint(companyID),
		Name:       c.Name,
		Color:      "#000000",
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

func (c *UpdatePubInput) ConvertToModel(companyID int, pubID int) models.Pub {
	pub := models.Pub{
		CompanyID:      uint(companyID),
		CurrencyID:     uint(c.CurrencyID),
		Name:           c.Name,
		ColorTheme:     c.ColorTheme,
		Color:          c.Color,
		WifiPassword:   c.WifiPassword,
		Address:        c.Address,
		AdditionalInfo: c.AdditionalInfo,
	}

	pub.ID = uint(c.CompanyID)

	return pub
}

type PubOutput struct {
	ID              int    `json:"id" example:"1"`
	Name            string `json:"name" example:"My pub name"`
	QrCodeFileName  string `json:"qr_code_file_name" example:"my-pub-name.png"`
	ColorTheme      string `json:"color_theme" example:"light"`
	Color           string `json:"color" example:"#ffffff"`
	BgImageFileName string `json:"bg_image_file_name" example:"my-pub-name-bg.png"`
	LogoFileName    string `json:"logo_file_name" example:"my-pub-name-logo.png"`
	WifiPassword    string `json:"wifi_password" example:"12345678"`
	Address         string `json:"address" example:"My pub address"`
	AdditionalInfo  string `json:"additional_info" example:"My pub additional info"`

	CurrencyID int `json:"currency_id"`
	CompanyID  int `json:"company_id"`
}

func (c *PubOutput) ConvertFromModel(pub models.Pub) {
	c.ID = int(pub.ID)
	c.Name = pub.Name
	c.QrCodeFileName = ""
	c.ColorTheme = pub.ColorTheme
	c.Color = pub.Color
	c.BgImageFileName = pub.BgImageFileName
	c.LogoFileName = pub.LogoFileName
	c.WifiPassword = pub.WifiPassword
	c.Address = pub.Address
	c.AdditionalInfo = pub.AdditionalInfo
	c.CurrencyID = int(pub.CurrencyID)
	c.CompanyID = int(pub.CompanyID)
}
