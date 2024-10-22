package admin

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/gofiber/fiber/v2"
)

type adminController struct {
	PubService     pubservice.PubService
	CompanyService companyservice.CompanyService
	CourierService courierservice.CourierService
	OrderService   orderservice.OrderService
}

func New() *adminController {
	return &adminController{
		PubService:     pubservice.New(),
		CompanyService: companyservice.New(),
		CourierService: courierservice.New(),
		OrderService:   orderservice.New(),
	}
}

func (c *adminController) Router(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Use(middleware.AdminAuthMW)
	router.Post("/pubs/:pubID<int>/update-expiration-time", c.UpdatePubExpirationTime)
	router.Get("/pubs", c.GetAllPub)
	router.Get("/couriers", c.GetAllCouriers)
	router.Get("/orders", c.GetAllOrders)
	router.Post("/companies/:companyID<int>/update-tariff", c.UpdateCompanyTariff)
}
