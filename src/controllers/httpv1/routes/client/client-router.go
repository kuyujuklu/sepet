package client

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
	"github.com/alexkalak/qrmenu/src/services/clientservice"
	"github.com/alexkalak/qrmenu/src/services/dishesservice"
	"github.com/alexkalak/qrmenu/src/services/googlemapsservice"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/alexkalak/qrmenu/src/services/roleservice"
	"github.com/gofiber/fiber/v2"
)

type clientController struct {
	JwtService        jwtservice.JwtService
	PubService        pubservice.PubService
	MenuService       menuservice.MenuService
	CategoryService   categoryservice.CategoryService
	DishService       dishesservice.DishesService
	ClientService     clientservice.ClientService
	RoleService       roleservice.RoleService
	OrderService      orderservice.OrderService
	GoogleMapsService googlemapsservice.GoogleMapsService
}

func New() *clientController {
	return &clientController{
		JwtService:        jwtservice.New(),
		PubService:        pubservice.New(),
		MenuService:       menuservice.New(),
		CategoryService:   categoryservice.New(),
		DishService:       dishesservice.New(),
		ClientService:     clientservice.New(),
		RoleService:       roleservice.New(),
		OrderService:      orderservice.New(),
		GoogleMapsService: googlemapsservice.New(),
	}
}

func (c *clientController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/pub/:pubName<string>", c.GetPubInfoByUrlName)
	router.Get("/pub/id/:pubID<int>", c.GetPubInfoByID)
	router.Get("/pub/:pubID<int>/shipping", c.GetShapesForPub)
	router.Get("/pub/:pubID<int>/preorder", c.GetPubPreorder)
	router.Post("/registration", c.RegistrateClient)
	router.Post("/authentication", c.AuthenticateClient)
	router.Post("/authentication/refresh-token", c.RefreshToken)
	router.Get("/get-available-pubs", c.GetAvailableForShippingPubs)
	router.Get("/get-available-categories", c.GetAvailableForShippingPubCategories)
}

func (c *clientController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetClient)

	//Orders
	router.Post("/orders", c.CreateOrder)
	router.Get("/orders", c.GetAllOrdersForClient)
}
