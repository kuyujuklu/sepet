package entities

import "github.com/alexkalak/qrmenu/src/models"

// TopDishPubSummary is embedded on every dish in the top-dishes feed so a
// client can price and link to the dish without a second request per the
// front/app doc comments on this endpoint.
type TopDishPubSummary struct {
	ID           int    `json:"id"`
	UrlName      string `json:"url_name" example:"my-pub-name"`
	Name         string `json:"name" example:"My pub name"`
	LogoFileName string `json:"logo_file_name"`
	CurrencyID   int    `json:"currency_id"`
	IsOpen       bool   `json:"is_open"`

	// Flat, not nested under "shipping" - countCommissionForPub on both
	// clients already accepts either shape, flat matches how this same feed
	// already reports shipping_price/shipping_free_delivery_price elsewhere.
	DeliveryType               string `json:"delivery_type"`
	AddCommissionToDishPrices  bool   `json:"add_commission_to_dish_prices"`
	CommissionForDishPrices    int    `json:"commission_for_dish_prices"`
}

func (p *TopDishPubSummary) FillFromModel(pub models.Pub, isOpen bool) {
	p.ID = int(pub.ID)
	p.UrlName = pub.UrlName
	p.Name = pub.Name
	p.LogoFileName = pub.LogoFileName
	p.CurrencyID = int(pub.CurrencyID)
	p.IsOpen = isOpen
	p.DeliveryType = pub.Shipping.DeliveryType
	p.AddCommissionToDishPrices = pub.Shipping.AddCommissionToDishPrices
	p.CommissionForDishPrices = models.DELIVERY_SERVICE_DISHES_COMMISSION_IN_PERCENT
}

type TopDishOutput struct {
	ID            int               `json:"id"`
	Name          string            `json:"name" example:"My dish name"`
	Price         float64           `json:"price"`
	SalePrice     float64           `json:"sale_price"`
	Available     bool              `json:"available"`
	IsHit         bool              `json:"is_hit"`
	ImageFileName string            `json:"image_file_name"`
	Pub           TopDishPubSummary `json:"pub"`
}

func (d *TopDishOutput) FillFromModel(dish models.Dish, pub models.Pub, isOpen bool) {
	d.ID = int(dish.ID)
	d.Name = dish.Name
	d.Price = dish.Price
	d.SalePrice = dish.SalePrice
	d.Available = dish.Available
	d.IsHit = dish.IsHit
	d.ImageFileName = dish.ImageFileName

	pubSummary := TopDishPubSummary{}
	pubSummary.FillFromModel(pub, isOpen)
	d.Pub = pubSummary
}
