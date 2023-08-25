package dishes

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
	"github.com/alexkalak/qrmenu/src/services/dishesservice"
	"github.com/gofiber/fiber/v2"
)

type dishesController struct {
	DishService     dishesservice.DishesService
	CategoryService categoryservice.CategoryService
}

func New() *dishesController {
	return &dishesController{
		CategoryService: categoryservice.New(),
		DishService:     dishesservice.New(),
	}
}

func (c *dishesController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/:dishID<int>/image", c.GetDishImage)
}

func (c *dishesController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetAllDishes)
	router.Post("/", c.CreateDish)
	router.Get("/:dishID<int>", c.GetDishByID)
	router.Put("/:dishID<int>", c.UpdateDish)
	router.Delete("/:dishID<int>", c.DeleteDish)
	router.Patch("/:dishID<int>/image", c.UploadDishImage)
}
