package v1

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/auth"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/categories"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/companies"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/dishes"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/menus"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/pubs"
	"github.com/gofiber/fiber/v2"
)

func Router(router fiber.Router) {
	router.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello👋 this is api🚀, to get all information📚 you can go to /swagger📮!")
	})

	authRouter := auth.New()
	companiesRouter := companies.New()
	pubsRouter := pubs.New()
	menusRouter := menus.New()
	categoriesRouter := categories.New()
	dishesRouter := dishes.New()

	//Without authorization
	router.Route("/auth", authRouter.UnauthorizedRouter)
	router.Route("/company", companiesRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs", pubsRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus", menusRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories", categoriesRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories/:categoryID<int>/dishes", dishesRouter.UnauthorizedRouter)

	//With authorization
	router.Route("/company", companiesRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs", pubsRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus", menusRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories", categoriesRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories/:categoryID<int>/dishes", dishesRouter.AuthorizedRouter)
}
