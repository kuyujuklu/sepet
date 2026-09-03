package v1

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/admin"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/auth"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/categories"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/client"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/companies"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/courier"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/dishes"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/menus"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/modifiers"
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/routes/orders"
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
	clientRouter := client.New()
	adminRouter := admin.New()
	ordersRouter := orders.New()
	courierRouter := courier.New()
	modifiersRouter := modifiers.New()

	//Without authorization
	router.Route("/auth", authRouter.UnauthorizedRouter)
	router.Route("/company", companiesRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs", pubsRouter.UnauthorizedRouter)
	router.Route("/orders/", ordersRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus", menusRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories", categoriesRouter.UnauthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories/:categoryID<int>/dishes", dishesRouter.UnauthorizedRouter)
	router.Route("/client/", clientRouter.UnauthorizedRouter)
	router.Route("/courier", courierRouter.UnauthorizedRouter)

	//With authorization
	router.Route("/company", companiesRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs", pubsRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/orders/", ordersRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus", menusRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories", categoriesRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/menus/:menuID<int>/categories/:categoryID<int>/dishes", dishesRouter.AuthorizedRouter)
	router.Route("/client/", clientRouter.AuthorizedRouter)
	router.Route("/courier", courierRouter.AuthorizedRouter)
	router.Route("/company/:companyID<int>/pubs/:pubID<int>/modifier-groups", modifiersRouter.AuthorizedRouter)

	//Admin authorization
	router.Route("/admin", adminRouter.Router)
}
