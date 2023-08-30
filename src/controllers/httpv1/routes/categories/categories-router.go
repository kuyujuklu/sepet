package categories

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/categoryservice"
	"github.com/alexkalak/qrmenu/src/services/menuservice"
	"github.com/gofiber/fiber/v2"
)

type categoryController struct {
	CategoryService categoryservice.CategoryService
	MenuService     menuservice.MenuService
}

func New() *categoryController {
	return &categoryController{
		CategoryService: categoryservice.New(),
		MenuService:     menuservice.New(),
	}
}

func (c *categoryController) UnauthorizedRouter(router fiber.Router) {
	router.Get("/:categoryID<int>/image", c.GetCategoryImage)
}

func (c *categoryController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetAllCategories)
	router.Post("/", c.CreateCategory)
	router.Get("/:categoryID<int>", c.GetCategory)
	router.Put("/:categoryID<int>", c.UpdateCategory)
	router.Delete("/:categoryID<int>", c.DeleteCategory)
	router.Patch("/:categoryID<int>/image", c.UploadCategoryImage)
	router.Post("/:categoryID<int>/move-left", c.MoveCategoryLeft)
	router.Post("/:categoryID<int>/move-right", c.MoveCategoryRight)

}
