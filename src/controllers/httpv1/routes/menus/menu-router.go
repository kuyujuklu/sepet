package menus

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
	"github.com/alexkalak/qrmenu/src/services/pubservice"
	"github.com/gofiber/fiber/v2"
)

type menuController struct {
	MenuService menuservice.MenuService
	PubService  pubservice.PubService
}

func New() *menuController {
	return &menuController{
		PubService:  pubservice.New(),
		MenuService: menuservice.New(),
	}
}

func (c *menuController) UnauthorizedRouter(router fiber.Router) {}

func (c *menuController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetAllMenus)
	router.Post("/", c.CreateMenu)
	router.Get("/:menuID<int>", c.GetMenuByID)
	router.Put("/:menuID<int>", c.UpdateMenu)
	router.Delete("/:menuID<int>", c.DeleteMenu)
}
