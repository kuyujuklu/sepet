package client

import (
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
	"github.com/alexkalak/qrmenu/src/services/dishesservice"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/gofiber/fiber/v2"
)

type clientController struct {
	PubService      pubservice.PubService
	MenuService     menuservice.MenuService
	CategoryService categoryservice.CategoryService
	DishService     dishesservice.DishesService
}

func New() *clientController {
	return &clientController{
		PubService:      pubservice.New(),
		MenuService:     menuservice.New(),
		CategoryService: categoryservice.New(),
		DishService:     dishesservice.New(),
	}
}

func (c *clientController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/pub/:pubName<string>", c.GetPubInfo)
	router.Get("/pub/:pubID<int>/shipping", c.GetShapesForPub)
	router.Get("/pub/:pubID<int>/preorder", c.GetPubPreorder)
}

func (c *clientController) AuthorizedRouter(router fiber.Router) {}
