package entities

import (
	"fmt"
	"strings"
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
	Name             string `json:"name" validate:"required,min=2" example:"My pub name"`
	ColorTheme       string `json:"color_theme" validate:"" example:"light"`
	Color            string `json:"color" validate:"" example:"#ffffff"`
	WifiPassword     string `json:"wifi_password" validate:"" example:"12345678"`
	Address          string `json:"address" validate:"" example:"My pub address"`
	AdditionalInfo   string `json:"additional_info" validate:"" example:"My pub additional info"`
	TelegramUsername string `json:"telegram_username" validate:"" example:"@my_username"`
	HasInPlaceOrder  bool   `json:"has_in_place_order" validate:"" example:"true"`
	Location         string `json:"location"`
	// food / flowers / groceries - admin-front's PubSettings.jsx already
	// sends this (has for a while), there was just no model field or output
	// wired up to receive/return it. Persisted on the pre-existing but
	// previously-dead models.Pub.PubType column.
	ServiceType string `json:"service_type" example:"food"`

	CurrencyID int `json:"currency_id" example:"22"`
	CompanyID  int `json:"company_id" example:"1"`
}

func (p *UpdatePubInput) ConvertToModel(companyID int, pubID int) models.Pub {
	telegramUsernameWithoutAtSign := strings.Replace(p.TelegramUsername, "@", "", 1)
	pub := models.Pub{
		CompanyID:        uint(companyID),
		CurrencyID:       uint(p.CurrencyID),
		Name:             p.Name,
		ColorTheme:       p.ColorTheme,
		Color:            p.Color,
		WifiPassword:     p.WifiPassword,
		Address:          p.Address,
		AdditionalInfo:   p.AdditionalInfo,
		TelegramUsername: telegramUsernameWithoutAtSign,
		HasInPlaceOrder:  p.HasInPlaceOrder,
		PubType:          p.ServiceType,
	}

	pub.ID = uint(p.CompanyID)

	return pub
}

type PubOutput struct {
	ID               int             `json:"id" example:"1"`
	CompanyEmail     string          `json:"copmany_email" example:"email@email.com"`
	Expired          bool            `json:"expired" example:"false"`
	ExpirationTime   string          `json:"expiration_time_utc" example:""`
	Name             string          `json:"name" example:"My pub name"`
	UrlName          string          `json:"url_name" example:"my-pub-name"`
	QrCodeFileName   string          `json:"qr_code_file_name" example:"my-pub-name.png"`
	ColorTheme       string          `json:"color_theme" example:"light"`
	Color            string          `json:"color" example:"#ffffff"`
	BgImageFileName  string          `json:"bg_image_file_name" example:"my-pub-name-bg.png"`
	LogoFileName     string          `json:"logo_file_name" example:"my-pub-name-logo.png"`
	WifiPassword     string          `json:"wifi_password" example:"12345678"`
	Address          string          `json:"address" example:"My pub address"`
	AdditionalInfo   string          `json:"additional_info" example:"My pub additional info"`
	ShippingOutput   ShippingOutput  `json:"shipping"`
	Lat              float64         `json:"lat" example:"55.7558"`
	Lng              float64         `json:"lng" example:"37.6176"`
	CurrencyID       int             `json:"currency_id"`
	CompanyID        int             `json:"company_id"`
	TelegramUserName string          `json:"telegram_username"`
	HasInPlaceOrder  bool            `json:"has_in_place_order"`
	Couriers         []CourierOutput `json:"couriers"`
	Rating           float64         `json:"rating"`
	// Section is the canonical field (matches admin-front's PubSettings.jsx
	// read side and front's sections.js); ServiceTypes is the same value as
	// a single-item array for callers that read that name instead - both
	// map to the one models.Pub.PubType column, there is no second concept.
	Section      string   `json:"section" example:"food"`
	ServiceTypes []string `json:"service_types"`
}

// defaultPubSection mirrors admin-front's defaultServiceType ("food") and
// pubservice.DEFAULT_PUB_SECTION - every pub predates the service_type
// column, so an unset PubType means food, not "no section". Needed here too:
// admin-front's edit form falls back to the default with `pub.section ??
// defaultServiceType`, and `??` does not trigger on an empty string, only on
// null/undefined - returning "" would show the dropdown as unset instead of
// defaulting to Food for every pub that hasn't been re-saved yet.
const defaultPubSection = "food"

// sectionToServiceTypes mirrors a pub's single service-type value into the
// array shape some callers read instead of `section`.
func sectionToServiceTypes(section string) []string {
	return []string{section}
}

// resolvePubSection applies the same empty-means-food fallback everywhere a
// pub's section is read from PubType, so admin-front, front and app all see
// one consistent value instead of each guessing their own default.
func resolvePubSection(pubType string) string {
	if pubType == "" {
		return defaultPubSection
	}
	return pubType
}

func (p *PubOutput) FillFromModel(pub models.Pub) error {
	if time.Now().Unix() > pub.ExpirationTime.Unix() {
		p.Expired = true
	}

	if pub.Shipping.Available {
		shippingOutput := ShippingOutput{}
		if err := shippingOutput.FillFromModel(pub.Shipping); err != nil {
			fmt.Println("Error in shipping filling from model entities/pub.go")
		}

		p.ShippingOutput = shippingOutput
	}

	p.CompanyEmail = pub.Company.Email
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
	p.TelegramUserName = pub.TelegramUsername
	p.HasInPlaceOrder = pub.HasInPlaceOrder
	p.Rating = pub.Rating
	p.Section = resolvePubSection(pub.PubType)
	p.ServiceTypes = sectionToServiceTypes(p.Section)

	for _, courier := range pub.Couriers {
		courierOutput := CourierOutput{}
		courierOutput.FillFromModel(courier)
		p.Couriers = append(p.Couriers, courierOutput)
	}

	return nil
}

type PubWithDishesAndDistanceOutput struct {
	PubOutput
	Distance                  int          `json:"distance"`
	ShippingPrice             float64      `json:"shipping_price"`
	ShippingFreeDeliveryPrice float64      `json:"shipping_free_delivery_price"`
	Dishes                    []DishOutput `json:"dishes"`
}

func (p *PubWithDishesAndDistanceOutput) FillFromModel(pub models.Pub, distance int, dishes []models.Dish) error {
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
	p.Rating = pub.Rating
	p.Section = resolvePubSection(pub.PubType)
	p.ServiceTypes = sectionToServiceTypes(p.Section)

	p.Dishes = make([]DishOutput, 0, len(dishes))

	p.Distance = distance

	for _, dish := range dishes {
		dishOutput := DishOutput{}
		dishOutput.FillFromModel(dish)
		p.Dishes = append(p.Dishes, dishOutput)
	}

	for _, courier := range pub.Couriers {
		courierOutput := CourierOutput{}
		courierOutput.FillFromModel(courier)
		p.Couriers = append(p.Couriers, courierOutput)
	}

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

type PubCourierActionInput struct {
	CourierID int `json:"courier_id"`
}

type SetDeliveryType struct {
	DeliveryType string `json:"delivery_type"`
}

type SetAddCommissionToDishPricesInput struct {
	AddCommissionToDishPrices bool `json:"add_commission_to_dish_prices"`
}
